import io
import base64
import secrets
import hashlib
import hmac
from datetime import datetime, timedelta

import qrcode
from django.db import transaction
from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.bookings.models import Booking
from .models import CheckInPass, CheckInEvent


class CheckInService:
    @staticmethod
    def mask_student_id(raw_id):
        """
        Masks enrollment/student ID to protect privacy, e.g.:
        STU-001 -> STU-***1
        MCA-2026-042 -> MCA-****-042
        """
        if not raw_id:
            return "N/A"
        raw_id = str(raw_id).strip()
        if len(raw_id) <= 4:
            return raw_id[0] + "*" * (len(raw_id) - 1)
        prefix = raw_id[:3]
        suffix = raw_id[-3:]
        return f"{prefix}-****-{suffix}"

    @classmethod
    def compute_raw_token(cls, booking_id, version, salt):
        """
        Computes the opaque pass token using HMAC-SHA256 with the server SECRET_KEY.
        The raw token is NEVER persisted in the database.
        Only the SHA-256 hash of this raw token is persisted in CheckInPass.token_hash.
        """
        secret = getattr(settings, 'SECRET_KEY', 'default-key').encode('utf-8')
        payload = f"{booking_id}:{version}:{salt}".encode('utf-8')
        digest = hmac.new(secret, payload, hashlib.sha256).hexdigest()
        return f"LIBPASS_{digest[:40]}"

    @staticmethod
    def hash_token(raw_token):
        """
        Returns the SHA-256 hexadecimal hash of the raw token.
        Only this hash is stored in the database.
        """
        if not raw_token:
            return ""
        return hashlib.sha256(raw_token.strip().encode('utf-8')).hexdigest()

    @classmethod
    def generate_qr_data_uri(cls, raw_token):
        """
        Encodes the opaque token into a high-contrast QR code PNG image
        and returns it as a Base64 Data URI in memory.
        Theme: Deep Ink Navy (#243447) foreground on White background.
        """
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=3,
        )
        qr.add_data(raw_token)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#243447", back_color="#FFFFFF")

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{b64_str}"

    @classmethod
    def get_or_issue_pass(cls, booking, force_refresh=False):
        """
        Retrieves or generates a unique digital QR check-in pass for a confirmed booking.
        Enforces:
        - Cancelled bookings cannot obtain a pass.
        - Expired bookings cannot obtain a pass.
        - Inactive users cannot obtain a pass.
        - Never persists recoverable raw QR credentials inside database images.
        - Dynamically generates the QR PNG in-memory when requested by an authorized user.
        - When refreshed, increments version and regenerates salt, invalidating the previous token.
        """
        if booking.booking_status == 'CANCELLED':
            raise ValidationError("Check-in pass is not available for a cancelled booking.")

        if booking.booking_status != 'CONFIRMED':
            raise ValidationError(f"Check-in pass is not available for a {booking.booking_status.lower()} booking.")

        if not booking.user.is_active or booking.user.account_status != 'ACTIVE':
            raise ValidationError("Student account is currently inactive. Contact the library administrator.")

        # Compute validity window based on reservation date and slot times
        tz = timezone.get_current_timezone()
        start_naive = datetime.combine(booking.booking_date, booking.slot.start_time)
        end_naive = datetime.combine(booking.booking_date, booking.slot.end_time)

        start_dt = timezone.make_aware(start_naive, tz) if timezone.is_naive(start_naive) else start_naive
        end_dt = timezone.make_aware(end_naive, tz) if timezone.is_naive(end_naive) else end_naive

        early_mins = getattr(settings, 'CHECKIN_EARLY_ARRIVAL_MINUTES', 15)
        valid_from = start_dt - timedelta(minutes=early_mins)
        expires_at = end_dt

        # Ensure expired bookings cannot obtain usable passes
        if timezone.now() > expires_at:
            raise ValidationError("Check-in pass is no longer available. This reservation session has expired.")

        # Check if pass already exists for this booking
        existing_pass = CheckInPass.objects.filter(booking=booking).first()

        if existing_pass and not force_refresh:
            if not existing_pass.is_revoked and existing_pass.salt:
                raw_token = cls.compute_raw_token(booking.id, existing_pass.version, existing_pass.salt)
                # Attach dynamically in-memory only (never persist to DB)
                existing_pass.qr_data_uri = cls.generate_qr_data_uri(raw_token)
                return existing_pass, None

        # Mint or refresh pass
        with transaction.atomic():
            if existing_pass:
                new_version = existing_pass.version + 1
                new_salt = secrets.token_hex(16)
                raw_token = cls.compute_raw_token(booking.id, new_version, new_salt)
                token_hash = cls.hash_token(raw_token)

                existing_pass.version = new_version
                existing_pass.salt = new_salt
                existing_pass.token_hash = token_hash
                existing_pass.qr_data_uri = ""  # Never persist raw credential image in database!
                existing_pass.valid_from = valid_from
                existing_pass.expires_at = expires_at
                existing_pass.revoked_at = None
                existing_pass.used_at = None
                existing_pass.save()

                existing_pass.qr_data_uri = cls.generate_qr_data_uri(raw_token)
                return existing_pass, raw_token
            else:
                salt = secrets.token_hex(16)
                version = 1
                raw_token = cls.compute_raw_token(booking.id, version, salt)
                token_hash = cls.hash_token(raw_token)

                new_pass = CheckInPass.objects.create(
                    booking=booking,
                    token_hash=token_hash,
                    salt=salt,
                    version=version,
                    qr_data_uri="",  # Never persist raw credential image in database!
                    valid_from=valid_from,
                    expires_at=expires_at,
                )
                new_pass.qr_data_uri = cls.generate_qr_data_uri(raw_token)
                return new_pass, raw_token

    @classmethod
    def verify_and_check_in(cls, raw_token, scanner_user, gate_name='Main Gate 01'):
        """
        Atomically validates a scanned QR token and records the library entry.
        Applies SELECT FOR UPDATE row-level locking on both CheckInPass and Booking
        to prevent duplicate or race condition approvals.
        Ensures raw tokens are never logged or echoed in diagnostic error messages.
        """
        # 1. Scanner authorization check
        is_authorized = (
            scanner_user and
            scanner_user.is_authenticated and
            scanner_user.is_active and
            (scanner_user.role in ['ADMIN', 'LIBRARIAN'] or scanner_user.is_staff or scanner_user.is_superuser)
        )
        if not is_authorized:
            return {
                'approved': False,
                'status_code': 403,
                'reason': "Unauthorized scanner. Only Librarians and Administrators can verify entrance."
            }

        # 2. Token format validation (never echo the raw token)
        clean_token = (raw_token or "").strip()
        if not clean_token or not clean_token.startswith("LIBPASS_"):
            return {
                'approved': False,
                'status_code': 400,
                'reason': "Invalid QR credential. Unrecognized code structure."
            }

        token_hash = cls.hash_token(clean_token)

        # 3. Atomic evaluation under row-level lock
        with transaction.atomic():
            pass_record = CheckInPass.objects.select_for_update().filter(token_hash=token_hash).first()

            if not pass_record:
                return {
                    'approved': False,
                    'status_code': 404,
                    'reason': "Invalid QR code. No active reservation found for this pass."
                }

            booking = Booking.objects.select_for_update().select_related('user', 'seat', 'slot').get(id=pass_record.booking_id)

            # Verification rule checks
            rejection_reason = None

            if pass_record.is_revoked:
                rejection_reason = "QR pass has been invalidated or reissued. Please present latest pass."
            elif pass_record.is_used or booking.checked_in_at is not None:
                rejection_reason = "QR pass has already been used for library entry."
            elif booking.booking_status == 'CANCELLED':
                rejection_reason = "Seat reservation has been cancelled."
            elif booking.booking_status != 'CONFIRMED':
                rejection_reason = f"Reservation is {booking.booking_status.lower()}."
            elif not booking.user.is_active or booking.user.account_status != 'ACTIVE':
                rejection_reason = "Student account is deactivated. Contact library administration."
            elif booking.booking_date != timezone.now().date():
                rejection_reason = f"Booking scheduled for {booking.booking_date.strftime('%d %b %Y')}, not today."
            else:
                now = timezone.now()
                if now < pass_record.valid_from:
                    earliest_time = pass_record.valid_from.strftime('%H:%M')
                    rejection_reason = f"Early arrival. Gate entry opens at {earliest_time} (15 mins before slot)."
                elif now > pass_record.expires_at:
                    rejection_reason = f"Slot concluded at {pass_record.expires_at.strftime('%H:%M')}. Pass has expired."
                else:
                    # Enforce 20-minute arrival grace timer: auto-release if student did not arrive in time
                    grace_mins = getattr(settings, 'NO_SHOW_GRACE_MINUTES', 20)
                    tz = timezone.get_current_timezone()
                    slot_start_naive = datetime.combine(booking.booking_date, booking.slot.start_time)
                    slot_start_dt = timezone.make_aware(slot_start_naive, tz) if timezone.is_naive(slot_start_naive) else slot_start_naive
                    no_show_cutoff = slot_start_dt + timedelta(minutes=grace_mins)

                    if now >= no_show_cutoff:
                        # Auto-release this booking immediately and unlock the seat
                        booking.booking_status = 'CANCELLED'
                        booking.cancelled_at = now
                        booking.cancellation_reason = f"Auto-released: Student did not arrive within {grace_mins}-minute grace period"
                        booking.save(update_fields=['booking_status', 'cancelled_at', 'cancellation_reason', 'updated_at'])
                        pass_record.revoked_at = now
                        pass_record.save(update_fields=['revoked_at', 'updated_at'])

                        rejection_reason = (
                            f"Arrival grace period ({grace_mins} mins) has expired. "
                            f"Seat {booking.seat.seat_number} was automatically unlocked and released for other students."
                        )

            # Record audit event (without logging raw token)
            now_ts = timezone.now()
            masked_id = cls.mask_student_id(booking.user.student_id)

            event = CheckInEvent.objects.create(
                booking=booking,
                pass_record=pass_record,
                scanned_by=scanner_user,
                gate_name=gate_name,
                status='APPROVED' if rejection_reason is None else 'REJECTED',
                rejection_reason=rejection_reason or "",
                student_name=booking.user.full_name,
                student_id_masked=masked_id,
                seat_number=booking.seat.seat_number,
                slot_name=booking.slot.slot_name,
                booking_reference=booking.booking_reference,
            )

            if rejection_reason is not None:
                return {
                    'approved': False,
                    'status_code': 400,
                    'reason': rejection_reason,
                    'booking_reference': booking.booking_reference,
                    'student_name': booking.user.full_name,
                    'student_id_masked': masked_id,
                    'seat_number': booking.seat.seat_number,
                    'slot_name': booking.slot.slot_name,
                    'scanned_at': now_ts.isoformat(),
                }

            # Mark pass and booking as successfully checked-in
            pass_record.used_at = now_ts
            pass_record.save(update_fields=['used_at', 'updated_at'])

            booking.checked_in_at = now_ts
            booking.save(update_fields=['checked_in_at', 'updated_at'])

            return {
                'approved': True,
                'status_code': 200,
                'message': "ENTRY APPROVED — Student reservation verified successfully.",
                'data': {
                    'student_name': booking.user.full_name,
                    'student_id_masked': masked_id,
                    'student_department': booking.user.department or "N/A",
                    'booking_reference': booking.booking_reference,
                    'seat_number': booking.seat.seat_number,
                    'floor': booking.seat.floor,
                    'section': booking.seat.section,
                    'booking_date': str(booking.booking_date),
                    'slot_name': booking.slot.slot_name,
                    'slot_time': f"{booking.slot.start_time.strftime('%H:%M')} - {booking.slot.end_time.strftime('%H:%M')}",
                    'checked_in_at': now_ts.strftime('%d %b %Y, %I:%M:%S %p'),
                    'verified_by': scanner_user.full_name,
                    'gate_name': gate_name,
                }
            }

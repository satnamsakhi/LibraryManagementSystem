from datetime import datetime, timedelta
from django.db import transaction
from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.common.utils import generate_booking_reference
from apps.library.models import Seat, TimeSlot
from .models import Booking
from .validators import validate_seat_not_overlapping, validate_user_not_overlapping

class BookingService:
    @classmethod
    def release_no_show_bookings(cls, grace_minutes=None):
        """
        Scans for confirmed bookings for today where slot.start_time + grace_minutes (default: 20 min)
        has passed, but the student has NOT checked in (checked_in_at is None).
        Automatically cancels these bookings, revokes their digital QR pass, and immediately
        releases the physical seat back to AVAILABLE so other students can reserve it.
        Returns list of released booking dictionaries.
        """
        if grace_minutes is None:
            grace_minutes = getattr(settings, 'NO_SHOW_GRACE_MINUTES', 20)

        now = timezone.now()
        today = now.date()

        released_bookings = []

        with transaction.atomic():
            candidates = Booking.objects.select_for_update().filter(
                booking_status='CONFIRMED',
                checked_in_at__isnull=True
            ).select_related('slot', 'seat', 'user')

            to_release = []
            tz = timezone.get_current_timezone()

            for bk in candidates:
                # Past dates that were never checked in are expired no-shows
                if bk.booking_date < today:
                    to_release.append(bk)
                    continue

                # Today's bookings: check if slot.start_time + grace_minutes has passed
                if bk.booking_date == today and bk.slot:
                    slot_start_naive = datetime.combine(today, bk.slot.start_time)
                    slot_start_dt = timezone.make_aware(slot_start_naive, tz) if timezone.is_naive(slot_start_naive) else slot_start_naive
                    cutoff_dt = slot_start_dt + timedelta(minutes=grace_minutes)

                    if now >= cutoff_dt:
                        to_release.append(bk)

            for bk in to_release:
                bk.booking_status = 'CANCELLED'
                bk.cancelled_at = now
                bk.cancellation_reason = f"Auto-released: Student did not arrive within {grace_minutes}-minute grace period"
                bk.save(update_fields=['booking_status', 'cancelled_at', 'cancellation_reason', 'updated_at'])

                # Revoke associated check-in pass
                from apps.checkin.models import CheckInPass
                CheckInPass.objects.filter(booking=bk, revoked_at__isnull=True).update(revoked_at=now)

                released_bookings.append({
                    'id': bk.id,
                    'booking_reference': bk.booking_reference,
                    'seat_number': bk.seat.seat_number,
                    'floor': bk.seat.floor,
                    'user_email': bk.user.email,
                    'slot_name': bk.slot.slot_name if bk.slot else 'N/A'
                })

        return released_bookings

    @classmethod
    def create_reservation(cls, user, seat, slot, booking_date):
        """
        Atomically validates and creates a new seat reservation.
        Applies SELECT FOR UPDATE row-level locking on the physical seat
        to eliminate race conditions and double bookings under concurrent requests.
        """
        # Proactively release any 20-minute no-shows so their seats are freed
        cls.release_no_show_bookings()

        with transaction.atomic():
            # Acquire exclusive row lock on the target seat for the duration of this transaction
            locked_seat = Seat.objects.select_for_update().get(id=seat.id)

            if not locked_seat.is_active or locked_seat.is_under_maintenance:
                raise ValidationError(f"Seat {locked_seat.seat_number} is not currently operational.")

            # Double-check inside locked transaction to prevent concurrent race condition
            validate_seat_not_overlapping(locked_seat, booking_date, slot)
            validate_user_not_overlapping(user, booking_date, slot)

            # Generate unique booking reference
            ref = generate_booking_reference()
            while Booking.objects.filter(booking_reference=ref).exists():
                ref = generate_booking_reference()

            booking = Booking.objects.create(
                booking_reference=ref,
                user=user,
                seat=locked_seat,
                slot=slot,
                booking_date=booking_date,
                booking_status='CONFIRMED'
            )

            return booking

    @staticmethod
    def cancel_reservation(booking, cancelled_by_user, reason="Cancelled by user"):
        """
        Cancels an eligible booking, marking it CANCELLED and immediately releasing the seat.
        """
        if booking.booking_status == 'CANCELLED':
            raise ValidationError("This booking has already been cancelled.")

        if booking.booking_status == 'COMPLETED':
            raise ValidationError("Cannot cancel a completed booking.")

        # Permission check: Only the booking owner or an administrator can cancel
        is_admin = cancelled_by_user.role == 'ADMIN' or cancelled_by_user.is_staff or cancelled_by_user.is_superuser
        if booking.user_id != cancelled_by_user.id and not is_admin:
            raise ValidationError("You do not have permission to cancel another student's booking.")

        with transaction.atomic():
            booking.booking_status = 'CANCELLED'
            booking.cancelled_at = timezone.now()
            booking.cancellation_reason = reason
            booking.save(update_fields=['booking_status', 'cancelled_at', 'cancellation_reason', 'updated_at'])

        return booking

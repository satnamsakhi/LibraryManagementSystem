import threading
from datetime import date, time, timedelta

from django.test import TransactionTestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.library.models import Seat, TimeSlot
from apps.bookings.models import Booking
from apps.checkin.models import CheckInPass, CheckInEvent
from apps.checkin.services import CheckInService


class CheckInSystemTests(TransactionTestCase):
    """
    Comprehensive QR check-in & gate verification tests running against MySQL InnoDB.
    """
    def setUp(self):
        self.client = APIClient()

        # Admin
        self.admin = User.objects.create_superuser(
            email='qr.admin@library.edu',
            password='AdminPassword@123',
            full_name='Gate Overseer Admin',
            role='ADMIN',
        )
        self.admin_token = str(RefreshToken.for_user(self.admin).access_token)

        # Gate Staff / Librarian
        self.librarian = User.objects.create_user(
            email='gate.librarian@library.edu',
            password='StaffPassword@123',
            full_name='Officer Sarah (Gate)',
            role='LIBRARIAN',
            account_status='ACTIVE',
        )
        self.librarian_token = str(RefreshToken.for_user(self.librarian).access_token)

        # Student 1 (Booking Owner)
        self.student1 = User.objects.create_user(
            email='qr.student1@student.edu',
            password='StudentPassword@123',
            full_name='Alice QR',
            student_id='MCA-2024-901',
            role='STUDENT',
            account_status='ACTIVE',
        )
        self.student1_token = str(RefreshToken.for_user(self.student1).access_token)

        # Student 2 (Other Student)
        self.student2 = User.objects.create_user(
            email='qr.student2@student.edu',
            password='StudentPassword@123',
            full_name='Bob Impersonator',
            student_id='MCA-2024-902',
            role='STUDENT',
            account_status='ACTIVE',
        )
        self.student2_token = str(RefreshToken.for_user(self.student2).access_token)

        # Seat & Slot
        self.seat = Seat.objects.create(
            seat_number='QR-01',
            floor='First Floor',
            section='Silent Study',
            seat_type='REGULAR',
            is_active=True,
        )
        # Create a slot covering current time so check-in window is open today
        now = timezone.now()
        start = (now - timedelta(minutes=10)).time()
        end = (now + timedelta(hours=2)).time()
        self.active_slot = TimeSlot.objects.create(
            slot_name='Active Testing Window Slot',
            start_time=start,
            end_time=end,
            is_active=True,
        )

        # Booking for Today
        self.booking = Booking.objects.create(
            booking_reference='LIB-TEST-QR001',
            user=self.student1,
            seat=self.seat,
            slot=self.active_slot,
            booking_date=timezone.now().date(),
            booking_status='CONFIRMED',
        )

        self.pass_url = reverse('booking_checkin_pass', kwargs={'booking_id': self.booking.id})
        self.reissue_url = reverse('booking_checkin_pass_issue', kwargs={'booking_id': self.booking.id})
        self.gate_checkin_url = reverse('gate_check_in')

    def test_qr_generation_after_booking_confirmation(self):
        """Student receives unique QR pass with valid Base64 PNG image."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        response = self.client.get(self.pass_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(data['booking_reference'], 'LIB-TEST-QR001')
        self.assertTrue(data['qr_data_uri'].startswith('data:image/png;base64,'))
        self.assertIn('MCA-****-901', data['student_id_masked'])
        self.assertTrue(data['is_currently_valid'])

        # Security check: verify DB stores only SHA-256 hash and NO image data
        db_record = CheckInPass.objects.get(booking=self.booking)
        self.assertEqual(len(db_record.token_hash), 64)
        self.assertEqual(db_record.qr_data_uri, "")

    def test_cancelled_booking_cannot_obtain_pass(self):
        """Cancelled bookings cannot obtain a digital QR pass."""
        self.booking.booking_status = 'CANCELLED'
        self.booking.save()

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        response = self.client.get(self.pass_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cancelled', str(response.data['message']).lower())

    def test_expired_booking_cannot_obtain_pass(self):
        """Expired session bookings cannot obtain a digital QR pass."""
        expired_slot = TimeSlot.objects.create(
            slot_name='Past Slot',
            start_time=time(6, 0),
            end_time=time(7, 0),
            is_active=True,
        )
        expired_booking = Booking.objects.create(
            booking_reference='LIB-TEST-EXPIRED',
            user=self.student1,
            seat=self.seat,
            slot=expired_slot,
            booking_date=timezone.now().date() - timedelta(days=1),
            booking_status='CONFIRMED',
        )
        expired_url = reverse('booking_checkin_pass', kwargs={'booking_id': expired_booking.id})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        response = self.client.get(expired_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', str(response.data['message']).lower())

    def test_unauthorized_student_denied_another_students_qr(self):
        """Student 2 cannot access Student 1's QR entry pass."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student2_token}')
        response = self.client.get(self.pass_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_valid_qr_verification_by_librarian_approved(self):
        """Librarian scans valid QR pass: gate entry is approved and logged."""
        # 1. Issue pass to get raw token
        pass_obj, raw_token = CheckInService.get_or_issue_pass(self.booking, force_refresh=True)

        # 2. Gate librarian scans token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.librarian_token}')
        response = self.client.post(self.gate_checkin_url, {
            'token': raw_token,
            'gate_name': 'Turnstile North A'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn("ENTRY APPROVED", response.data['message'])

        # Verify database records
        self.booking.refresh_from_db()
        self.assertIsNotNone(self.booking.checked_in_at)
        pass_obj.refresh_from_db()
        self.assertTrue(pass_obj.is_used)

        # Verify audit event logged
        event = CheckInEvent.objects.filter(booking=self.booking).first()
        self.assertIsNotNone(event)
        self.assertEqual(event.status, 'APPROVED')
        self.assertEqual(event.scanned_by, self.librarian)

    def test_duplicate_scan_rejected(self):
        """A QR code cannot be scanned twice for library entry."""
        pass_obj, raw_token = CheckInService.get_or_issue_pass(self.booking, force_refresh=True)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.librarian_token}')

        # First scan -> Approved
        resp1 = self.client.post(self.gate_checkin_url, {'token': raw_token}, format='json')
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)

        # Second scan -> Rejected
        resp2 = self.client.post(self.gate_checkin_url, {'token': raw_token}, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already been used", str(resp2.data['message']).lower())

    def test_qr_reissue_invalidates_earlier_pass(self):
        """Reissuing a pass invalidates the previously minted QR code token."""
        # 1. Initial pass token
        pass1, token1 = CheckInService.get_or_issue_pass(self.booking, force_refresh=True)

        # 2. Student clicks "Refresh QR Pass"
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        reissue_resp = self.client.post(self.reissue_url)
        self.assertEqual(reissue_resp.status_code, status.HTTP_200_OK)

        # 3. Scanning token1 is now rejected (token hash changed)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.librarian_token}')
        scan_old = self.client.post(self.gate_checkin_url, {'token': token1}, format='json')
        self.assertEqual(scan_old.status_code, status.HTTP_404_NOT_FOUND)

    def test_cancelled_booking_qr_rejected(self):
        """Cancelled booking QR codes are rejected at the gate."""
        pass_obj, raw_token = CheckInService.get_or_issue_pass(self.booking, force_refresh=True)

        # Cancel booking
        self.booking.booking_status = 'CANCELLED'
        self.booking.save()

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.librarian_token}')
        response = self.client.post(self.gate_checkin_url, {'token': raw_token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cancelled", str(response.data['message']).lower())

    def test_inactive_student_qr_rejected(self):
        """Suspended/deactivated student's QR is rejected at the gate."""
        pass_obj, raw_token = CheckInService.get_or_issue_pass(self.booking, force_refresh=True)

        # Deactivate student
        self.student1.account_status = 'INACTIVE'
        self.student1.is_active = False
        self.student1.save()

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.librarian_token}')
        response = self.client.post(self.gate_checkin_url, {'token': raw_token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("deactivated", str(response.data['message']).lower())

    def test_student_denied_gate_scanner_access(self):
        """Students cannot call the staff gate check-in endpoint (HTTP 403)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student1_token}')
        response = self.client.post(self.gate_checkin_url, {'token': 'LIBPASS_dummy'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_two_simultaneous_scans_only_one_succeeds(self):
        """
        Concurrency test on MySQL InnoDB: Two staff scanners scan the exact same QR
        at the same microsecond. SELECT FOR UPDATE guarantees exactly 1 APPROVED.
        """
        pass_obj, raw_token = CheckInService.get_or_issue_pass(self.booking, force_refresh=True)

        outcomes = []
        barrier = threading.Barrier(2)

        def worker(scanner_user):
            barrier.wait()
            res = CheckInService.verify_and_check_in(
                raw_token=raw_token,
                scanner_user=scanner_user,
                gate_name='Concurrent Gate'
            )
            outcomes.append(res['approved'])

        t1 = threading.Thread(target=worker, args=(self.librarian,))
        t2 = threading.Thread(target=worker, args=(self.admin,))
        t1.start(); t2.start()
        t1.join(timeout=10); t2.join(timeout=10)

        approved_count = outcomes.count(True)
        rejected_count = outcomes.count(False)

        self.assertEqual(len(outcomes), 2)
        self.assertEqual(approved_count, 1, f"Expected exactly 1 approval, got {approved_count}")
        self.assertEqual(rejected_count, 1, f"Expected exactly 1 rejection, got {rejected_count}")

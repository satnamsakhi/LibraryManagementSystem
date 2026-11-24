from datetime import time, date, timedelta
from django.utils import timezone
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.library.models import Seat, TimeSlot
from apps.bookings.models import Booking

class BookingBusinessLogicTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Two active students
        self.student1 = User.objects.create_user(
            email='alice@univ.edu',
            password='Password@123',
            full_name='Alice Smith',
            role='STUDENT',
            account_status='ACTIVE'
        )
        self.student2 = User.objects.create_user(
            email='bob@univ.edu',
            password='Password@123',
            full_name='Bob Jones',
            role='STUDENT',
            account_status='ACTIVE'
        )
        # Inactive student
        self.inactive_student = User.objects.create_user(
            email='inactive@univ.edu',
            password='Password@123',
            full_name='Inactive Student',
            role='STUDENT',
            account_status='INACTIVE'
        )
        # Admin
        self.admin = User.objects.create_superuser(
            email='admin@univ.edu',
            password='AdminPassword@123',
            full_name='Admin User'
        )

        # Operational Seats
        self.seat_a = Seat.objects.create(
            seat_number='S-10',
            floor='First Floor',
            section='Silent Zone',
            seat_type='REGULAR',
            is_active=True,
            is_under_maintenance=False
        )
        self.seat_b = Seat.objects.create(
            seat_number='S-20',
            floor='First Floor',
            section='Silent Zone',
            seat_type='REGULAR',
            is_active=True,
            is_under_maintenance=False
        )
        # Maintenance seat
        self.seat_maint = Seat.objects.create(
            seat_number='S-99',
            floor='First Floor',
            section='Silent Zone',
            seat_type='REGULAR',
            is_active=True,
            is_under_maintenance=True
        )

        # Time slots
        # Slot 1: 09:00 - 11:00
        self.slot1 = TimeSlot.objects.create(
            slot_name='Slot 1 (09:00-11:00)',
            start_time=time(9, 0),
            end_time=time(11, 0),
            is_active=True
        )
        # Slot 2 (Overlapping with Slot 1): 10:00 - 12:00
        self.slot_overlap = TimeSlot.objects.create(
            slot_name='Slot Overlap (10:00-12:00)',
            start_time=time(10, 0),
            end_time=time(12, 0),
            is_active=True
        )
        # Slot 3 (Non-overlapping): 14:00 - 16:00
        self.slot_afternoon = TimeSlot.objects.create(
            slot_name='Slot Afternoon (14:00-16:00)',
            start_time=time(14, 0),
            end_time=time(16, 0),
            is_active=True
        )

        self.booking_url = reverse('booking_create')
        self.future_date = (date.today() + timedelta(days=2)).strftime('%Y-%m-%d')

    def test_successful_booking_creation(self):
        self.client.force_authenticate(user=self.student1)
        payload = {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }
        response = self.client.post(self.booking_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('LIB-', response.data['data']['booking_reference'])
        self.assertEqual(response.data['data']['booking_status'], 'CONFIRMED')

    def test_duplicate_booking_prevention(self):
        self.client.force_authenticate(user=self.student1)
        payload = {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }
        # First booking succeeds
        r1 = self.client.post(self.booking_url, payload, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)

        # Immediate second identical request fails
        r2 = self.client.post(self.booking_url, payload, format='json')
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_overlapping_seat_booking_prevention(self):
        """
        Student 1 reserves Seat A in 09:00-11:00.
        Student 2 attempts to reserve same Seat A in 10:00-12:00 (overlapping interval).
        Must be prevented!
        """
        # Student 1 books Slot 1
        self.client.force_authenticate(user=self.student1)
        r1 = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)

        # Student 2 tries to book overlapping Slot on the same seat
        self.client.force_authenticate(user=self.student2)
        r2 = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot_overlap.id,
            'booking_date': self.future_date
        }, format='json')
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already reserved', str(r2.data).lower())

    def test_overlapping_user_booking_prevention(self):
        """
        Student 1 reserves Seat A in 09:00-11:00.
        Student 1 tries to reserve Seat B in 10:00-12:00 on the same day.
        Must be prevented (student cannot be in two seats at overlapping times).
        """
        self.client.force_authenticate(user=self.student1)
        # Book Seat A
        r1 = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)

        # Book Seat B in overlapping slot
        r2 = self.client.post(self.booking_url, {
            'seat_id': self.seat_b.id,
            'slot_id': self.slot_overlap.id,
            'booking_date': self.future_date
        }, format='json')
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already hold an active reservation', str(r2.data).lower())

    def test_booking_cancellation_and_seat_rebooking(self):
        """
        Student 1 reserves Seat A, then cancels it.
        Student 2 can then reserve Seat A for that exact same slot and date.
        """
        # Step 1: Student 1 books
        self.client.force_authenticate(user=self.student1)
        r1 = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        booking_id = r1.data['data']['id']

        # Step 2: Student 1 cancels
        cancel_url = reverse('booking_cancel', kwargs={'id': booking_id})
        r_cancel = self.client.post(cancel_url, {'cancellation_reason': 'Changed my study plan'}, format='json')
        self.assertEqual(r_cancel.status_code, status.HTTP_200_OK)
        self.assertEqual(r_cancel.data['data']['booking_status'], 'CANCELLED')

        # Step 3: Student 2 now reserves the same seat and slot
        self.client.force_authenticate(user=self.student2)
        r2 = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }, format='json')
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r2.data['data']['booking_status'], 'CONFIRMED')

    def test_unauthorized_cancellation_rejected(self):
        """
        Student 2 cannot cancel Student 1's booking.
        """
        self.client.force_authenticate(user=self.student1)
        r1 = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }, format='json')
        booking_id = r1.data['data']['id']

        # Student 2 tries to cancel
        self.client.force_authenticate(user=self.student2)
        cancel_url = reverse('booking_cancel', kwargs={'id': booking_id})
        r_cancel = self.client.post(cancel_url, format='json')
        self.assertEqual(r_cancel.status_code, status.HTTP_403_FORBIDDEN)

    def test_past_date_booking_rejected(self):
        self.client.force_authenticate(user=self.student1)
        past_date = (date.today() - timedelta(days=2)).strftime('%Y-%m-%d')
        response = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': past_date
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_maintenance_seat_booking_rejected(self):
        self.client.force_authenticate(user=self.student1)
        response = self.client.post(self.booking_url, {
            'seat_id': self.seat_maint.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('maintenance', str(response.data).lower())

    def test_inactive_student_booking_rejected(self):
        self.client.force_authenticate(user=self.inactive_student)
        response = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': self.slot1.id,
            'booking_date': self.future_date
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not active', str(response.data).lower())

    def test_twenty_minute_no_show_auto_releases_seat_to_another_student(self):
        """
        Verify that if student 1 does not check in within 20 minutes of slot start time,
        their booking is automatically cancelled, the seat is unlocked, and student 2
        can reserve that exact same desk immediately.
        """
        from apps.bookings.services import BookingService
        from apps.checkin.models import CheckInPass
        from apps.checkin.services import CheckInService
        from datetime import datetime, time

        today = timezone.localdate()
        now_local = timezone.localtime()
        # Create a slot that started 25 minutes ago (exceeding 20-min grace period)
        past_start = (now_local - timedelta(minutes=25)).time()
        past_end = (now_local + timedelta(hours=1)).time()
        test_slot = TimeSlot.objects.create(
            slot_name='No-Show Test Window',
            start_time=past_start,
            end_time=past_end,
            is_active=True,
        )

        # Student 1 books the seat
        booking1 = Booking.objects.create(
            booking_reference='LIB-TEST-NOSHOW01',
            user=self.student1,
            seat=self.seat_a,
            slot=test_slot,
            booking_date=today,
            booking_status='CONFIRMED',
            checked_in_at=None,
        )
        pass1, _ = CheckInService.get_or_issue_pass(booking1)

        # Trigger auto-release with 20-minute grace window
        released = BookingService.release_no_show_bookings(grace_minutes=20)
        self.assertIn(booking1.id, [b['id'] for b in released])

        # Booking 1 must now be CANCELLED with exact no-show reason
        booking1.refresh_from_db()
        self.assertEqual(booking1.booking_status, 'CANCELLED')
        self.assertEqual(booking1.cancellation_reason, 'Auto-released: Student did not arrive within 20-minute grace period')
        self.assertIsNotNone(booking1.cancelled_at)

        # CheckInPass must be revoked
        pass1.refresh_from_db()
        self.assertTrue(pass1.is_revoked)

        # Student 2 now reserves the exact same seat and slot successfully
        self.client.force_authenticate(user=self.student2)
        resp2 = self.client.post(self.booking_url, {
            'seat_id': self.seat_a.id,
            'slot_id': test_slot.id,
            'booking_date': today.strftime('%Y-%m-%d')
        }, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp2.data['data']['booking_status'], 'CONFIRMED')
        self.assertEqual(resp2.data['data']['seat']['id'], self.seat_a.id)

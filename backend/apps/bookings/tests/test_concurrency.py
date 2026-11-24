"""
Concurrent Booking Test — MySQL InnoDB ONLY
============================================
Tests that select_for_update() row-level locking prevents double-booking
when two users attempt to reserve the same seat/slot simultaneously.

IMPORTANT: Must use TransactionTestCase (not TestCase).
           TestCase wraps everything in one transaction and
           select_for_update() cannot acquire locks against itself.

Run only this test:
    venv\\Scripts\\python.exe manage.py test apps.bookings.tests.test_concurrency --verbosity=2
"""
import threading
from datetime import date, timedelta

from django.test import TransactionTestCase

from apps.accounts.models import User
from apps.bookings.models import Booking
from apps.bookings.services import BookingService
from apps.library.models import Seat, TimeSlot


class ConcurrentBookingTest(TransactionTestCase):
    """Two users try to book the SAME seat+slot+date at exactly the same time."""

    def setUp(self):
        # Admin user (required for create_superuser)
        self.admin = User.objects.create_superuser(
            email='concurrency_admin@library.edu',
            password='AdminPass@123',
            full_name='Concurrency Admin',
        )

        # Two student users
        self.student1 = User.objects.create_user(
            email='concurrent_student1@student.edu',
            password='StudentPass@123',
            full_name='Alice Concurrent',
            role='STUDENT',
            account_status='ACTIVE',
        )
        self.student2 = User.objects.create_user(
            email='concurrent_student2@student.edu',
            password='StudentPass@123',
            full_name='Bob Concurrent',
            role='STUDENT',
            account_status='ACTIVE',
        )

        # One seat — floor must match FLOOR_CHOICES
        self.seat = Seat.objects.create(
            seat_number='C-TEST-01',
            section='Test Section',
            floor='First Floor',
            seat_type='REGULAR',
            is_active=True,
            is_under_maintenance=False,
        )

        # One time slot — slot_name field (not 'name')
        self.slot = TimeSlot.objects.create(
            slot_name='Concurrency Test Slot',
            start_time='10:00:00',
            end_time='12:00:00',
            is_active=True,
        )

        # Tomorrow as target booking date
        self.booking_date = date.today() + timedelta(days=1)

    def test_concurrent_booking_only_one_succeeds(self):
        """
        Spawn two threads simultaneously, each trying to book the same seat/slot/date.
        Only one should succeed; the other must raise a validation error.
        MySQL InnoDB SELECT FOR UPDATE guarantees this at the DB level.
        """
        results = []
        errors = []
        lock = threading.Lock()

        def try_book(user, barrier):
            # Both threads reach the barrier before either calls create_reservation.
            # This maximises the chance of a true race condition.
            barrier.wait()
            try:
                booking = BookingService.create_reservation(
                    user=user,
                    seat=self.seat,
                    slot=self.slot,
                    booking_date=self.booking_date,
                )
                with lock:
                    results.append(('success', booking.id, booking.booking_reference))
            except Exception as exc:
                with lock:
                    errors.append(('failed', str(exc)))

        # Synchronisation barrier: both threads released simultaneously
        barrier = threading.Barrier(2)

        t1 = threading.Thread(target=try_book, args=(self.student1, barrier))
        t2 = threading.Thread(target=try_book, args=(self.student2, barrier))

        t1.start()
        t2.start()
        t1.join(timeout=15)
        t2.join(timeout=15)

        all_results = results + errors
        self.assertEqual(
            len(all_results), 2,
            f"Expected 2 outcomes total, got {len(all_results)}: results={results} errors={errors}"
        )

        successes = [r for r in results if r[0] == 'success']
        failures = [r for r in errors if r[0] == 'failed']

        self.assertEqual(
            len(successes), 1,
            f"Expected exactly 1 successful booking, got {len(successes)}.\n"
            f"Results: {results}\nErrors: {errors}"
        )
        self.assertEqual(
            len(failures), 1,
            f"Expected exactly 1 failed booking, got {len(failures)}.\n"
            f"Results: {results}\nErrors: {errors}"
        )

        # Verify only one CONFIRMED booking exists in the DB for this seat/slot/date
        confirmed_count = Booking.objects.filter(
            seat=self.seat,
            slot=self.slot,
            booking_date=self.booking_date,
            booking_status='CONFIRMED',
        ).count()
        self.assertEqual(
            confirmed_count, 1,
            f"Expected 1 CONFIRMED booking in DB, found {confirmed_count}"
        )

        print(f"\n✅ Concurrent booking test PASSED on MySQL InnoDB")
        print(f"   Successful booking: ID={successes[0][1]}, Ref={successes[0][2]}")
        print(f"   Rejected thread error: {failures[0][1]}")

    def test_cancellation_releases_seat_for_rebooking(self):
        """
        After a confirmed booking is cancelled, another user can book
        the same seat/slot/date successfully — verifying seat release on MySQL.
        """
        # Student 1 books first
        booking = BookingService.create_reservation(
            user=self.student1,
            seat=self.seat,
            slot=self.slot,
            booking_date=self.booking_date,
        )
        self.assertEqual(booking.booking_status, 'CONFIRMED')

        # Student 2 cannot book same seat/slot/date while booking is active
        with self.assertRaises(Exception):
            BookingService.create_reservation(
                user=self.student2,
                seat=self.seat,
                slot=self.slot,
                booking_date=self.booking_date,
            )

        # Student 1 cancels (parameter is 'cancelled_by_user')
        BookingService.cancel_reservation(
            booking=booking,
            cancelled_by_user=self.student1,
            reason='Student cancelled for concurrency test'
        )
        booking.refresh_from_db()
        self.assertEqual(booking.booking_status, 'CANCELLED')

        # Student 2 can now book the released seat
        new_booking = BookingService.create_reservation(
            user=self.student2,
            seat=self.seat,
            slot=self.slot,
            booking_date=self.booking_date,
        )
        self.assertEqual(new_booking.booking_status, 'CONFIRMED')

        print(f"\n✅ Cancellation-release test PASSED on MySQL InnoDB")
        print(f"   Original booking {booking.id} CANCELLED → Student 2 booked {new_booking.id}")

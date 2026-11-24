from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.accounts.models import User
from apps.library.models import Seat, TimeSlot
from apps.bookings.models import Booking
from apps.common.utils import generate_booking_reference

class Command(BaseCommand):
    help = 'Seeds realistic demonstration data for Smart Digital Library Slot Booking System.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting demonstration data population...'))

        with transaction.atomic():
            # 1. Administrator Account
            admin_user, created = User.objects.get_or_create(
                email='admin@library.edu',
                defaults={
                    'full_name': 'Chief Librarian Administrator',
                    'department': 'Library Operations & Administration',
                    'phone': '+1 (555) 019-2834',
                    'role': 'ADMIN',
                    'account_status': 'ACTIVE',
                    'is_staff': True,
                    'is_superuser': True,
                }
            )
            if created:
                admin_user.set_password('AdminPassword@123')
                admin_user.save()
                self.stdout.write(self.style.SUCCESS('Created Admin: admin@library.edu (AdminPassword@123)'))
            else:
                self.stdout.write(self.style.WARNING('Admin already exists: admin@library.edu'))

            # 2. Gate Staff / Librarian Account
            librarian_user, lib_created = User.objects.get_or_create(
                email='librarian@library.edu',
                defaults={
                    'full_name': 'Eleanor Vance (Gate Staff)',
                    'department': 'Library Circulation & Security',
                    'phone': '+1 (555) 018-7711',
                    'role': 'LIBRARIAN',
                    'account_status': 'ACTIVE',
                    'is_staff': False,
                    'is_superuser': False,
                }
            )
            if lib_created:
                librarian_user.set_password('LibrarianPassword@123')
                librarian_user.save()
                self.stdout.write(self.style.SUCCESS('Created Librarian: librarian@library.edu (LibrarianPassword@123)'))
            else:
                self.stdout.write(self.style.WARNING('Librarian already exists: librarian@library.edu'))

            # 3. Student Accounts
            students_data = [
                {
                    'email': 'alex.turner@student.edu',
                    'full_name': 'Alex Turner',
                    'student_id': 'MCA-2024-042',
                    'department': 'Master of Computer Applications',
                    'phone': '+1 (555) 012-3456',
                    'role': 'STUDENT',
                    'account_status': 'ACTIVE'
                },
                {
                    'email': 'priya.sharma@student.edu',
                    'full_name': 'Priya Sharma',
                    'student_id': 'MCA-2024-088',
                    'department': 'Master of Computer Applications',
                    'phone': '+1 (555) 012-7890',
                    'role': 'STUDENT',
                    'account_status': 'ACTIVE'
                },
                {
                    'email': 'marcus.chen@student.edu',
                    'full_name': 'Marcus Chen',
                    'student_id': 'CS-2024-105',
                    'department': 'Computer Science & Engineering',
                    'phone': '+1 (555) 013-4567',
                    'role': 'STUDENT',
                    'account_status': 'ACTIVE'
                },
                {
                    'email': 'sara.connor@student.edu',
                    'full_name': 'Sara Connor',
                    'student_id': 'AI-2024-019',
                    'department': 'Artificial Intelligence & Data Science',
                    'phone': '+1 (555) 014-5678',
                    'role': 'STUDENT',
                    'account_status': 'ACTIVE'
                },
                {
                    'email': 'inactive.student@student.edu',
                    'full_name': 'John Suspended',
                    'student_id': 'ENG-2023-999',
                    'department': 'Mechanical Engineering',
                    'phone': '+1 (555) 019-9999',
                    'role': 'STUDENT',
                    'account_status': 'INACTIVE'
                }
            ]

            created_students = []
            for s_info in students_data:
                student, s_created = User.objects.get_or_create(
                    email=s_info['email'],
                    defaults=s_info
                )
                if s_created:
                    student.set_password('StudentPassword@123')
                    student.save()
                    self.stdout.write(self.style.SUCCESS(f"Created Student: {student.email}"))
                else:
                    student.account_status = s_info.get('account_status', 'ACTIVE')
                    student.save()
                created_students.append(student)

            # 3. Standardized Time Slots (4 Daily slots)
            slots_data = [
                {'slot_name': 'Morning Session I (08:30 - 10:30)', 'start_time': time(8, 30), 'end_time': time(10, 30)},
                {'slot_name': 'Morning Session II (11:00 - 13:00)', 'start_time': time(11, 0), 'end_time': time(13, 0)},
                {'slot_name': 'Afternoon Session (14:00 - 16:30)', 'start_time': time(14, 0), 'end_time': time(16, 30)},
                {'slot_name': 'Evening Research (17:00 - 20:00)', 'start_time': time(17, 0), 'end_time': time(20, 0)},
            ]

            created_slots = []
            for sl in slots_data:
                slot_obj, _ = TimeSlot.objects.get_or_create(
                    slot_name=sl['slot_name'],
                    defaults={
                        'start_time': sl['start_time'],
                        'end_time': sl['end_time'],
                        'is_active': True
                    }
                )
                created_slots.append(slot_obj)
            self.stdout.write(self.style.SUCCESS(f"Verified {len(created_slots)} daily time slots."))

            # 4. Library Seats (48 seats across 4 floors: Ground, First, Second, Third)
            floors_and_sections = [
                ('Ground Floor', 'General Reading Hall', 'REGULAR', 12, 'G', 1),
                ('First Floor', 'Silent Study Cubicles', 'SILENT', 12, 'F', 101),
                ('Second Floor', 'Computer & Research Lab', 'COMPUTER', 12, 'F', 201),
                ('Third Floor', 'Collaborative Discussion Hub', 'DISCUSSION', 12, 'F', 301),
            ]

            created_seats = []
            for floor_name, section_name, seat_type, count, prefix, start_num in floors_and_sections:
                for i in range(count):
                    num = start_num + i
                    code = f"{prefix}{num:03d}" if prefix == 'G' else f"{prefix}{num}"
                    # Mark 2 seats under maintenance for demonstration
                    is_maintenance = (code in ['F104', 'F211'])
                    seat_obj, _ = Seat.objects.get_or_create(
                        seat_number=code,
                        defaults={
                            'floor': floor_name,
                            'section': section_name,
                            'seat_type': seat_type,
                            'is_active': True,
                            'is_under_maintenance': is_maintenance
                        }
                    )
                    created_seats.append(seat_obj)

            self.stdout.write(self.style.SUCCESS(f"Verified {len(created_seats)} library seats across 4 floors."))

            # 5. Demonstration Bookings
            today = date.today()
            tomorrow = today + timedelta(days=1)
            yesterday = today - timedelta(days=1)

            demo_bookings_plan = [
                # Today confirmed bookings
                (created_students[0], created_seats[0], created_slots[0], today, 'CONFIRMED', ''),
                (created_students[1], created_seats[1], created_slots[1], today, 'CONFIRMED', ''),
                (created_students[2], created_seats[4], created_slots[2], today, 'CONFIRMED', ''),

                # Tomorrow confirmed bookings
                (created_students[0], created_seats[2], created_slots[1], tomorrow, 'CONFIRMED', ''),
                (created_students[3], created_seats[5], created_slots[0], tomorrow, 'CONFIRMED', ''),

                # Past completed booking
                (created_students[1], created_seats[6], created_slots[0], yesterday, 'COMPLETED', ''),

                # Cancelled booking (which made the seat re-bookable)
                (created_students[2], created_seats[3], created_slots[0], today, 'CANCELLED', 'Schedule conflict with exam'),
            ]

            booking_count = 0
            for student, seat, slot, bdate, bstatus, reason in demo_bookings_plan:
                if not Booking.objects.filter(seat=seat, slot=slot, booking_date=bdate, booking_status=bstatus).exists():
                    Booking.objects.create(
                        booking_reference=generate_booking_reference(),
                        user=student,
                        seat=seat,
                        slot=slot,
                        booking_date=bdate,
                        booking_status=bstatus,
                        cancellation_reason=reason
                    )
                    booking_count += 1

            self.stdout.write(self.style.SUCCESS(f"Created {booking_count} demonstration reservations."))

            # 6. Pre-generate Digital QR Entry Passes for Confirmed Bookings
            from apps.checkin.services import CheckInService
            pass_count = 0
            for bk in Booking.objects.filter(booking_status='CONFIRMED', user__account_status='ACTIVE'):
                try:
                    CheckInService.get_or_issue_pass(bk)
                    pass_count += 1
                except Exception as exc:
                    pass
            self.stdout.write(self.style.SUCCESS(f"Generated {pass_count} digital QR entry passes."))

        self.stdout.write(self.style.SUCCESS('Successfully completed demo data initialization!'))

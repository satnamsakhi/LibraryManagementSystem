from django.core.management.base import BaseCommand
from django.conf import settings
from apps.bookings.services import BookingService

class Command(BaseCommand):
    help = 'Automatically cancels unclaimed reservations past the 20-minute arrival grace period and unlocks the desks.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--grace-minutes',
            type=int,
            default=getattr(settings, 'NO_SHOW_GRACE_MINUTES', 20),
            help='Grace period duration in minutes (defaults to NO_SHOW_GRACE_MINUTES setting or 20).'
        )

    def handle(self, *args, **options):
        grace_minutes = options['grace_minutes']
        self.stdout.write(self.style.NOTICE(f'Scanning for unverified reservations past the {grace_minutes}-minute timer...'))

        released = BookingService.release_no_show_bookings(grace_minutes=grace_minutes)

        if not released:
            self.stdout.write(self.style.SUCCESS(f'No unclaimed seats found past the {grace_minutes}-minute window.'))
            return

        self.stdout.write(self.style.SUCCESS(f'Successfully released {len(released)} unclaimed seat(s):'))
        for item in released:
            self.stdout.write(
                f" - Ref: {item['booking_reference']} | Seat: {item['seat_number']} ({item['floor']}) "
                f"| Student: {item['user_email']} | Slot: {item['slot_name']}"
            )

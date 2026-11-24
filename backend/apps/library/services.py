from datetime import date, datetime
from django.db.models import Q
from .models import Seat, TimeSlot

class SeatService:
    @staticmethod
    def get_reserved_seat_ids(booking_date, slot=None, start_time=None, end_time=None):
        """
        Retrieves a set of seat IDs that are reserved (CONFIRMED) on booking_date
        during any time interval overlapping with the specified time window.
        """
        # Late import to prevent circular dependency
        from apps.bookings.models import Booking

        if slot:
            start_time = slot.start_time
            end_time = slot.end_time

        if not booking_date:
            return set()

        if start_time and end_time:
            # Query active/confirmed bookings overlapping with slot window
            reserved_bookings = Booking.objects.filter(
                booking_date=booking_date,
                booking_status='CONFIRMED',
                slot__start_time__lt=end_time,
                slot__end_time__gt=start_time
            ).values_list('seat_id', flat=True)
        else:
            # If no specific slot or window provided, mark seats reserved for any active slot on that date
            reserved_bookings = Booking.objects.filter(
                booking_date=booking_date,
                booking_status='CONFIRMED'
            ).values_list('seat_id', flat=True)

        return set(reserved_bookings)

    @staticmethod
    def get_available_seats(booking_date, slot=None, floor=None, section=None, seat_type=None):
        """
        Returns operational seats that have no conflicting reservations for the date & slot.
        """
        seats = Seat.objects.filter(is_active=True, is_under_maintenance=False)

        if floor:
            seats = seats.filter(floor=floor)
        if section:
            seats = seats.filter(section__iexact=section)
        if seat_type:
            seats = seats.filter(seat_type=seat_type)

        if booking_date and slot:
            reserved_ids = SeatService.get_reserved_seat_ids(booking_date, slot=slot)
            seats = seats.exclude(id__in=reserved_ids)

        return seats

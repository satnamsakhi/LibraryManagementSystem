from datetime import date, datetime
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.library.models import Seat, TimeSlot

def validate_booking_date(booking_date):
    """
    Ensures reservation date is not in the past and within allowed booking horizon (e.g., up to 30 days ahead).
    """
    today = timezone.localdate()
    if booking_date < today:
        raise ValidationError("Reservations cannot be made for past dates.")
    if (booking_date - today).days > 30:
        raise ValidationError("Reservations cannot be made more than 30 days in advance.")

def validate_slot_not_elapsed_today(booking_date, slot):
    """
    If booking for the current day, ensures the slot has not already ended.
    """
    today = timezone.localdate()
    if booking_date == today:
        now_time = timezone.localtime().time()
        if slot.end_time <= now_time:
            raise ValidationError("This time slot has already concluded for today.")

def validate_seat_not_overlapping(seat, booking_date, slot, exclude_booking_id=None):
    """
    Validates that the specified seat has no overlapping active reservations on booking_date.
    Interval overlap: existing.start < new.end AND existing.end > new.start
    """
    from apps.bookings.models import Booking

    query = Booking.objects.filter(
        seat=seat,
        booking_date=booking_date,
        booking_status='CONFIRMED',
        slot__start_time__lt=slot.end_time,
        slot__end_time__gt=slot.start_time
    )
    if exclude_booking_id:
        query = query.exclude(id=exclude_booking_id)

    if query.exists():
        conflicting = query.first()
        raise ValidationError(
            f"Seat {seat.seat_number} is already reserved for {conflicting.slot.slot_name} on {booking_date}."
        )

def validate_user_not_overlapping(user, booking_date, slot, exclude_booking_id=None):
    """
    Validates that the student does not have another conflicting reservation during the same interval.
    """
    from apps.bookings.models import Booking

    query = Booking.objects.filter(
        user=user,
        booking_date=booking_date,
        booking_status='CONFIRMED',
        slot__start_time__lt=slot.end_time,
        slot__end_time__gt=slot.start_time
    )
    if exclude_booking_id:
        query = query.exclude(id=exclude_booking_id)

    if query.exists():
        conflicting = query.first()
        raise ValidationError(
            f"You already hold an active reservation ({conflicting.booking_reference}) on {booking_date} "
            f"overlapping with {slot.slot_name}."
        )

from django.db import models
from django.conf import settings
from apps.library.models import Seat, TimeSlot

class Booking(models.Model):
    """
    Represents a student seat reservation for a specific date and time slot.
    """
    STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
        ('EXPIRED', 'Expired'),
    ]

    booking_reference = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Unique reservation alphanumeric identifier, e.g., LIB-20261122-A1B2C3"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        db_index=True,
        help_text="The student who made the reservation"
    )
    seat = models.ForeignKey(
        Seat,
        on_delete=models.PROTECT,
        related_name='bookings',
        db_index=True,
        help_text="The reserved library seat"
    )
    slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.PROTECT,
        related_name='bookings',
        db_index=True,
        help_text="The selected time window"
    )
    booking_date = models.DateField(
        db_index=True,
        help_text="Calendar date of the reservation (YYYY-MM-DD)"
    )
    booking_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='CONFIRMED',
        db_index=True
    )
    cancellation_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text="Optional reason recorded if booking was cancelled"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    checked_in_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp of physical entry scan at library gate")

    class Meta:
        db_table = 'bookings'
        verbose_name = 'Seat Booking'
        verbose_name_plural = 'Seat Bookings'
        ordering = ['-booking_date', '-slot__start_time', '-created_at']
        indexes = [
            models.Index(fields=['booking_date', 'booking_status'], name='idx_bk_date_status'),
            models.Index(fields=['seat', 'booking_date', 'booking_status'], name='idx_bk_seat_date_stat'),
            models.Index(fields=['user', 'booking_date', 'booking_status'], name='idx_bk_user_date_stat'),
        ]

    def __str__(self):
        return f"{self.booking_reference} - {self.seat.seat_number} on {self.booking_date} ({self.booking_status})"

    @property
    def is_active(self):
        return self.booking_status == 'CONFIRMED'

from django.db import models
from django.core.exceptions import ValidationError

class Seat(models.Model):
    """
    Represents an individual physical seat within the smart library.
    """
    SEAT_TYPE_CHOICES = [
        ('REGULAR', 'Regular Desk'),
        ('COMPUTER', 'Computer Workstation'),
        ('DISCUSSION', 'Discussion Pod'),
        ('SILENT', 'Silent Cubicle'),
    ]

    FLOOR_CHOICES = [
        ('Ground Floor', 'Ground Floor'),
        ('First Floor', 'First Floor'),
        ('Second Floor', 'Second Floor'),
        ('Third Floor', 'Third Floor'),
    ]

    seat_number = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Unique seat code, e.g., F1-A12"
    )
    floor = models.CharField(
        max_length=50,
        choices=FLOOR_CHOICES,
        default='First Floor',
        db_index=True
    )
    section = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Library zone/section name, e.g., Silent Study, Digital Media"
    )
    seat_type = models.CharField(
        max_length=30,
        choices=SEAT_TYPE_CHOICES,
        default='REGULAR',
        db_index=True
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this seat is generally in service"
    )
    is_under_maintenance = models.BooleanField(
        default=False,
        help_text="Flag indicating if the seat is temporarily unavailable due to repairs"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'seats'
        verbose_name = 'Library Seat'
        verbose_name_plural = 'Library Seats'
        ordering = ['seat_number']

    def __str__(self):
        return f"{self.seat_number} ({self.floor} - {self.section})"

    @property
    def is_operational(self):
        """
        True only if the seat is active and not currently under maintenance.
        """
        return self.is_active and not self.is_under_maintenance


class TimeSlot(models.Model):
    """
    Represents standardized reservation time windows configured by administrators.
    """
    slot_name = models.CharField(
        max_length=100,
        help_text="Descriptive title, e.g., Morning Session 09:00 - 11:00"
    )
    start_time = models.TimeField(help_text="Slot start time (HH:MM:SS)")
    end_time = models.TimeField(help_text="Slot end time (HH:MM:SS)")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'time_slots'
        verbose_name = 'Time Slot'
        verbose_name_plural = 'Time Slots'
        ordering = ['start_time']

    def clean(self):
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError("Slot start time must precede slot end time.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.slot_name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

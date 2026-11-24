from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.bookings.models import Booking

class CheckInPass(models.Model):
    """
    Cryptographic entry pass uniquely associated with one confirmed seat booking.
    Stores the SHA-256 hash of the opaque random entry token, ensuring raw credentials
    are never stored in plaintext or logged.
    """
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='check_in_pass',
        help_text="The confirmed seat reservation this pass grants entrance for"
    )
    token_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="SHA-256 hash of the opaque entry token presented in the QR code"
    )
    salt = models.CharField(
        max_length=32,
        blank=True,
        default='',
        help_text="Cryptographic salt used to compute pass token dynamically with server secret"
    )
    version = models.PositiveIntegerField(
        default=1,
        help_text="Pass token version number, incremented upon refresh"
    )
    qr_data_uri = models.TextField(
        blank=True,
        default='',
        help_text="Optional runtime placeholder; database image persistence is avoided for credential security"
    )
    issued_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when this pass credential was minted"
    )
    valid_from = models.DateTimeField(
        db_index=True,
        help_text="Opening of physical check-in window (slot start time minus early arrival minutes)"
    )
    expires_at = models.DateTimeField(
        db_index=True,
        help_text="Conclusion of physical check-in window (slot end time)"
    )
    used_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Timestamp of successful physical gate verification"
    )
    revoked_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp if pass was invalidated due to reissuance or booking cancellation"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'check_in_passes'
        verbose_name = 'Check-In Entry Pass'
        verbose_name_plural = 'Check-In Entry Passes'
        ordering = ['-issued_at']
        indexes = [
            models.Index(fields=['token_hash'], name='idx_pass_token_hash'),
            models.Index(fields=['valid_from', 'expires_at'], name='idx_pass_validity_window'),
        ]

    def __str__(self):
        return f"Pass for {self.booking.booking_reference} (Issued: {self.issued_at.strftime('%Y-%m-%d %H:%M')})"

    @property
    def is_used(self):
        return self.used_at is not None

    @property
    def is_revoked(self):
        return self.revoked_at is not None

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_currently_valid(self):
        now = timezone.now()
        return (
            not self.is_used and
            not self.is_revoked and
            self.valid_from <= now <= self.expires_at and
            self.booking.booking_status == 'CONFIRMED'
        )


class CheckInEvent(models.Model):
    """
    Immutable audit record capturing every scan attempt (approved and rejected)
    at the library physical entrance.
    """
    STATUS_CHOICES = [
        ('APPROVED', 'Entry Approved'),
        ('REJECTED', 'Entry Rejected'),
    ]

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='check_in_events',
        help_text="The target reservation evaluated during the scan attempt"
    )
    pass_record = models.ForeignKey(
        CheckInPass,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='events',
        help_text="The pass presented during scan"
    )
    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='scanned_checkins',
        help_text="Librarian or administrator operating the gate scanner device"
    )
    scanned_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Exact timestamp when gate verification occurred"
    )
    gate_name = models.CharField(
        max_length=100,
        default='Main Gate 01',
        help_text="Physical gate or turnstile identifier"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        db_index=True
    )
    rejection_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text="Diagnostic message recorded if entry was denied"
    )

    # Denormalized snapshot for fast immutable audit display
    student_name = models.CharField(max_length=150, blank=True)
    student_id_masked = models.CharField(max_length=50, blank=True)
    seat_number = models.CharField(max_length=20, blank=True)
    slot_name = models.CharField(max_length=100, blank=True)
    booking_reference = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'check_in_events'
        verbose_name = 'Check-In Verification Audit'
        verbose_name_plural = 'Check-In Verification Audits'
        ordering = ['-scanned_at']
        indexes = [
            models.Index(fields=['scanned_at', 'status'], name='idx_event_time_status'),
            models.Index(fields=['booking_reference'], name='idx_event_bk_ref'),
        ]

    def __str__(self):
        return f"{self.status} - {self.booking_reference} at {self.scanned_at.strftime('%Y-%m-%d %H:%M:%S')}"

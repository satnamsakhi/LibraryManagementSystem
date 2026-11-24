from rest_framework import serializers
from .models import CheckInPass, CheckInEvent
from apps.checkin.services import CheckInService

class CheckInPassSerializer(serializers.ModelSerializer):
    """
    Serializer providing the digital QR pass view for the booking owner.
    """
    booking_reference = serializers.CharField(source='booking.booking_reference', read_only=True)
    seat_number = serializers.CharField(source='booking.seat.seat_number', read_only=True)
    floor = serializers.CharField(source='booking.seat.floor', read_only=True)
    section = serializers.CharField(source='booking.seat.section', read_only=True)
    seat_type = serializers.CharField(source='booking.seat.seat_type', read_only=True)
    slot_name = serializers.CharField(source='booking.slot.slot_name', read_only=True)
    start_time = serializers.TimeField(source='booking.slot.start_time', read_only=True)
    end_time = serializers.TimeField(source='booking.slot.end_time', read_only=True)
    booking_date = serializers.DateField(source='booking.booking_date', read_only=True)
    booking_status = serializers.CharField(source='booking.booking_status', read_only=True)
    checked_in_at = serializers.DateTimeField(source='booking.checked_in_at', read_only=True)

    student_name = serializers.CharField(source='booking.user.full_name', read_only=True)
    student_id_masked = serializers.SerializerMethodField()
    department = serializers.CharField(source='booking.user.department', read_only=True)

    is_used = serializers.BooleanField(read_only=True)
    is_revoked = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    is_currently_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = CheckInPass
        fields = [
            'id',
            'booking_id',
            'booking_reference',
            'seat_number',
            'floor',
            'section',
            'seat_type',
            'slot_name',
            'start_time',
            'end_time',
            'booking_date',
            'booking_status',
            'checked_in_at',
            'student_name',
            'student_id_masked',
            'department',
            'qr_data_uri',
            'valid_from',
            'expires_at',
            'used_at',
            'revoked_at',
            'is_used',
            'is_revoked',
            'is_expired',
            'is_currently_valid',
            'issued_at',
        ]

    def get_student_id_masked(self, obj):
        return CheckInService.mask_student_id(obj.booking.user.student_id)


class ScanVerificationSerializer(serializers.Serializer):
    """
    Serializer for the physical gate QR scanner payload.
    """
    token = serializers.CharField(required=True, trim_whitespace=True)
    gate_name = serializers.CharField(required=False, default='Main Gate Scanner')


class CheckInEventSerializer(serializers.ModelSerializer):
    """
    Audit log serializer for tracking library entry attempts.
    """
    scanned_by_name = serializers.CharField(source='scanned_by.full_name', read_only=True)

    class Meta:
        model = CheckInEvent
        fields = [
            'id',
            'booking_id',
            'booking_reference',
            'student_name',
            'student_id_masked',
            'seat_number',
            'slot_name',
            'scanned_by_name',
            'scanned_at',
            'gate_name',
            'status',
            'rejection_reason',
        ]

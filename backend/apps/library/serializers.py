from rest_framework import serializers
from datetime import datetime, date
from .models import Seat, TimeSlot

class SeatSerializer(serializers.ModelSerializer):
    """
    Standard serializer for library seats.
    """
    is_operational = serializers.BooleanField(read_only=True)

    class Meta:
        model = Seat
        fields = [
            'id', 'seat_number', 'floor', 'section',
            'seat_type', 'is_active', 'is_under_maintenance',
            'is_operational', 'created_at', 'updated_at'
        ]

    def validate_seat_number(self, value):
        instance = getattr(self, 'instance', None)
        normalized = value.strip().upper()
        query = Seat.objects.filter(seat_number__iexact=normalized)
        if instance:
            query = query.exclude(id=instance.id)
        if query.exists():
            raise serializers.ValidationError("A seat with this code already exists.")
        return normalized


class SeatAvailabilitySerializer(serializers.ModelSerializer):
    """
    Visual grid representation serializer of seat status for a requested date and slot.
    """
    is_operational = serializers.BooleanField(read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = [
            'id', 'seat_number', 'floor', 'section',
            'seat_type', 'is_active', 'is_under_maintenance',
            'is_operational', 'status'
        ]

    def get_status(self, obj):
        # The view will attach reserved_seat_ids to the context
        if not obj.is_active:
            return 'INACTIVE'
        if obj.is_under_maintenance:
            return 'MAINTENANCE'
        reserved_seat_ids = self.context.get('reserved_seat_ids', set())
        if obj.id in reserved_seat_ids:
            return 'RESERVED'
        return 'AVAILABLE'


class TimeSlotSerializer(serializers.ModelSerializer):
    """
    Serializer for managing reservation time slots.
    """
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = [
            'id', 'slot_name', 'start_time', 'end_time',
            'is_active', 'duration_minutes', 'created_at'
        ]

    def get_duration_minutes(self, obj):
        if obj.start_time and obj.end_time:
            dummy_date = date(2000, 1, 1)
            t1 = datetime.combine(dummy_date, obj.start_time)
            t2 = datetime.combine(dummy_date, obj.end_time)
            return int((t2 - t1).total_seconds() // 60)
        return 0

    def validate(self, attrs):
        start_time = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end_time = attrs.get('end_time', getattr(self.instance, 'end_time', None))

        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError({"end_time": "End time must be later than start time."})

            dummy_date = date(2000, 1, 1)
            dt1 = datetime.combine(dummy_date, start_time)
            dt2 = datetime.combine(dummy_date, end_time)
            diff_mins = (dt2 - dt1).total_seconds() / 60

            if diff_mins < 30:
                raise serializers.ValidationError({"end_time": "Time slot duration must be at least 30 minutes."})
            if diff_mins > 480:
                raise serializers.ValidationError({"end_time": "Time slot duration cannot exceed 8 hours."})

        return attrs

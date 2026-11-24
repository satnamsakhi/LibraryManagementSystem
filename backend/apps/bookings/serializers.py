from rest_framework import serializers
from datetime import date
from apps.accounts.serializers import UserProfileSerializer
from apps.library.serializers import SeatSerializer, TimeSlotSerializer
from apps.library.models import Seat, TimeSlot
from .models import Booking
from .validators import (
    validate_booking_date,
    validate_slot_not_elapsed_today,
    validate_seat_not_overlapping,
    validate_user_not_overlapping
)

class BookingReadSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for viewing reservations.
    """
    seat = SeatSerializer(read_only=True)
    slot = TimeSlotSerializer(read_only=True)
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'user', 'seat',
            'slot', 'booking_date', 'booking_status',
            'cancellation_reason', 'created_at', 'updated_at',
            'cancelled_at'
        ]


class BookingCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a new seat reservation.
    """
    seat_id = serializers.IntegerField(required=True)
    slot_id = serializers.IntegerField(required=True)
    booking_date = serializers.DateField(required=True)

    def validate_seat_id(self, value):
        try:
            seat = Seat.objects.get(id=value)
        except Seat.DoesNotExist:
            raise serializers.ValidationError("Seat does not exist.")

        if not seat.is_active:
            raise serializers.ValidationError(f"Seat {seat.seat_number} is currently marked inactive.")
        if seat.is_under_maintenance:
            raise serializers.ValidationError(f"Seat {seat.seat_number} is currently under maintenance.")

        return value

    def validate_slot_id(self, value):
        try:
            slot = TimeSlot.objects.get(id=value)
        except TimeSlot.DoesNotExist:
            raise serializers.ValidationError("Time slot does not exist.")

        if not slot.is_active:
            raise serializers.ValidationError(f"Time slot '{slot.slot_name}' is currently inactive.")

        return value

    def validate(self, attrs):
        user = self.context['request'].user
        seat_id = attrs['seat_id']
        slot_id = attrs['slot_id']
        booking_date = attrs['booking_date']

        # 1. User account check
        if user.account_status != 'ACTIVE' or not user.is_active:
            raise serializers.ValidationError("Your account is not active. Reservations cannot be made.")

        # 2. Date check
        try:
            validate_booking_date(booking_date)
        except Exception as e:
            raise serializers.ValidationError({"booking_date": str(e.message if hasattr(e, 'message') else e)})

        seat = Seat.objects.get(id=seat_id)
        slot = TimeSlot.objects.get(id=slot_id)

        # 3. Check if slot elapsed today
        try:
            validate_slot_not_elapsed_today(booking_date, slot)
        except Exception as e:
            raise serializers.ValidationError({"slot_id": str(e.message if hasattr(e, 'message') else e)})

        # 4. Check seat overlap
        try:
            validate_seat_not_overlapping(seat, booking_date, slot)
        except Exception as e:
            raise serializers.ValidationError({"seat_id": str(e.message if hasattr(e, 'message') else e)})

        # 5. Check user overlap
        try:
            validate_user_not_overlapping(user, booking_date, slot)
        except Exception as e:
            raise serializers.ValidationError({"non_field_errors": [str(e.message if hasattr(e, 'message') else e)]})

        attrs['seat_obj'] = seat
        attrs['slot_obj'] = slot
        return attrs


class BookingCancelSerializer(serializers.Serializer):
    """
    Serializer for cancelling an existing reservation.
    """
    cancellation_reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        default="User requested cancellation."
    )

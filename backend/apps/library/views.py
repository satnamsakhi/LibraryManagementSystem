from datetime import datetime, date
from django.db import models
from rest_framework import generics, status, serializers
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.common.permissions import IsAdminUserRole, IsAdminOrReadOnly
from apps.common.responses import success_response, error_response
from .models import Seat, TimeSlot
from .serializers import SeatSerializer, SeatAvailabilitySerializer, TimeSlotSerializer
from .services import SeatService

class SeatListView(generics.ListAPIView):
    """
    List library seats with filtering options (floor, section, seat_type).
    """
    permission_classes = [AllowAny]
    serializer_class = SeatSerializer

    def get_queryset(self):
        queryset = Seat.objects.all().order_by('floor', 'seat_number')
        floor = self.request.query_params.get('floor')
        section = self.request.query_params.get('section')
        seat_type = self.request.query_params.get('seat_type')
        is_active = self.request.query_params.get('is_active')

        if floor:
            queryset = queryset.filter(floor=floor)
        if section:
            queryset = queryset.filter(section__iexact=section)
        if seat_type:
            queryset = queryset.filter(seat_type=seat_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))

        return queryset


class SeatAvailabilityView(APIView):
    """
    Returns the visual layout grid of all seats indicating real-time status:
    AVAILABLE (green), RESERVED (red), MAINTENANCE (grey), or INACTIVE (grey).
    Optional query parameters: `date` (YYYY-MM-DD), `slot_id` (integer), `floor`, `section`, `seat_type`.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Auto-release any no-show bookings past the 20-minute timer so seats are immediately unlocked
        from apps.bookings.services import BookingService
        BookingService.release_no_show_bookings()

        date_str = request.query_params.get('date')
        slot_id = request.query_params.get('slot_id')
        floor = request.query_params.get('floor')
        section = request.query_params.get('section')
        seat_type = request.query_params.get('seat_type')

        target_date = date.today()
        target_slot = None
        reserved_ids = set()

        if date_str and str(date_str).strip() not in ('', 'undefined', 'null', 'None'):
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return error_response(
                    message="Invalid date format. Expected YYYY-MM-DD.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        if slot_id and str(slot_id).strip() not in ('', 'undefined', 'null', 'None'):
            try:
                slot_id_int = int(slot_id)
                target_slot = TimeSlot.objects.get(id=slot_id_int, is_active=True)
            except (ValueError, TypeError):
                target_slot = None
            except TimeSlot.DoesNotExist:
                return error_response(
                    message="Specified time slot not found or inactive.",
                    status_code=status.HTTP_404_NOT_FOUND
                )

        if target_date:
            reserved_ids = SeatService.get_reserved_seat_ids(target_date, slot=target_slot)

        seats = Seat.objects.all().order_by('floor', 'seat_number')
        if floor and str(floor).strip() not in ('', 'All', 'undefined', 'null'):
            seats = seats.filter(floor=floor)
        if section and str(section).strip() not in ('', 'All', 'undefined', 'null'):
            seats = seats.filter(section__iexact=section)
        if seat_type and str(seat_type).strip() not in ('', 'All', 'undefined', 'null'):
            seats = seats.filter(seat_type=seat_type)

        serializer = SeatAvailabilitySerializer(
            seats,
            many=True,
            context={'reserved_seat_ids': reserved_ids}
        )

        total_count = seats.count()
        available_count = sum(1 for item in serializer.data if item['status'] == 'AVAILABLE')
        reserved_count = sum(1 for item in serializer.data if item['status'] == 'RESERVED')
        maintenance_count = sum(1 for item in serializer.data if item['status'] in ('MAINTENANCE', 'INACTIVE'))
        occupancy_rate = round((reserved_count / total_count * 100), 1) if total_count > 0 else 0

        return success_response(data={
            'date': target_date.isoformat(),
            'slot': TimeSlotSerializer(target_slot).data if target_slot else None,
            'summary': {
                'total_seats': total_count,
                'available_seats': available_count,
                'reserved_seats': reserved_count,
                'maintenance_seats': maintenance_count,
                'occupancy_rate': occupancy_rate
            },
            'seats': serializer.data
        })


class PublicTelemetryView(APIView):
    """
    Public telemetry endpoint providing live seat availability, active reservations,
    and student usage metrics for the landing page and overview widgets.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        today = date.today()
        from apps.accounts.models import User
        from apps.bookings.models import Booking
        from apps.bookings.services import BookingService

        # Proactively release any 20-minute no-shows before compiling telemetry
        BookingService.release_no_show_bookings()

        total_seats = Seat.objects.filter(is_active=True).count()
        maintenance_seats = Seat.objects.filter(is_active=True, is_under_maintenance=True).count()
        operational_seats = total_seats - maintenance_seats

        # Confirmed bookings today
        today_bookings = Booking.objects.filter(booking_date=today, booking_status='CONFIRMED')
        active_reservations_today = today_bookings.count()

        # Unique seats occupied today
        occupied_seats_count = today_bookings.values('seat_id').distinct().count()
        available_seats = max(0, operational_seats - occupied_seats_count)

        # Enrolled active students and checkins
        students_active = User.objects.filter(role='STUDENT', account_status='ACTIVE').count()
        admitted_today = today_bookings.filter(checked_in_at__isnull=False).count()
        if admitted_today == 0:
            admitted_today = today_bookings.filter(check_in_pass__used_at__isnull=False).count()
        if admitted_today == 0:
            admitted_today = active_reservations_today

        # Floors list with floor-level counts
        floors = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor']
        floor_metrics = {}
        for fl in floors:
            fl_seats = Seat.objects.filter(floor=fl, is_active=True)
            fl_total = fl_seats.count()
            fl_occupied = today_bookings.filter(seat__floor=fl).values('seat_id').distinct().count()
            fl_maint = fl_seats.filter(is_under_maintenance=True).count()
            fl_avail = max(0, fl_total - fl_occupied - fl_maint)
            floor_metrics[fl] = {
                'total': fl_total,
                'available': fl_avail,
                'occupied': fl_occupied,
                'maintenance': fl_maint,
            }

        data = {
            'total_seats': total_seats,
            'operational_seats': operational_seats,
            'available_seats': available_seats,
            'occupied_seats': occupied_seats_count,
            'active_reservations': active_reservations_today,
            'maintenance_seats': maintenance_seats,
            'students_count': students_active,
            'students_today': admitted_today,
            'floors_count': len(floors),
            'floor_metrics': floor_metrics,
        }
        return success_response(data=data)


class SeatDetailView(generics.RetrieveAPIView):
    """
    Retrieve single seat details.
    """
    permission_classes = [AllowAny]
    serializer_class = SeatSerializer
    queryset = Seat.objects.all()
    lookup_field = 'id'


class AdminSeatCreateView(generics.CreateAPIView):
    """
    Admin-only endpoint to add a new physical seat.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = SeatSerializer


class AdminSeatDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin-only endpoint to retrieve, update, or remove a seat.
    Prevents deletion if future active bookings exist.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = SeatSerializer
    queryset = Seat.objects.all()
    lookup_field = 'id'

    def perform_destroy(self, instance):
        from apps.bookings.models import Booking
        # Prevent deletion if seat has upcoming confirmed bookings
        has_future_bookings = Booking.objects.filter(
            seat=instance,
            booking_date__gte=date.today(),
            booking_status='CONFIRMED'
        ).exists()

        if has_future_bookings:
            raise serializers.ValidationError(
                "Cannot delete this seat because active upcoming reservations exist for it. "
                "Deactivate the seat or cancel existing bookings first."
            )
        instance.delete()


class TimeSlotListView(generics.ListAPIView):
    """
    Returns all active library time slots.
    """
    permission_classes = [AllowAny]
    serializer_class = TimeSlotSerializer
    queryset = TimeSlot.objects.filter(is_active=True).order_by('start_time')
    pagination_class = None


class AdminTimeSlotListView(generics.ListCreateAPIView):
    """
    Admin-only endpoint to list all slots (including inactive) and create new ones.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = TimeSlotSerializer
    queryset = TimeSlot.objects.all().order_by('start_time')
    pagination_class = None


class AdminTimeSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin-only endpoint to update or delete a time slot.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = TimeSlotSerializer
    queryset = TimeSlot.objects.all()
    lookup_field = 'id'

    def perform_destroy(self, instance):
        from apps.bookings.models import Booking
        # Check if future bookings rely on this slot
        has_future_bookings = Booking.objects.filter(
            slot=instance,
            booking_date__gte=date.today(),
            booking_status='CONFIRMED'
        ).exists()

        if has_future_bookings:
            raise serializers.ValidationError(
                "Cannot delete this time slot because active upcoming reservations are linked to it. "
                "Deactivate the time slot instead."
            )
        instance.delete()

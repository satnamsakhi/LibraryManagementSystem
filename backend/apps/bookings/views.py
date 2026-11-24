from datetime import date
from django.db import models
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.common.permissions import IsAdminUserRole, IsBookingOwnerOrAdmin
from apps.common.responses import success_response, error_response
from .models import Booking
from .serializers import (
    BookingReadSerializer,
    BookingCreateSerializer,
    BookingCancelSerializer
)
from .services import BookingService

class BookingCreateView(APIView):
    """
    Endpoint for authenticated students to reserve a library seat for a slot.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            seat = serializer.validated_data['seat_obj']
            slot = serializer.validated_data['slot_obj']
            booking_date = serializer.validated_data['booking_date']

            try:
                booking = BookingService.create_reservation(
                    user=request.user,
                    seat=seat,
                    slot=slot,
                    booking_date=booking_date
                )
                return success_response(
                    data=BookingReadSerializer(booking).data,
                    message="Seat reservation confirmed successfully!",
                    status_code=status.HTTP_201_CREATED
                )
            except Exception as e:
                return error_response(
                    message=str(e),
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        first_error = "Booking validation failed."
        if serializer.errors:
            for field, errs in serializer.errors.items():
                if isinstance(errs, list) and len(errs) > 0:
                    first_error = str(errs[0])
                    break
                elif isinstance(errs, str):
                    first_error = errs
                    break

        return error_response(
            message=first_error,
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class MyBookingsListView(generics.ListAPIView):
    """
    Returns list of reservations for the authenticated student.
    Query params: `filter` ('active', 'upcoming', 'past', 'cancelled')
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BookingReadSerializer

    def get_queryset(self):
        queryset = Booking.objects.filter(user=self.request.user).select_related('seat', 'slot', 'user')
        filter_type = self.request.query_params.get('filter')
        today = date.today()

        if filter_type == 'active':
            queryset = queryset.filter(booking_status='CONFIRMED', booking_date__gte=today)
        elif filter_type == 'upcoming':
            queryset = queryset.filter(booking_status='CONFIRMED', booking_date__gt=today)
        elif filter_type == 'past':
            queryset = queryset.filter(models.Q(booking_date__lt=today) | models.Q(booking_status__in=['COMPLETED', 'EXPIRED']))
        elif filter_type == 'cancelled':
            queryset = queryset.filter(booking_status='CANCELLED')

        return queryset.order_by('-booking_date', '-slot__start_time')


class AutoReleaseNoShowsView(APIView):
    """
    Triggers the 20-minute no-show evaluation: automatically cancels reservations
    where student did not arrive within 20 minutes, unlocking seats for others.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        grace_minutes = request.data.get('grace_minutes')
        if grace_minutes is not None:
            try:
                grace_minutes = int(grace_minutes)
            except (ValueError, TypeError):
                grace_minutes = None

        released = BookingService.release_no_show_bookings(grace_minutes=grace_minutes)
        return success_response(
            data={
                'released_count': len(released),
                'released_bookings': released,
            },
            message=f"Auto-release executed. {len(released)} unclaimed desk(s) freed."
        )


class BookingDetailView(generics.RetrieveAPIView):
    """
    Retrieve single booking by ID.
    """
    permission_classes = [IsAuthenticated, IsBookingOwnerOrAdmin]
    serializer_class = BookingReadSerializer
    queryset = Booking.objects.select_related('seat', 'slot', 'user')
    lookup_field = 'id'


class BookingCancelView(APIView):
    """
    Allows a student or administrator to cancel a booking.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            booking = Booking.objects.select_related('seat', 'slot', 'user').get(id=id)
        except Booking.DoesNotExist:
            return error_response(
                message="Booking not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Check authorization
        is_admin = request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser
        if booking.user_id != request.user.id and not is_admin:
            return error_response(
                message="You are not authorized to cancel another student's reservation.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        serializer = BookingCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data.get('cancellation_reason', 'Cancelled by user')

        try:
            cancelled_booking = BookingService.cancel_reservation(
                booking=booking,
                cancelled_by_user=request.user,
                reason=reason
            )
            return success_response(
                data=BookingReadSerializer(cancelled_booking).data,
                message="Reservation cancelled successfully. Seat has been made available."
            )
        except Exception as e:
            return error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )


class AdminBookingListView(generics.ListAPIView):
    """
    Admin-only endpoint to view, search, and filter all library reservations.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = BookingReadSerializer

    def get_queryset(self):
        queryset = Booking.objects.all().select_related('seat', 'slot', 'user').order_by('-booking_date', '-created_at')

        search = self.request.query_params.get('search', '').strip()
        status_param = self.request.query_params.get('status', '').strip()
        booking_date = self.request.query_params.get('date', '').strip()
        seat_number = self.request.query_params.get('seat', '').strip()
        student_email = self.request.query_params.get('student', '').strip()

        if search:
            queryset = queryset.filter(
                models.Q(booking_reference__icontains=search) |
                models.Q(user__full_name__icontains=search) |
                models.Q(user__email__icontains=search) |
                models.Q(seat__seat_number__icontains=search)
            )
        if status_param:
            queryset = queryset.filter(booking_status=status_param)
        if booking_date:
            queryset = queryset.filter(booking_date=booking_date)
        if seat_number:
            queryset = queryset.filter(seat__seat_number__icontains=seat_number)
        if student_email:
            queryset = queryset.filter(user__email__icontains=student_email)

        return queryset


class AutoReleaseNoShowsView(APIView):
    """
    Triggers the 20-minute no-show evaluation: automatically cancels reservations
    where student did not arrive within 20 minutes, unlocking seats for others.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        grace_minutes = request.data.get('grace_minutes')
        if grace_minutes is not None:
            try:
                grace_minutes = int(grace_minutes)
            except (ValueError, TypeError):
                grace_minutes = None

        released = BookingService.release_no_show_bookings(grace_minutes=grace_minutes)
        return success_response(
            data={
                'released_count': len(released),
                'released_bookings': released,
            },
            message=f"Auto-release executed. {len(released)} unclaimed desk(s) freed."
        )

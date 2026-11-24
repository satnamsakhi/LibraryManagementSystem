from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from apps.common.responses import success_response, error_response
from apps.common.permissions import IsGateStaffOrAdmin
from apps.bookings.models import Booking
from .models import CheckInPass, CheckInEvent
from .serializers import (
    CheckInPassSerializer,
    ScanVerificationSerializer,
    CheckInEventSerializer
)
from .services import CheckInService


class BookingPassView(APIView):
    """
    GET: Retrieves the digital entry QR pass for an authorized booking owner or admin.
    POST: Refreshes / reissues the pass credential, invalidating any previous QR token.
    """
    permission_classes = [IsAuthenticated]

    def get_booking(self, booking_id, user):
        try:
            booking = Booking.objects.select_related('user', 'seat', 'slot').get(id=booking_id)
        except Booking.DoesNotExist:
            return None

        # Ownership authorization
        is_admin = user.role == 'ADMIN' or user.is_staff or user.is_superuser
        if booking.user_id != user.id and not is_admin:
            return None
        return booking

    def get(self, request, booking_id):
        booking = self.get_booking(booking_id, request.user)
        if not booking:
            return error_response(
                message="Booking not found or access denied.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        try:
            pass_obj, _ = CheckInService.get_or_issue_pass(booking, force_refresh=False)
            serializer = CheckInPassSerializer(pass_obj)
            return success_response(
                data=serializer.data,
                message="Digital library entry pass retrieved successfully."
            )
        except Exception as exc:
            return error_response(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request, booking_id):
        """Reissue fresh QR pass token."""
        booking = self.get_booking(booking_id, request.user)
        if not booking:
            return error_response(
                message="Booking not found or access denied.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        try:
            pass_obj, _ = CheckInService.get_or_issue_pass(booking, force_refresh=True)
            serializer = CheckInPassSerializer(pass_obj)
            return success_response(
                data=serializer.data,
                message="QR entry pass successfully refreshed. Previous pass has been invalidated."
            )
        except Exception as exc:
            return error_response(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST
            )


class GateCheckInView(APIView):
    """
    Staff-facing gate verification endpoint.
    Scans the student's booking QR token, validates against MySQL database under
    row-level lock, and records physical entrance.
    """
    permission_classes = [IsAuthenticated, IsGateStaffOrAdmin]

    def post(self, request):
        serializer = ScanVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Invalid payload. QR token is required.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        token = serializer.validated_data['token']
        gate_name = serializer.validated_data.get('gate_name', 'Main Gate 01')

        outcome = CheckInService.verify_and_check_in(
            raw_token=token,
            scanner_user=request.user,
            gate_name=gate_name
        )

        if outcome['approved']:
            return success_response(
                data=outcome['data'],
                message=outcome['message'],
                status_code=status.HTTP_200_OK
            )
        else:
            return error_response(
                message=outcome['reason'],
                errors={'reason': outcome['reason']},
                data=outcome if 'booking_reference' in outcome else None,
                status_code=outcome.get('status_code', status.HTTP_400_BAD_REQUEST)
            )


class GateHistoryView(generics.ListAPIView):
    """
    Administrator & Librarian entry audit history with filtering.
    """
    permission_classes = [IsAuthenticated, IsGateStaffOrAdmin]
    serializer_class = CheckInEventSerializer

    def get_queryset(self):
        queryset = CheckInEvent.objects.all().select_related('scanned_by')
        search = self.request.query_params.get('search', '').strip()
        status_filter = self.request.query_params.get('status', '').strip()
        date_filter = self.request.query_params.get('date', '').strip()

        if search:
            queryset = queryset.filter(
                Q(student_name__icontains=search) |
                Q(booking_reference__icontains=search) |
                Q(seat_number__icontains=search) |
                Q(student_id_masked__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if date_filter:
            queryset = queryset.filter(scanned_at__date=date_filter)

        return queryset.order_by('-scanned_at')


class GateStatsView(APIView):
    """
    Summary metrics for the gate scanner dashboard:
    Total scans today, approved, rejected, and latest 5 events.
    """
    permission_classes = [IsAuthenticated, IsGateStaffOrAdmin]

    def get(self, request):
        today = timezone.now().date()
        today_events = CheckInEvent.objects.filter(scanned_at__date=today)

        total_scans = today_events.count()
        approved_count = today_events.filter(status='APPROVED').count()
        rejected_count = today_events.filter(status='REJECTED').count()

        recent = today_events.order_by('-scanned_at')[:5]
        serializer = CheckInEventSerializer(recent, many=True)

        return success_response(data={
            'date': str(today),
            'total_scans_today': total_scans,
            'approved_today': approved_count,
            'rejected_today': rejected_count,
            'approval_rate': round((approved_count / total_scans * 100), 1) if total_scans > 0 else 100.0,
            'recent_events': serializer.data
        })

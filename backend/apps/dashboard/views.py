from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import IsAdminUserRole
from apps.common.responses import success_response
from .services import DashboardService

class StudentDashboardView(APIView):
    """
    Returns metrics, upcoming reservations, and recent history for the authenticated student.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = DashboardService.get_student_dashboard_stats(request.user)
        return success_response(data=data)


class AdminDashboardView(APIView):
    """
    Returns key operational indicators and today's summary for administrators.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        data = DashboardService.get_admin_dashboard_stats()
        return success_response(data=data)


class AdminReportsView(APIView):
    """
    Returns analytical trends, floor distributions, and utilization statistics.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        data = DashboardService.get_admin_reports()
        return success_response(data=data)

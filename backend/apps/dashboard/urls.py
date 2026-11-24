from django.urls import path
from .views import StudentDashboardView, AdminDashboardView
from apps.library.views import PublicTelemetryView

urlpatterns = [
    path('public-stats/', PublicTelemetryView.as_view(), name='dashboard_public_stats'),
    path('student/', StudentDashboardView.as_view(), name='dashboard_student'),
    path('admin/', AdminDashboardView.as_view(), name='dashboard_admin'),
]

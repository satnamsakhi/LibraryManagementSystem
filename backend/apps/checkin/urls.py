from django.urls import path
from .views import (
    BookingPassView,
    GateCheckInView,
    GateHistoryView,
    GateStatsView
)

urlpatterns = [
    # Gate scanner operations
    path('check-in/', GateCheckInView.as_view(), name='gate_check_in'),
    path('check-in-history/', GateHistoryView.as_view(), name='gate_check_in_history'),
    path('history/', GateHistoryView.as_view(), name='gate_history'),
    path('stats/', GateStatsView.as_view(), name='gate_stats'),

    # Direct pass endpoints
    path('pass/<int:booking_id>/', BookingPassView.as_view(), name='checkin_pass_detail'),
    path('pass/<int:booking_id>/issue/', BookingPassView.as_view(), name='checkin_pass_reissue'),
]

from django.urls import path
from .views import SeatListView, SeatAvailabilityView, SeatDetailView, PublicTelemetryView

urlpatterns = [
    path('', SeatListView.as_view(), name='seat_list'),
    path('available/', SeatAvailabilityView.as_view(), name='seat_availability'),
    path('public-stats/', PublicTelemetryView.as_view(), name='seat_public_stats'),
    path('<int:id>/', SeatDetailView.as_view(), name='seat_detail'),
]

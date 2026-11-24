from django.urls import path
from .views import (
    BookingCreateView,
    MyBookingsListView,
    BookingDetailView,
    BookingCancelView,
    AutoReleaseNoShowsView
)
from apps.checkin.views import BookingPassView

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking_create'),
    path('my-bookings/', MyBookingsListView.as_view(), name='my_bookings'),
    path('auto-release-no-shows/', AutoReleaseNoShowsView.as_view(), name='booking_auto_release_no_shows'),
    path('<int:id>/', BookingDetailView.as_view(), name='booking_detail'),
    path('<int:id>/cancel/', BookingCancelView.as_view(), name='booking_cancel'),

    # QR Digital Pass Endpoints for Booking
    path('<int:booking_id>/check-in-pass/', BookingPassView.as_view(), name='booking_checkin_pass'),
    path('<int:booking_id>/check-in-pass/issue/', BookingPassView.as_view(), name='booking_checkin_pass_issue'),
]

from django.urls import path
from .views import AdminDashboardView, AdminReportsView
from apps.accounts.views import AdminUserListView, AdminUserDetailView
from apps.library.views import (
    AdminSeatCreateView,
    AdminSeatDetailView,
    AdminTimeSlotListView,
    AdminTimeSlotDetailView
)
from apps.bookings.views import AdminBookingListView, BookingCancelView

urlpatterns = [
    # Admin metrics
    path('dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('reports/', AdminReportsView.as_view(), name='admin_reports'),

    # User management
    path('users/', AdminUserListView.as_view(), name='admin_users_list'),
    path('users/<int:id>/', AdminUserDetailView.as_view(), name='admin_users_detail'),

    # Seat management
    path('seats/', AdminSeatCreateView.as_view(), name='admin_seats_create'),
    path('seats/<int:id>/', AdminSeatDetailView.as_view(), name='admin_seats_detail'),

    # Time slot management
    path('slots/', AdminTimeSlotListView.as_view(), name='admin_slots_list_create'),
    path('slots/<int:id>/', AdminTimeSlotDetailView.as_view(), name='admin_slots_detail'),

    # Booking management
    path('bookings/', AdminBookingListView.as_view(), name='admin_bookings_list'),
    path('bookings/<int:id>/cancel/', BookingCancelView.as_view(), name='admin_bookings_cancel'),
]

"""
URL configuration for Smart Digital Library Slot Booking System.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

urlpatterns = [
    # Built-in Django Admin Interface
    path('admin/', admin.site.urls),

    # Authentication & User Profile Endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/users/', include('apps.accounts.user_urls')),

    # Library Resources (Seats & Time Slots)
    path('api/seats/', include('apps.library.seat_urls')),
    path('api/slots/', include('apps.library.slot_urls')),

    # Bookings & Reservations
    path('api/bookings/', include('apps.bookings.urls')),

    # Digital Entry & QR Gate Operations
    path('api/gate/', include('apps.checkin.urls')),
    path('api/checkin/', include('apps.checkin.urls')),

    # Dashboard & Reports
    path('api/dashboard/', include('apps.dashboard.urls')),

    # Dedicated Admin API Endpoints
    path('api/admin/', include('apps.dashboard.admin_urls')),

    # OpenAPI 3 Documentation Endpoints
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

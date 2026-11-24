from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_reference', 'user', 'seat', 'slot',
        'booking_date', 'booking_status', 'created_at'
    )
    list_filter = ('booking_status', 'booking_date', 'seat__floor', 'seat__section')
    search_fields = ('booking_reference', 'user__email', 'user__full_name', 'seat__seat_number')
    readonly_fields = ('booking_reference', 'created_at', 'updated_at', 'cancelled_at')
    ordering = ('-booking_date', '-created_at')

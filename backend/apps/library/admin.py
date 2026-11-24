from django.contrib import admin
from .models import Seat, TimeSlot

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('seat_number', 'floor', 'section', 'seat_type', 'is_active', 'is_under_maintenance', 'is_operational')
    list_filter = ('floor', 'section', 'seat_type', 'is_active', 'is_under_maintenance')
    search_fields = ('seat_number', 'section')
    ordering = ('floor', 'seat_number')

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('slot_name', 'start_time', 'end_time', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('slot_name',)
    ordering = ('start_time',)

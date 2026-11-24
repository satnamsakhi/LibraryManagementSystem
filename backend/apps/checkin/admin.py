from django.contrib import admin
from .models import CheckInPass, CheckInEvent

@admin.register(CheckInPass)
class CheckInPassAdmin(admin.ModelAdmin):
    list_display = ('booking', 'valid_from', 'expires_at', 'used_at', 'revoked_at', 'issued_at')
    search_fields = ('booking__booking_reference', 'booking__user__full_name', 'token_hash')
    list_filter = ('used_at', 'revoked_at')
    readonly_fields = ('token_hash', 'qr_data_uri', 'issued_at', 'created_at', 'updated_at')

@admin.register(CheckInEvent)
class CheckInEventAdmin(admin.ModelAdmin):
    list_display = ('booking_reference', 'student_name', 'seat_number', 'slot_name', 'status', 'scanned_by', 'scanned_at')
    search_fields = ('booking_reference', 'student_name', 'student_id_masked', 'seat_number')
    list_filter = ('status', 'scanned_at', 'gate_name')
    readonly_fields = ('scanned_at',)

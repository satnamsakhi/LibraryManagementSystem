from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'role', 'student_id', 'department', 'account_status', 'is_staff')
    list_filter = ('role', 'account_status', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'student_id', 'department', 'phone')}),
        ('Permissions & Role', {'fields': ('role', 'account_status', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login')
    search_fields = ('email', 'full_name', 'student_id')
    ordering = ('email',)

from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN role or superuser status.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.account_status == 'ACTIVE' and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )

class IsStudentUserRole(permissions.BasePermission):
    """
    Allows access to authenticated students.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )

class IsActiveAccount(permissions.BasePermission):
    """
    Verifies that the authenticated user's account is currently ACTIVE.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.account_status == 'ACTIVE'
        )

class IsActiveStudent(permissions.BasePermission):
    """
    Verifies that the user is an active student with full operational privileges.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT' and
            request.user.is_active and
            request.user.account_status == 'ACTIVE'
        )

class IsGateStaffOrAdmin(permissions.BasePermission):
    """
    Allows access to gate scanning & verification endpoints:
    LIBRARIAN, ADMIN, staff, or superusers.
    Students are strictly forbidden.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.account_status == 'ACTIVE' and
            (request.user.role in ['ADMIN', 'LIBRARIAN'] or request.user.is_staff or request.user.is_superuser)
        )

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    SAFE_METHODS (GET, HEAD, OPTIONS) allowed for any authenticated user;
    modifying methods require ADMIN role.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.account_status == 'ACTIVE' and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )

class IsBookingOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission allowing the booking owner or an admin to access or cancel.
    """
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser:
            return True
        return obj.user_id == request.user.id

from django.db import models
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from apps.common.responses import success_response, error_response
from apps.common.permissions import IsAdminUserRole
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    AdminUserSerializer
)
from .services import AccountService

class RegisterView(APIView):
    """
    Public endpoint for registering a new student account.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return success_response(
                data={
                    'user': UserProfileSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                },
                message="Account registered successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            message="Registration failed. Please check the entered details.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    """
    Public endpoint for authenticating users and obtaining JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = serializer.validated_data['tokens']
            return success_response(
                data={
                    'user': UserProfileSerializer(user).data,
                    'tokens': tokens
                },
                message="Authentication successful."
            )
        err_msg = "Authentication failed."
        if serializer.errors and 'non_field_errors' in serializer.errors:
            err_msg = str(serializer.errors['non_field_errors'][0])
        return error_response(
            message=err_msg,
            errors=serializer.errors,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    """
    Invalidates the current session's refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, AttributeError):
                # Blacklist app might not have blacklist table active or already expired
                pass
        return success_response(message="Logged out successfully.")


class CurrentUserView(APIView):
    """
    Returns the currently authenticated user's details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return success_response(data=serializer.data)


class UserProfileView(APIView):
    """
    Allows the authenticated user to view or update their profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return success_response(data=serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return success_response(
                data=UserProfileSerializer(user).data,
                message="Profile updated successfully."
            )
        return error_response(
            message="Failed to update profile.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ChangePasswordView(APIView):
    """
    Allows an authenticated user to change their password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            AccountService.change_password(request.user, serializer.validated_data['new_password'])
            return success_response(message="Password changed successfully.")
        return error_response(
            message="Failed to change password.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class AdminUserListView(generics.ListAPIView):
    """
    Admin-only endpoint to list and search all registered users.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', '').strip()
        role = self.request.query_params.get('role', '').strip()
        status_param = self.request.query_params.get('status', '').strip()

        if search:
            queryset = queryset.filter(
                models.Q(full_name__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(student_id__icontains=search) |
                models.Q(department__icontains=search)
            )
        if role:
            queryset = queryset.filter(role=role)
        if status_param:
            queryset = queryset.filter(account_status=status_param)

        return queryset


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    Admin-only endpoint to view, activate/deactivate, or edit user role.
    Accepts PATCH or PUT for partial status and role updates.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        # Always allow partial updates so admin can toggle status or role independently
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            status_text = serializer.data.get('account_status', instance.account_status)
            return success_response(
                data=serializer.data,
                message=f"User successfully updated. Status is now {status_text}."
            )
        return error_response(
            message="Failed to update user.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

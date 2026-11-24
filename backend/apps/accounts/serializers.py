from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for public student registration.
    """
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'student_id',
            'department', 'phone', 'password', 'confirm_password'
        ]

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email=normalized_email).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return normalized_email

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            role='STUDENT',
            account_status='ACTIVE',
            password=password,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user authentication yielding JWT tokens.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        if user.account_status != 'ACTIVE' or not user.is_active:
            raise serializers.ValidationError("Your account has been deactivated. Please contact the library administrator.")

        refresh = RefreshToken.for_user(user)

        return {
            'user': user,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving and updating user profile details.
    """
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'student_id',
            'department', 'phone', 'role', 'account_status',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'account_status', 'is_active', 'created_at', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for authenticated password changes.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(required=True, write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({"new_password": "New password cannot be the same as the old password."})
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer for admin management of registered users.
    Supports partial updates (PATCH) on account_status and role.
    """
    full_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'student_id',
            'department', 'phone', 'role', 'account_status',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        request = self.context.get('request')
        request_user = request.user if request else None
        instance = getattr(self, 'instance', None)

        if instance and request_user:
            new_status = attrs.get('account_status', instance.account_status)
            new_role = attrs.get('role', instance.role)

            # Protection 1: Prevent admin from deactivating themselves
            if instance.id == request_user.id and new_status == 'INACTIVE':
                raise serializers.ValidationError({"account_status": "You cannot deactivate your own administrative account."})

            # Protection 2: Prevent admin from demoting themselves
            if instance.id == request_user.id and new_role != 'ADMIN':
                raise serializers.ValidationError({"role": "You cannot remove administrative privileges from your own account."})

            # Protection 3: Ensure at least one active admin remains in the system
            if (new_status == 'INACTIVE' or new_role != 'ADMIN') and instance.role == 'ADMIN':
                active_admin_count = User.objects.filter(role='ADMIN', account_status='ACTIVE').exclude(id=instance.id).count()
                if active_admin_count == 0:
                    raise serializers.ValidationError({"account_status": "Cannot deactivate this administrator. At least one active administrator must remain."})

        return attrs

    def update(self, instance, validated_data):
        new_status = validated_data.get('account_status', instance.account_status)
        if 'account_status' in validated_data:
            instance.account_status = new_status
            instance.is_active = (new_status == 'ACTIVE')

        if 'role' in validated_data:
            instance.role = validated_data['role']
            if instance.role == 'ADMIN':
                instance.is_staff = True
            elif instance.role in ['STUDENT', 'LIBRARIAN'] and not instance.is_superuser:
                instance.is_staff = False

        for attr, value in validated_data.items():
            if attr not in ['account_status', 'role']:
                setattr(instance, attr, value)

        instance.save()
        return instance

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class AccountService:
    @staticmethod
    def register_student(validated_data):
        """
        Creates and persists a new student user.
        """
        user = User.objects.create_user(
            role='STUDENT',
            account_status='ACTIVE',
            **validated_data
        )
        refresh = RefreshToken.for_user(user)
        return user, {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }

    @staticmethod
    def change_password(user, new_password):
        """
        Updates the user's password securely.
        """
        user.set_password(new_password)
        user.save()
        return user

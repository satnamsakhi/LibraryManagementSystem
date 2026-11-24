from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import CustomUserManager

class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for the Smart Digital Library Slot Booking System.
    Uses email as the unique login credential.
    """
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('LIBRARIAN', 'Librarian / Gate Staff'),
        ('ADMIN', 'Administrator'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    ]

    full_name = models.CharField(max_length=150, help_text="Full legal name of the user")
    email = models.EmailField(unique=True, db_index=True, help_text="Primary email address used for login")
    student_id = models.CharField(max_length=50, blank=True, null=True, db_index=True, help_text="University student roll or ID number")
    department = models.CharField(max_length=100, blank=True, help_text="Academic department or faculty")
    phone = models.CharField(max_length=20, blank=True, help_text="Contact telephone number")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT', db_index=True)
    account_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', db_index=True)

    is_staff = models.BooleanField(default=False, help_text="Designates whether the user can log into this admin site.")
    is_active = models.BooleanField(default=True, help_text="Designates whether this user should be treated as active.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.role}"

    def save(self, *args, **kwargs):
        """
        Enforce single source of truth for account activation.
        Synchronizes account_status with Django's built-in is_active field
        so simplejwt token authentication and permission checks are strictly aligned.
        """
        if self.account_status == 'INACTIVE':
            self.is_active = False
        elif self.account_status == 'ACTIVE':
            self.is_active = True
        elif not self.is_active:
            self.account_status = 'INACTIVE'
        else:
            self.account_status = 'ACTIVE'
            self.is_active = True
        super().save(*args, **kwargs)

    @property
    def is_admin(self):
        return self.role == 'ADMIN' or self.is_superuser

    @property
    def is_librarian(self):
        return self.role == 'LIBRARIAN'

    @property
    def is_student(self):
        return self.role == 'STUDENT'

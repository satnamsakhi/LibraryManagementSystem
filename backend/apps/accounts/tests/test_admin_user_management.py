from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.models import User

class AdminUserManagementTests(TestCase):
    """
    Tests for Admin User Activation, Deactivation, Token Invalidation, and Protections.
    """
    def setUp(self):
        self.client = APIClient()

        # Admin
        self.admin = User.objects.create_superuser(
            email='lead.admin@library.edu',
            password='AdminPassword@123',
            full_name='Lead Administrator'
        )
        refresh_admin = RefreshToken.for_user(self.admin)
        self.admin_token = str(refresh_admin.access_token)

        # Active student
        self.student = User.objects.create_user(
            email='active.student@student.edu',
            password='StudentPassword@123',
            full_name='Active Student',
            student_id='STU-101',
            role='STUDENT',
            account_status='ACTIVE'
        )
        refresh_student = RefreshToken.for_user(self.student)
        self.student_token = str(refresh_student.access_token)

        # Inactive student
        self.inactive_student = User.objects.create_user(
            email='suspended.student@student.edu',
            password='StudentPassword@123',
            full_name='Suspended Student',
            student_id='STU-102',
            role='STUDENT',
            account_status='INACTIVE'
        )

        self.user_detail_url = lambda uid: reverse('admin_users_detail', kwargs={'id': uid})

    def test_admin_deactivates_student_success(self):
        """Admin can deactivate an active student using PATCH."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = self.user_detail_url(self.student.id)
        response = self.client.patch(url, {'account_status': 'INACTIVE'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.account_status, 'INACTIVE')
        self.assertFalse(self.student.is_active)

    def test_admin_activates_student_success(self):
        """Admin can activate an inactive student using PATCH."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = self.user_detail_url(self.inactive_student.id)
        response = self.client.patch(url, {'account_status': 'ACTIVE'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.inactive_student.refresh_from_db()
        self.assertEqual(self.inactive_student.account_status, 'ACTIVE')
        self.assertTrue(self.inactive_student.is_active)

    def test_student_cannot_deactivate_or_activate_another_account(self):
        """A regular student cannot call the admin user-management endpoint."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        url = self.user_detail_url(self.inactive_student.id)
        response = self.client.patch(url, {'account_status': 'ACTIVE'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_inactive_user_cannot_log_in(self):
        """Deactivated user credentials are fundamentally rejected on login."""
        login_url = reverse('auth_login')
        response = self.client.post(login_url, {
            'email': 'suspended.student@student.edu',
            'password': 'StudentPassword@123'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('deactivated', str(response.data.get('message', '')).lower())

    def test_previously_issued_tokens_rejected_after_deactivation(self):
        """
        When an admin deactivates a student, previously minted JWT tokens
        for that student are immediately rejected on protected requests.
        """
        # 1. Verify token works while ACTIVE
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        me_url = reverse('auth_current_user')
        resp = self.client.get(me_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # 2. Admin deactivates student
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        deact_resp = self.client.patch(self.user_detail_url(self.student.id), {'account_status': 'INACTIVE'}, format='json')
        self.assertEqual(deact_resp.status_code, status.HTTP_200_OK)

        # 3. Old student token used immediately after deactivation -> MUST FAIL
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        resp_after = self.client.get(me_url)
        self.assertEqual(resp_after.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reactivation_restores_account_access(self):
        """Reactivation restores login capability."""
        # 1. Admin activates suspended student
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        self.client.patch(self.user_detail_url(self.inactive_student.id), {'account_status': 'ACTIVE'}, format='json')

        # 2. Login succeeds
        login_url = reverse('auth_login')
        response = self.client.post(login_url, {
            'email': 'suspended.student@student.edu',
            'password': 'StudentPassword@123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data['data'])

    def test_admin_cannot_deactivate_self(self):
        """Admin is prevented from deactivating their own administrative account."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = self.user_detail_url(self.admin.id)
        response = self.client.patch(url, {'account_status': 'INACTIVE'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.account_status, 'ACTIVE')

    def test_last_active_admin_cannot_be_deactivated(self):
        """Ensures at least one active administrator must remain in the system."""
        # Remove any other admins so self.admin is the only one
        User.objects.filter(role='ADMIN').exclude(id=self.admin.id).delete()

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = self.user_detail_url(self.admin.id)
        response = self.client.patch(url, {'account_status': 'INACTIVE'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

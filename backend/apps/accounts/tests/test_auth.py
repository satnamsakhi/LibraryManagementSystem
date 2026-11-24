from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.me_url = reverse('auth_current_user')
        self.change_password_url = reverse('user_change_password')

        # Create active student
        self.student = User.objects.create_user(
            email='test.student@univ.edu',
            password='TestPassword@123',
            full_name='Test Student',
            student_id='STU-001',
            role='STUDENT',
            account_status='ACTIVE'
        )

        # Create inactive student
        self.inactive_student = User.objects.create_user(
            email='inactive.student@univ.edu',
            password='TestPassword@123',
            full_name='Suspended Student',
            student_id='STU-002',
            role='STUDENT',
            account_status='INACTIVE'
        )

        # Create admin
        self.admin = User.objects.create_superuser(
            email='admin@univ.edu',
            password='AdminPassword@123',
            full_name='System Admin'
        )

    def test_user_registration_success(self):
        data = {
            'email': 'new.student@univ.edu',
            'full_name': 'New Student',
            'student_id': 'STU-999',
            'department': 'MCA',
            'phone': '1234567890',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(User.objects.filter(email='new.student@univ.edu').exists())
        user = User.objects.get(email='new.student@univ.edu')
        self.assertEqual(user.role, 'STUDENT')
        self.assertEqual(user.account_status, 'ACTIVE')

    def test_registration_password_mismatch(self):
        data = {
            'email': 'mismatch@univ.edu',
            'full_name': 'Mismatch Student',
            'password': 'Password123!',
            'confirm_password': 'DifferentPassword123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success_and_jwt_tokens(self):
        data = {
            'email': 'test.student@univ.edu',
            'password': 'TestPassword@123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data['data'])
        self.assertIn('access', response.data['data']['tokens'])
        self.assertIn('refresh', response.data['data']['tokens'])

    def test_login_invalid_password(self):
        data = {
            'email': 'test.student@univ.edu',
            'password': 'WrongPassword@999'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_inactive_user_rejected(self):
        data = {
            'email': 'inactive.student@univ.edu',
            'password': 'TestPassword@123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('deactivated', str(response.data['message']).lower())

    def test_protected_me_endpoint_requires_token(self):
        # Unauthenticated request
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated request
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], self.student.email)

    def test_change_password_success(self):
        self.client.force_authenticate(user=self.student)
        data = {
            'old_password': 'TestPassword@123',
            'new_password': 'BrandNewPassword@2026',
            'confirm_new_password': 'BrandNewPassword@2026'
        }
        response = self.client.post(self.change_password_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify old password no longer works
        self.student.refresh_from_db()
        self.assertTrue(self.student.check_password('BrandNewPassword@2026'))
        self.assertFalse(self.student.check_password('TestPassword@123'))

from datetime import time, date
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.library.models import Seat, TimeSlot

class LibraryResourceTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.student = User.objects.create_user(
            email='student@univ.edu',
            password='TestPassword@123',
            full_name='Alice Student',
            role='STUDENT'
        )
        self.admin = User.objects.create_superuser(
            email='admin@univ.edu',
            password='AdminPassword@123',
            full_name='Chief Admin'
        )

        self.slot1 = TimeSlot.objects.create(
            slot_name='Morning Slot 1',
            start_time=time(9, 0),
            end_time=time(11, 0),
            is_active=True
        )

        self.seat1 = Seat.objects.create(
            seat_number='A-101',
            floor='First Floor',
            section='Quiet Zone',
            seat_type='REGULAR',
            is_active=True,
            is_under_maintenance=False
        )

        self.seat_maintenance = Seat.objects.create(
            seat_number='A-102',
            floor='First Floor',
            section='Quiet Zone',
            seat_type='REGULAR',
            is_active=True,
            is_under_maintenance=True
        )

    def test_list_seats_public(self):
        url = reverse('seat_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return both seats
        self.assertGreaterEqual(len(response.data['results']), 2)

    def test_seat_availability_endpoint(self):
        url = reverse('seat_availability')
        response = self.client.get(url, {'date': '2026-12-01', 'slot_id': self.slot1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        seats_data = response.data['data']['seats']
        seat1_data = next(s for s in seats_data if s['seat_number'] == 'A-101')
        seat2_data = next(s for s in seats_data if s['seat_number'] == 'A-102')

        self.assertEqual(seat1_data['status'], 'AVAILABLE')
        self.assertEqual(seat2_data['status'], 'MAINTENANCE')

    def test_admin_create_seat_success(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin_seats_create')
        data = {
            'seat_number': 'B-201',
            'floor': 'Second Floor',
            'section': 'Discussion Pods',
            'seat_type': 'DISCUSSION',
            'is_active': True,
            'is_under_maintenance': False
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Seat.objects.filter(seat_number='B-201').exists())

    def test_student_cannot_create_seat(self):
        self.client.force_authenticate(user=self.student)
        url = reverse('admin_seats_create')
        data = {'seat_number': 'HACK-1', 'floor': 'First Floor', 'section': 'Quiet Zone'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_time_slot_duration_validation(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin_slots_list_create')
        # Slot less than 30 minutes
        invalid_data = {
            'slot_name': 'Too Short',
            'start_time': '10:00:00',
            'end_time': '10:15:00',
            'is_active': True
        }
        response = self.client.post(url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

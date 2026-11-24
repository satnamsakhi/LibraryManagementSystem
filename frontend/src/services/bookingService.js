import api from './api';

export const bookingService = {
  async createBooking(bookingData) {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  },

  async getMyBookings(params = {}) {
    const response = await api.get('/bookings/my-bookings/', { params });
    return response.data;
  },

  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  },

  async cancelBooking(id, reason = '') {
    const response = await api.post(`/bookings/${id}/cancel/`, {
      cancellation_reason: reason,
    });
    return response.data;
  },

  async getStudentDashboard() {
    const response = await api.get('/dashboard/student/');
    return response.data;
  },
};

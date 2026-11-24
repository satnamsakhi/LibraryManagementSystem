import api from './api';

export const adminService = {
  // Dashboard & Reports
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/');
    return response.data;
  },

  async getReports() {
    const response = await api.get('/admin/reports/');
    return response.data;
  },

  // User Management
  async getUsers(params = {}) {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.patch(`/admin/users/${id}/`, userData);
    return response.data;
  },

  // Seat Management
  async createSeat(seatData) {
    const response = await api.post('/admin/seats/', seatData);
    return response.data;
  },

  async updateSeat(id, seatData) {
    const response = await api.put(`/admin/seats/${id}/`, seatData);
    return response.data;
  },

  async deleteSeat(id) {
    const response = await api.delete(`/admin/seats/${id}/`);
    return response.data;
  },

  // Slot Management
  async getSlots() {
    const response = await api.get('/admin/slots/');
    return response.data;
  },

  async createSlot(slotData) {
    const response = await api.post('/admin/slots/', slotData);
    return response.data;
  },

  async updateSlot(id, slotData) {
    const response = await api.put(`/admin/slots/${id}/`, slotData);
    return response.data;
  },

  async deleteSlot(id) {
    const response = await api.delete(`/admin/slots/${id}/`);
    return response.data;
  },

  // Booking Management
  async getBookings(params = {}) {
    const response = await api.get('/admin/bookings/', { params });
    return response.data;
  },

  async cancelBooking(id, reason = '') {
    const response = await api.post(`/admin/bookings/${id}/cancel/`, {
      cancellation_reason: reason,
    });
    return response.data;
  },
};

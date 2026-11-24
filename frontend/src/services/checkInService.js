import api from './api';

export const checkInService = {
  /**
   * Retrieves the current digital entry QR pass for an authorized booking.
   */
  async getBookingPass(bookingId) {
    const response = await api.get(`/bookings/${bookingId}/check-in-pass/`);
    return response.data;
  },

  /**
   * Reissues / refreshes the QR pass, invalidating previous credentials.
   */
  async refreshBookingPass(bookingId) {
    const response = await api.post(`/bookings/${bookingId}/check-in-pass/issue/`);
    return response.data;
  },

  /**
   * Gate scanner verification: validates a scanned QR token and records student entrance.
   */
  async verifyGateCheckIn(token, gateName = 'Main Gate Scanner') {
    const response = await api.post('/gate/check-in/', {
      token,
      gate_name: gateName,
    });
    return response.data;
  },

  /**
   * Retrieves entry audit logs for administrators and librarians.
   */
  async getGateHistory(params = {}) {
    const response = await api.get('/gate/history/', { params });
    return response.data;
  },

  /**
   * Summary statistics for the gate scanner interface.
   */
  async getGateStats() {
    const response = await api.get('/gate/stats/');
    return response.data;
  },
};

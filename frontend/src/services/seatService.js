import api from './api';

export const seatService = {
  async getSeats(params = {}) {
    const response = await api.get('/seats/', { params });
    return response.data;
  },

  async getAvailableSeats(params = {}) {
    const response = await api.get('/seats/available/', { params });
    return response.data;
  },

  async getSeatById(id) {
    const response = await api.get(`/seats/${id}/`);
    return response.data;
  },

  async getTimeSlots() {
    const response = await api.get('/slots/');
    return response.data;
  },

  async getPublicStats() {
    const response = await api.get('/seats/public-stats/');
    return response.data;
  },
};

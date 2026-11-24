import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await api.post('/auth/logout/', { refresh: refreshToken });
    } catch (e) {
      // Continue cleanup even if server invalidation errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile/', profileData);
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.post('/users/change-password/', passwordData);
    return response.data;
  },
};

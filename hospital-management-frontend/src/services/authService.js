import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/profile/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/api/profile/me', userData);
    return response.data;
  },

  deleteProfile: async () => {
    await api.delete('/api/profile/me');
  }
};
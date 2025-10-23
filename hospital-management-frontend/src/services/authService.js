import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    console.log('🔐 Login service response:', response.data);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    try {
      console.log('🔄 Getting user profile...');
      // Since your backend doesn't have /api/profile/me, we'll use the user info from login
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      // For now, return basic user info - you'll need to create a proper profile endpoint
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('👤 Profile service response (from localStorage):', userData);
      return userData;
    } catch (error) {
      console.error('❌ Error getting profile:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    const response = await api.put('/api/profile/me', userData);
    return response.data;
  },

  deleteProfile: async () => {
    await api.delete('/api/profile/me');
  }
};
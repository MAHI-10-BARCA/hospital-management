import api from './api';

const profileService = {
  // Get current user's profile
  getCurrentProfile: async () => {
    try {
      const response = await api.get('/api/profile/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/api/profile/user', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update doctor profile
  updateDoctorProfile: async (doctorData) => {
    try {
      const response = await api.put('/api/profile/doctor', doctorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update patient profile
  updatePatientProfile: async (patientData) => {
    try {
      const response = await api.put('/api/profile/patient', patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post('/api/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default profileService;
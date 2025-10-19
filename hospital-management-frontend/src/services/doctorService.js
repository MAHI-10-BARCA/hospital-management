import api from './api';

export const doctorService = {
  getAll: async () => {
    const response = await api.get('/doctors');
    // Add user ID to each doctor object
    const doctorsWithUserId = response.data.map(doctor => ({
      ...doctor,
      userId: doctor.user?.id // Extract user ID from the nested user object
    }));
    return doctorsWithUserId;
  },

  checkDoctorProfile: async () => {
    try {
      const response = await api.get('/api/doctor-profile/check');
      return response.data;
    } catch (error) {
      console.error('Error checking doctor profile:', error);
      throw error;
    }
  },

  // Create doctor profile for current user
  createDoctorProfile: async (profileData) => {
    try {
      const response = await api.post('/api/doctor-profile/create', profileData);
      return response.data;
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      throw error;
    }
  },

  // Get current user's doctor profile
  getMyDoctorProfile: async () => {
    try {
      const response = await api.get('/api/doctor-profile/me');
      return response.data;
    } catch (error) {
      console.error('Error getting doctor profile:', error);
      throw error;
    }
  },

  getById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  create: async (doctorData) => {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  },

  update: async (id, doctorData) => {
    const response = await api.put(`/doctors/${id}`, doctorData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/doctors/${id}`);
  }
};
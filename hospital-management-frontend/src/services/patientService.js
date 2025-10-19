import api from './api';

export const patientService = {
  getAll: async () => {
    const response = await api.get('/patients');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  update: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/patients/${id}`);
  },

  // Patient profile methods
  checkPatientProfile: async () => {
    try {
      const response = await api.get('/api/patient-profile/check');
      return response.data;
    } catch (error) {
      console.error('Error checking patient profile:', error);
      throw error;
    }
  },

  createPatientProfile: async (profileData) => {
    try {
      const response = await api.post('/api/patient-profile/create', profileData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient profile:', error);
      throw error;
    }
  },

  getMyPatientProfile: async () => {
    try {
      const response = await api.get('/api/patient-profile/me');
      return response.data;
    } catch (error) {
      console.error('Error getting patient profile:', error);
      throw error;
    }
  }
};
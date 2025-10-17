import api from './api';

export const appointmentService = {
  getAll: async () => {
    const response = await api.get('/api/appointments');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/appointments/${id}`);
    return response.data;
  },

  create: async (appointmentData) => {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  },

  getByPatient: async (patientId) => {
    const response = await api.get(`/api/appointments/patient/${patientId}`);
    return response.data;
  },

  getByDoctor: async (doctorId) => {
    const response = await api.get(`/api/appointments/doctor/${doctorId}`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/appointments/${id}`);
  }
};
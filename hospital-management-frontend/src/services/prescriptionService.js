// services/prescriptionService.js
import api from './api';

export const prescriptionService = {
  create: async (prescriptionData) => {
    const response = await api.post('/api/prescriptions', prescriptionData);
    return response.data;
  },

  getByAppointment: async (appointmentId) => {
    try {
      const response = await api.get(`/api/prescriptions/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No prescription found
      }
      throw error;
    }
  },

  getMyPrescriptions: async () => {
    const response = await api.get('/api/prescriptions/my-prescriptions');
    return response.data;
  },

  getDoctorPrescriptions: async () => {
    const response = await api.get('/api/prescriptions/doctor-prescriptions');
    return response.data;
  },

  update: async (id, prescriptionData) => {
    const response = await api.put(`/api/prescriptions/${id}`, prescriptionData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/prescriptions/${id}`);
  }
};
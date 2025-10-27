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
        return null;
      }
      throw error;
    }
  },

  // ✅ FIXED: Get prescription by appointment ID for patient
  getByAppointmentForPatient: async (appointmentId) => {
    try {
      console.log(`🔍 Fetching prescription for appointment ${appointmentId} for patient`);
      const response = await api.get(`/api/prescriptions/appointment/${appointmentId}/patient`);
      console.log('✅ Prescription API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching prescription:', error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        return null;
      }
      throw error;
    }
  },

  // ✅ ADDED: Get all prescriptions for current patient
  getMyPrescriptions: async () => {
    try {
      console.log('🔍 Fetching all prescriptions for current patient');
      const response = await api.get('/api/prescriptions/patient/my-prescriptions');
      console.log('✅ Patient prescriptions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      return [];
    }
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
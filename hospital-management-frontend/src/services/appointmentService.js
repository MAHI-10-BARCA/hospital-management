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
    try {
      console.log('📅 Creating appointment:', appointmentData);
      
      // ✅ FIXED: Send proper appointment structure
      const requestData = {
        patient: { id: appointmentData.patient?.id }, // Only send patient ID
        doctor: { id: appointmentData.doctor.id }, // Only send doctor ID
        schedule: { id: appointmentData.schedule.id }, // Only send schedule ID
        status: 'SCHEDULED'
      };
      
      console.log('📤 Sending appointment request:', requestData);
      const response = await api.post('/api/appointments', requestData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      // Handle admin booking restriction error
      if (error.response?.data?.includes('Admins are not allowed')) {
        throw new Error('Admins cannot book appointments. Please use a patient account.');
      }
      if (error.response?.data?.includes('Patient profile not found')) {
        throw new Error('Please complete your patient profile before booking appointments.');
      }
      throw error;
    }
  },

  getByPatient: async (patientId) => {
    const response = await api.get(`/api/appointments/patient/${patientId}`);
    return response.data;
  },

  getByDoctor: async (doctorId) => {
    const response = await api.get(`/api/appointments/doctor/${doctorId}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/api/appointments/${id}/status?status=${status}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/api/appointments/${id}/cancel`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/appointments/${id}`);
  }
};
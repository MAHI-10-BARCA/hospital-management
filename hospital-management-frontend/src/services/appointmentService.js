import api from './api';

export const appointmentService = {
  getAll: async () => {
    try {
      console.log('🔄 Fetching all appointments...');
      const response = await api.get('/api/appointments');
      console.log('📅 Appointments API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  create: async (appointmentData) => {
    try {
      console.log('📅 Creating appointment with data:', appointmentData);
      
      // ✅ FIXED: Enhanced data structure with validation
      if (!appointmentData.doctor?.id) {
        throw new Error('Doctor ID is required');
      }
      if (!appointmentData.schedule?.id) {
        throw new Error('Schedule ID is required');
      }
      
      const requestData = {
        patient: appointmentData.patient?.id ? { id: appointmentData.patient.id } : null,
        doctor: { id: appointmentData.doctor.id },
        schedule: { id: appointmentData.schedule.id },
        status: 'SCHEDULED',
        reason: appointmentData.reason || 'Regular checkup'
      };
      
      console.log('📤 Sending appointment request:', requestData);
      const response = await api.post('/api/appointments', requestData);
      console.log('✅ Appointment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      
      // Enhanced error handling
      const errorMessage = error.response?.data;
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('Admins are not allowed')) {
          throw new Error('Admins cannot book appointments. Please use a patient account.');
        }
        if (errorMessage.includes('Patient profile not found')) {
          throw new Error('Please complete your patient profile before booking appointments.');
        }
        if (errorMessage.includes('Doctor not found')) {
          throw new Error('Selected doctor is not available. Please choose another doctor.');
        }
        if (errorMessage.includes('Schedule not found')) {
          throw new Error('Selected time slot is no longer available. Please choose another time.');
        }
        if (errorMessage.includes('time slot is fully booked')) {
          throw new Error('Selected time slot is fully booked. Please choose another available time.');
        }
        throw new Error(errorMessage);
      } else if (errorMessage?.message) {
        throw new Error(errorMessage.message);
      } else {
        throw new Error('Failed to book appointment. Please try again.');
      }
    }
  },

  getByPatient: async (patientId) => {
    try {
      const response = await api.get(`/api/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching appointments for patient ${patientId}:`, error);
      return [];
    }
  },

  getByDoctor: async (doctorId) => {
    try {
      const response = await api.get(`/api/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching appointments for doctor ${doctorId}:`, error);
      return [];
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/api/appointments/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating appointment status ${id}:`, error);
      throw error;
    }
  },

  update: async (id, appointmentData) => {
    try {
      const response = await api.put(`/api/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  cancel: async (id) => {
    try {
      const response = await api.put(`/api/appointments/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error cancelling appointment ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/api/appointments/${id}`);
    } catch (error) {
      console.error(`❌ Error deleting appointment ${id}:`, error);
      throw error;
    }
  },

  getByStatus: async (status) => {
    try {
      const response = await api.get(`/api/appointments/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${status} appointments:`, error);
      return [];
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/api/appointments/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching appointment stats:', error);
      return {
        totalAppointments: 0,
        scheduledAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0
      };
    }
  },

  // ✅ ADDED: Get my appointments (for current user)
  getMyAppointments: async () => {
    try {
      console.log('🔄 Getting appointments for current user...');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (userData.roles?.includes('ROLE_PATIENT')) {
        const patientService = await import('./patientService');
        const patientProfile = await patientService.default.getMyPatientProfile();
        return await appointmentService.getByPatient(patientProfile.id);
      } else if (userData.roles?.includes('ROLE_DOCTOR')) {
        const doctorService = await import('./doctorService');
        const doctorProfile = await doctorService.default.getMyDoctorProfile();
        return await appointmentService.getByDoctor(doctorProfile.id);
      } else {
        return await appointmentService.getAll();
      }
    } catch (error) {
      console.error('❌ Error getting my appointments:', error);
      return [];
    }
  }
};
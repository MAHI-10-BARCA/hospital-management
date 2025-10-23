import api from './api';

export const scheduleService = {
  // Doctor creates their own schedule
  createDoctorSchedule: async (doctorId, scheduleData) => {
    try {
      console.log('🔄 Creating schedule for doctor:', doctorId);
      console.log('📅 Schedule data:', scheduleData);
      
      if (!doctorId) {
        throw new Error('Doctor ID is required');
      }

      const requestData = {
        availableDate: scheduleData.availableDate,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        slotDuration: parseInt(scheduleData.slotDuration) || 30,
        maxPatients: parseInt(scheduleData.maxPatients) || 1
      };
      
      console.log('📤 Sending schedule request:', requestData);
      const response = await api.post(`/api/schedules/doctor/${doctorId}`, requestData);
      console.log('✅ Schedule created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating schedule:', error);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  },

  // Admin creates schedule for any doctor
  createAdminSchedule: async (scheduleData) => {
    try {
      const requestData = {
        doctorId: scheduleData.doctorId,
        availableDate: scheduleData.availableDate,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        slotDuration: parseInt(scheduleData.slotDuration) || 30,
        maxPatients: parseInt(scheduleData.maxPatients) || 1
      };
      const response = await api.post('/api/schedules/admin', requestData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating admin schedule:', error);
      throw error;
    }
  },

  // Get available slots for patients
  getAvailableByDoctor: async (doctorId) => {
    try {
      if (!doctorId) {
        console.error('❌ Doctor ID is required for getting available schedules');
        return [];
      }
      console.log('🔄 Getting available schedules for doctor:', doctorId);
      
      const response = await api.get(`/api/schedules/doctor/${doctorId}/available`);
      console.log(`✅ Available schedules for doctor ${doctorId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error loading available schedules for doctor ${doctorId}:`, error);
      console.error('❌ Error details:', error.response?.data);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  // Get all schedules for admin view
  getAllByDoctor: async (doctorId) => {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required');
      }
      console.log('🔄 Getting all schedules for doctor:', doctorId);
      
      const response = await api.get(`/api/schedules/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error loading all schedules:', error);
      return [];
    }
  },

  // Get doctor's own schedules
  getDoctorOwnSchedules: async (doctorId) => {
    try {
      console.log('🔄 Getting doctor own schedules for doctor:', doctorId);
      
      if (!doctorId) {
        throw new Error('Doctor ID is required');
      }
      
      const response = await api.get(`/api/schedules/doctor/${doctorId}/my-schedules`);
      console.log('✅ Doctor schedules loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting doctor schedules:', error);
      // Return empty array instead of throwing
      return [];
    }
  },

  // Update schedule
  update: async (id, scheduleData) => {
    try {
      console.log('🔄 Updating schedule ID:', id);
      console.log('📅 Update data:', scheduleData);
      
      const requestData = {
        availableDate: scheduleData.availableDate,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        slotDuration: parseInt(scheduleData.slotDuration) || 30,
        maxPatients: parseInt(scheduleData.maxPatients) || 1
      };
      
      console.log('📤 Sending update request:', requestData);
      
      const response = await api.put(`/api/schedules/${id}`, requestData);
      console.log('✅ Schedule updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Delete schedule
  delete: async (id) => {
    try {
      console.log('🗑️ Deleting schedule:', id);
      await api.delete(`/api/schedules/${id}`);
    } catch (error) {
      console.error('❌ Error deleting schedule:', error);
      throw error;
    }
  },

  // Get schedules for current doctor
  getMySchedules: async () => {
    try {
      console.log('🔄 Getting schedules for current doctor...');
      
      // First get the current doctor profile
      const doctorProfile = await import('./doctorService').then(module => 
        module.default.getMyDoctorProfile()
      );
      
      if (!doctorProfile || !doctorProfile.id) {
        throw new Error('Doctor profile not found');
      }
      
      console.log('👤 Current doctor profile:', doctorProfile);
      console.log('🆔 Doctor ID for schedules:', doctorProfile.id);
      
      // Then get schedules using the doctor ID
      return await scheduleService.getDoctorOwnSchedules(doctorProfile.id);
    } catch (error) {
      console.error('❌ Error getting my schedules:', error);
      throw error;
    }
  },

  // ✅ ADDED: Get all schedules (for admin)
  getAll: async () => {
    try {
      console.log('🔄 Getting all schedules...');
      // Since there's no direct endpoint, we'll get all doctors and their schedules
      const doctorService = await import('./doctorService');
      const doctors = await doctorService.default.getAll();
      
      let allSchedules = [];
      for (const doctor of doctors) {
        try {
          const schedules = await scheduleService.getAllByDoctor(doctor.id);
          allSchedules = [...allSchedules, ...schedules.map(schedule => ({
            ...schedule,
            doctorName: doctor.name
          }))];
        } catch (error) {
          console.warn(`⚠️ Could not get schedules for doctor ${doctor.id}:`, error.message);
        }
      }
      
      return allSchedules;
    } catch (error) {
      console.error('❌ Error getting all schedules:', error);
      return [];
    }
  },

  // ✅ ADDED: Get all available schedules across all doctors
  getAllAvailableSchedules: async () => {
    try {
      console.log('🔄 Getting all available schedules across all doctors...');
      const doctorService = await import('./doctorService');
      const doctors = await doctorService.default.getAll();
      
      let allAvailableSchedules = [];
      for (const doctor of doctors) {
        try {
          const schedules = await scheduleService.getAvailableByDoctor(doctor.id);
          allAvailableSchedules = [...allAvailableSchedules, ...schedules.map(schedule => ({
            ...schedule,
            doctorName: doctor.name,
            doctorSpecialization: doctor.specialization,
            doctorContact: doctor.contact
          }))];
        } catch (error) {
          console.warn(`⚠️ Could not get available schedules for doctor ${doctor.id}:`, error.message);
        }
      }
      
      console.log(`✅ Found ${allAvailableSchedules.length} available schedules across ${doctors.length} doctors`);
      return allAvailableSchedules;
    } catch (error) {
      console.error('❌ Error getting all available schedules:', error);
      return [];
    }
  }
};
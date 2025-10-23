import api from './api';

export const doctorService = {
  getAll: async () => {
    try {
      console.log('🔄 Fetching all doctors...');
      const response = await api.get('/doctors');
      console.log('✅ Doctors API raw response:', response);
      
      // ✅ FIXED: Handle different response formats
      let doctors = [];
      if (Array.isArray(response.data)) {
        doctors = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's a single object, wrap it in an array
        doctors = [response.data];
      } else {
        console.warn('⚠️ Unexpected doctors response format:', response.data);
        doctors = [];
      }
      
      console.log(`📋 Processed ${doctors.length} doctors:`, doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        contact: d.contact,
        userId: d.user?.id
      })));
      
      return doctors;
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      console.error('❌ Error details:', error.response?.data);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching doctor ${id}:`, error);
      throw error;
    }
  },

  create: async (doctorData) => {
    try {
      const response = await api.post('/doctors', doctorData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating doctor:', error);
      throw error;
    }
  },

  update: async (id, doctorData) => {
    try {
      const response = await api.put(`/doctors/${id}`, doctorData);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating doctor ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/doctors/${id}`);
    } catch (error) {
      console.error(`❌ Error deleting doctor ${id}:`, error);
      throw error;
    }
  },

  // ✅ FIXED: Profile methods that match your backend structure
  getMyDoctorProfile: async () => {
    try {
      console.log('🔄 Getting current doctor profile...');
      const response = await api.get('/api/doctor-profile/me');
      console.log('✅ Doctor profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting doctor profile:', error);
      throw error;
    }
  },

  // ✅ ADDED: Check if doctor profile exists
  checkDoctorProfile: async () => {
    try {
      const response = await api.get('/api/doctor-profile/check');
      return response.data;
    } catch (error) {
      console.error('Error checking doctor profile:', error);
      return { exists: false, error: error.message };
    }
  },

  // ✅ ADDED: Create doctor profile
  createDoctorProfile: async (profileData) => {
    try {
      const response = await api.post('/api/doctor-profile/create', profileData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating doctor profile:', error);
      throw error;
    }
  },

  // ✅ ADDED: Get doctors with available schedules
  getDoctorsWithSchedules: async () => {
    try {
      console.log('🔄 Fetching doctors with available schedules...');
      const doctors = await doctorService.getAll();
      
      // For each doctor, check if they have available schedules
      const doctorsWithSchedules = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const schedules = await import('./scheduleService').then(module => 
              module.default.getAvailableByDoctor(doctor.id)
            );
            return {
              ...doctor,
              hasAvailableSchedules: schedules.length > 0,
              availableSchedulesCount: schedules.length
            };
          } catch (error) {
            console.warn(`⚠️ Could not get schedules for doctor ${doctor.id}:`, error.message);
            return {
              ...doctor,
              hasAvailableSchedules: false,
              availableSchedulesCount: 0
            };
          }
        })
      );
      
      console.log('✅ Doctors with schedules:', doctorsWithSchedules);
      return doctorsWithSchedules;
    } catch (error) {
      console.error('❌ Error getting doctors with schedules:', error);
      return [];
    }
  }
};
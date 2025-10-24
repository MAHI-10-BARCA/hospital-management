import api from './api';

export const patientService = {
  getAll: async () => {
    try {
      console.log('🔄 Fetching all patients...');
      // ✅ FIXED: Changed from '/patients' to '/api/patients'
      const response = await api.get('/api/patients');
      console.log('✅ Patients API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      // ✅ FIXED: Changed from '/patients' to '/api/patients'
      const response = await api.get(`/api/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  create: async (patientData) => {
    try {
      console.log('🔄 Creating patient profile via /api/patients endpoint...');
      // ✅ FIXED: Changed from '/patients' to '/api/patients'
      const response = await api.post('/api/patients', patientData);
      console.log('✅ Patient created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating patient:', error);
      throw error;
    }
  },

  update: async (id, patientData) => {
    try {
      // ✅ FIXED: Changed from '/patients' to '/api/patients'
      const response = await api.put(`/api/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating patient ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      // ✅ FIXED: Changed from '/patients' to '/api/patients'
      await api.delete(`/api/patients/${id}`);
    } catch (error) {
      console.error(`❌ Error deleting patient ${id}:`, error);
      throw error;
    }
  },

  // ✅ FIXED: Patient profile methods using the new endpoints
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
      console.log('🔄 Creating patient profile via /api/patient-profile/create endpoint...');
      const response = await api.post('/api/patient-profile/create', profileData);
      console.log('✅ Patient profile created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating patient profile:', error);
      throw error;
    }
  },

  getMyPatientProfile: async () => {
    try {
      console.log('🔄 Getting current patient profile...');
      const response = await api.get('/api/patient-profile/me');
      console.log('✅ Patient profile retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting patient profile:', error);
      throw error;
    }
  },

  updateMyPatientProfile: async (profileData) => {
    try {
      const response = await api.put('/api/patient-profile/me', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient profile:', error);
      throw error;
    }
  },

  // ✅ ADDED: Auto-create patient profile if missing
  ensurePatientProfile: async (profileData) => {
    try {
      // First try to get existing profile
      const existingProfile = await patientService.getMyPatientProfile();
      console.log('✅ Patient profile already exists:', existingProfile);
      return existingProfile;
    } catch (error) {
      console.log('⚠️ No patient profile found, creating new one...');
      // If profile doesn't exist, create it
      return await patientService.createPatientProfile(profileData);
    }
  },

  // ✅ ADDED: Get patients by doctor (for doctor-specific patient view)
  getPatientsByDoctor: async (doctorId) => {
    try {
      console.log(`🔄 Getting patients for doctor ${doctorId}...`);
      // Get appointments for this doctor to find patients
      const appointmentService = await import('./appointmentService');
      const appointments = await appointmentService.default.getByDoctor(doctorId);
      
      // Extract unique patients
      const uniquePatients = [];
      const patientIds = new Set();
      
      appointments.forEach(apt => {
        if (apt.patientId && !patientIds.has(apt.patientId)) {
          patientIds.add(apt.patientId);
          uniquePatients.push({
            id: apt.patientId,
            name: apt.patientName || 'Unknown Patient',
            // Add more patient details if available
            age: apt.patientAge || 'Unknown',
            gender: apt.patientGender || 'Unknown'
          });
        }
      });
      
      console.log(`✅ Found ${uniquePatients.length} patients for doctor ${doctorId}`);
      return uniquePatients;
    } catch (error) {
      console.error(`❌ Error getting patients for doctor ${doctorId}:`, error);
      return [];
    }
  }
};
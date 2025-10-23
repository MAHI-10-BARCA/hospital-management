import api from './api';

export const patientService = {
  getAll: async () => {
    try {
      console.log('🔄 Fetching all patients...');
      const response = await api.get('/patients');
      console.log('✅ Patients API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  create: async (patientData) => {
    try {
      console.log('🔄 Creating patient profile via /patients endpoint...');
      const response = await api.post('/patients', patientData);
      console.log('✅ Patient created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating patient:', error);
      throw error;
    }
  },

  update: async (id, patientData) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating patient ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/patients/${id}`);
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
  }
};
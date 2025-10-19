import api from './api';

export const scheduleService = {
  // Doctor creates their own schedule - UPDATED: Now uses userId
  createDoctorSchedule: async (userId, scheduleData) => {
    console.log('🔄 Creating schedule for user:', userId);
    console.log('📅 Schedule data:', scheduleData);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const requestData = {
      doctorId: parseInt(userId), // This is now the User ID
      availableDate: scheduleData.availableDate,
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      slotDuration: parseInt(scheduleData.slotDuration) || 30,
      maxPatients: parseInt(scheduleData.maxPatients) || 1
    };
    
    console.log('📤 Sending schedule request:', requestData);
    const response = await api.post(`/api/schedules/doctor/${userId}`, requestData);
    return response.data;
  },

  // Admin creates schedule for any doctor
  createAdminSchedule: async (scheduleData) => {
    const requestData = {
      doctorId: scheduleData.doctorId, // This should be User ID
      availableDate: scheduleData.availableDate,
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      slotDuration: parseInt(scheduleData.slotDuration) || 30,
      maxPatients: parseInt(scheduleData.maxPatients) || 1
    };
    const response = await api.post('/api/schedules/admin', requestData);
    return response.data;
  },

  // Get available slots for patients - UPDATED: Now uses userId
  getAvailableByDoctor: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    console.log('🔄 Getting available schedules for user:', userId);
    const response = await api.get(`/api/schedules/doctor/${userId}/available`);
    return response.data;
  },

  // Get all schedules for admin view - UPDATED: Now uses userId
  getAllByDoctor: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    console.log('🔄 Getting all schedules for user:', userId);
    const response = await api.get(`/api/schedules/doctor/${userId}`);
    return response.data;
  },

  // Get doctor's own schedules - UPDATED: Now uses userId
  getDoctorOwnSchedules: async (userId) => {
    console.log('🔄 Getting doctor own schedules for user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    try {
      const response = await api.get(`/api/schedules/doctor/${userId}/my-schedules`);
      console.log('✅ Doctor schedules loaded:', response.data);
      return response.data;
    } catch (error) {
      console.warn('❌ Doctor schedules endpoint failed, trying available schedules...');
      try {
        // Fallback to available schedules
        const response = await api.get(`/api/schedules/doctor/${userId}/available`);
        console.log('✅ Available schedules loaded as fallback:', response.data);
        return response.data;
      } catch (fallbackError) {
        console.error('❌ All schedule endpoints failed:', fallbackError);
        return [];
      }
    }
  },

  // ✅ FIXED: Update schedule method with better error handling
  update: async (id, scheduleData) => {
    console.log('🔄 Updating schedule ID:', id);
    console.log('📅 Update data:', scheduleData);
    
    const requestData = {
      doctorId: scheduleData.doctorId || scheduleData.doctor?.user?.id, // Use doctorId directly
      availableDate: scheduleData.availableDate,
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      slotDuration: parseInt(scheduleData.slotDuration) || 30,
      maxPatients: parseInt(scheduleData.maxPatients) || 1
    };
    
    console.log('📤 Sending update request:', requestData);
    
    try {
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
    console.log('🗑️ Deleting schedule:', id);
    await api.delete(`/api/schedules/${id}`);
  },

  // NEW: Get schedules for current doctor (uses profile endpoint to get user ID)
  getMySchedules: async () => {
    try {
      // First get the current user profile to get the user ID
      const profileResponse = await api.get('/api/profile/me');
      const user = profileResponse.data;
      
      if (!user || !user.id) {
        throw new Error('User ID not available');
      }
      
      console.log('👤 Current user:', user);
      console.log('🆔 User ID for schedules:', user.id);
      
      // Then get schedules using the user ID
      return await scheduleService.getDoctorOwnSchedules(user.id);
    } catch (error) {
      console.error('❌ Error getting my schedules:', error);
      throw error;
    }
  }
};
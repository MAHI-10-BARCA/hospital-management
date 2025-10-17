import api from './api';

export const scheduleService = {
  create: async (scheduleData) => {
    const response = await api.post('/api/schedules', scheduleData);
    return response.data;
  },

  getAvailableByDoctor: async (doctorId) => {
    const response = await api.get(`/api/schedules/doctor/${doctorId}/available`);
    return response.data;
  },

  getAllByDoctor: async (doctorId) => {
    const response = await api.get(`/api/schedules/doctor/${doctorId}`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/schedules/${id}`);
  }
};
import api from './api';

export const organizerService = {
  getProfile: async () => {
    const response = await api.get('/api/organizer/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/organizer/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/api/organizer/change-password', data);
    return response.data;
  },
};

export default organizerService;

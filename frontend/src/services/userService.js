import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/user/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/api/user/change-password', data);
    return response.data;
  },
};

export default userService;

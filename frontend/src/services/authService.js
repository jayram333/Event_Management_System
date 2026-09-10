import api from './api';

export const authService = {
  loginUser: async (credentials) => {
    const response = await api.post('/api/auth/user/login', credentials);
    return response.data;
  },

  loginOrganizer: async (credentials) => {
    const response = await api.post('/api/auth/organizer/login', credentials);
    return response.data;
  },

  loginAdmin: async (credentials) => {
    const response = await api.post('/api/admin/login', credentials);
    return response.data;
  },

  registerUser: async (userData) => {
    const response = await api.post('/api/auth/user/register', userData);
    return response.data;
  },

  registerOrganizer: async (organizerData) => {
    const response = await api.post('/api/auth/organizer/register', organizerData);
    return response.data;
  },

  verifyEmailOtp: async (data) => {
    const response = await api.post('/api/auth/verify-email', data);
    return response.data;
  },

  checkProtected: async () => {
    const response = await api.get('/api/auth/protected');
    return response.data;
  },

  forgotPassword: async (data) => {
    const response = await api.post('/api/auth/forgot-password', data);
    return response.data;
  },

  verifyResetOtp: async (data) => {
    const response = await api.post('/api/auth/verify-reset-otp', data);
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post('/api/auth/reset-password', data);
    return response.data;
  },
};

export default authService;

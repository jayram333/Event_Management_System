import api from './api';

export const adminService = {
  getProfile: async () => {
    const response = await api.get('/api/admin/profile');
    return response.data;
  },

  getAllOrganizers: async () => {
    const response = await api.get('/api/admin/organizers');
    return response.data;
  },

  getOrganizerById: async (id) => {
    const response = await api.get(`/api/admin/organizers/${id}`);
    return response.data;
  },

  updateOrganizerStatus: async (id, isActive) => {
    const response = await api.put(`/api/admin/organizers/${id}/status`, { isActive });
    return response.data;
  },

  deleteOrganizer: async (id) => {
    const response = await api.delete(`/api/admin/organizers/${id}`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id, isActive) => {
    const response = await api.put(`/api/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  getAllEvents: async () => {
    const response = await api.get('/api/admin/events');
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/api/admin/events/${id}`);
    return response.data;
  },
};

export default adminService;

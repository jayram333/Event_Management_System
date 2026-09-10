import api from './api';

export const eventService = {
  createEvent: async (eventData) => {
    const response = await api.post('/api/events', eventData);
    return response.data;
  },

  getOrganizerEvents: async () => {
    const response = await api.get('/api/events');
    return response.data;
  },

  getUpcomingEvents: async () => {
    const response = await api.get('/api/events/upcoming');
    return response.data;
  },

  getJoinedEvents: async () => {
    const response = await api.get('/api/events/joined');
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/api/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/api/events/${id}`);
    return response.data;
  },

  updateEventStatus: async (id, status) => {
    const response = await api.patch(`/api/events/${id}/status`, { status });
    return response.data;
  },

  sendJoinRequest: async (id) => {
    const response = await api.post(`/api/events/${id}/join-request`);
    return response.data;
  },

  getMyJoinRequest: async (id) => {
    const response = await api.get(`/api/events/${id}/join-request`);
    return response.data;
  },

  leaveEvent: async (id) => {
    const response = await api.delete(`/api/events/${id}/join`);
    return response.data;
  },

  getJoinRequests: async (id) => {
    const response = await api.get(`/api/events/${id}/join-requests`);
    return response.data;
  },

  approveJoinRequest: async (id, userId) => {
    const response = await api.patch(`/api/events/${id}/join-requests/${userId}/approve`);
    return response.data;
  },

  rejectJoinRequest: async (id, userId) => {
    const response = await api.patch(`/api/events/${id}/join-requests/${userId}/reject`);
    return response.data;
  },

  getEventCoordinators: async (id) => {
    const response = await api.get(`/api/events/${id}/coordinators`);
    return response.data;
  },

  updateTask: async (id, taskId, taskData) => {
    const response = await api.put(`/api/events/${id}/tasks/${taskId}`, taskData);
    return response.data;
  },

  assignCoordinatorToTask: async (id, taskId, coordinatorId) => {
    const response = await api.put(`/api/events/${id}/tasks/${taskId}/assign`, { coordinatorId });
    return response.data;
  },

  deleteTask: async (id, taskId) => {
    const response = await api.delete(`/api/events/${id}/tasks/${taskId}`);
    return response.data;
  },

  submitTaskForVerification: async (id, taskId, remarks) => {
    const response = await api.patch(`/api/events/${id}/tasks/${taskId}/submit`, { remarks });
    return response.data;
  },

  verifyTask: async (id, taskId, data) => {
    const response = await api.patch(`/api/events/${id}/tasks/${taskId}/verify`, data);
    return response.data;
  },

  rescheduleEventTasks: async (id, taskId, data) => {
    const response = await api.post(`/api/events/${id}/tasks/${taskId}/reschedule`, data);
    return response.data;
  },
};

export default eventService;

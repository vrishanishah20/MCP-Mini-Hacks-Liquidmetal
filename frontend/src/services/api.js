/**
 * API service for communicating with the backend
 */

import axios from 'axios';

// Use empty string for relative URLs when using proxy, or full URL for production
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for backend responses
});

export const chatAPI = {
  sendMessage: async (message, sessionId = null) => {
    const payload = { message };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    const response = await api.post('/api/chat', payload);
    return response.data;
  },
};

export const neighborhoodAPI = {
  getAll: async () => {
    const response = await api.get('/api/neighborhoods');
    return response.data;
  },

  getDashboard: async (neighborhood) => {
    const response = await api.get(`/api/dashboard/${neighborhood}`);
    return response.data;
  },
};

export const dataAPI = {
  getHousing: async (neighborhood) => {
    const response = await api.get(`/api/housing/${neighborhood}`);
    return response.data;
  },

  getCrime: async (neighborhood) => {
    const response = await api.get(`/api/crime/${neighborhood}`);
    return response.data;
  },

  get311Calls: async (neighborhood) => {
    const response = await api.get(`/api/311/${neighborhood}`);
    return response.data;
  },
};

export default api;

import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      // In a real app, redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Health check
  checkHealth: async () => {
    const response = await axios.get(`http://localhost:5000/health`);
    return response.data;
  },

  // Test API connection
  testConnection: async () => {
    const response = await api.get('/test');
    return response.data;
  },

  // Verify all services
  verifyServices: async () => {
    const response = await api.get('/verify');
    return response.data;
  },

  // Verify database
  verifyDatabase: async () => {
    const response = await api.get('/verify/database');
    return response.data;
  },

  // Verify external services
  verifyCloudinary: async () => {
    const response = await api.get('/verify/cloudinary');
    return response.data;
  },

  verifyStripe: async () => {
    const response = await api.get('/verify/stripe');
    return response.data;
  },

  verifyEmail: async () => {
    const response = await api.get('/verify/email');
    return response.data;
  },
};

export default api;
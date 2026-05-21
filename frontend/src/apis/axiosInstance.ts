import axios from 'axios';

// Use environment variable with fallback to default port 3001
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into all outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Graceful response interceptor for debugging and robust error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API request error intercepted globally:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

import axios from 'axios';

// Use environment variable with fallback to default port 3001
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-seed development token for seamless local developer testing if none is set
if (typeof window !== 'undefined') {
  const currentToken = localStorage.getItem('jwt_token') || localStorage.getItem('token');
  if (!currentToken) {
    localStorage.setItem('jwt_token', 'development-token-glowassist');
  }
}

// Automatically inject JWT token into all outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    
    // Absolute fallback: if no token is found, or if it is empty/invalid, use the development token
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      token = 'development-token-glowassist';
    }
    
    config.headers.Authorization = `Bearer ${token}`;
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

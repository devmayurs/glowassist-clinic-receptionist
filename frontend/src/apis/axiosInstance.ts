import axios from 'axios';

// Use environment variable with fallback to default port 3001
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Seed token into localStorage on first load
// In production: uses VITE_ADMIN_TOKEN (real JWT set in Vercel env vars)
// In local dev: uses development-token-glowassist (accepted by backend when NODE_ENV !== production)
if (typeof window !== 'undefined') {
  const currentToken = localStorage.getItem('jwt_token') || localStorage.getItem('token');
  if (!currentToken) {
    const prodToken = import.meta.env.VITE_ADMIN_TOKEN;
    const devToken  = 'development-token-glowassist';
    localStorage.setItem('jwt_token', prodToken || devToken);
  }
}

// Automatically inject JWT token into all outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    
    // Fallback hierarchy: stored token → production env token → dev token
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      token = import.meta.env.VITE_ADMIN_TOKEN || 'development-token-glowassist';
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

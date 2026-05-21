import axios from 'axios';

// Use environment variable with fallback to default port 3001
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into all outgoing requests
axiosClient.interceptors.request.use(
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
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API request error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Client API Methods
export const clientApi = {
  getClients: async (params?: { search?: string; type?: string; source?: string }) => {
    try {
      const response = await axiosClient.get('/clients', { params });
      return response.data;
    } catch (err) {
      console.warn('Failed fetching clients from API, falling back...', err);
      throw err;
    }
  },
  getClientById: async (id: string) => {
    const response = await axiosClient.get(`/clients/${id}`);
    return response.data;
  },
  createClient: async (clientData: any) => {
    const response = await axiosClient.post('/clients', clientData);
    return response.data;
  },
  updateClient: async (id: string, clientData: any) => {
    const response = await axiosClient.put(`/clients/${id}`, clientData);
    return response.data;
  },
};

// Appointment API Methods
export const appointmentApi = {
  getAppointments: async (params?: { startDate?: string; endDate?: string; status?: string; payment_status?: string }) => {
    try {
      const response = await axiosClient.get('/appointments', { params });
      return response.data;
    } catch (err) {
      console.warn('Failed fetching appointments from API, falling back...', err);
      throw err;
    }
  },
  createAppointment: async (appointmentData: {
    client_id?: string;
    phone_number: string;
    client_name: string;
    service_id: string;
    appointment_date: string;
    provider?: string;
    notes?: string;
    booked_by?: string;
  }) => {
    const response = await axiosClient.post('/appointments', appointmentData);
    return response.data;
  },
  rescheduleAppointment: async (id: string, newDateTime: string) => {
    const response = await axiosClient.put(`/appointments/${id}/reschedule`, { newDateTime });
    return response.data;
  },
  cancelAppointment: async (id: string, reason: string) => {
    const response = await axiosClient.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },
};

// Dashboard Stats API Method (Step 6 — aggregated metrics from backend)
export const dashboardApi = {
  getStats: async () => {
    try {
      const response = await axiosClient.get('/dashboard/stats');
      // Backend returns { status: 'success', data: { totalClients, ... } }
      return response.data?.data || null;
    } catch (err) {
      console.log('Dashboard stats API not reachable — using derived fallback.', err);
      return null;
    }
  },
};

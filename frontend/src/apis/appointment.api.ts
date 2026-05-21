import { axiosInstance } from './axiosInstance';
import type { ApiAppointment } from '../types';

export const appointmentApi = {
  getAppointments: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    status?: string; 
    payment_status?: string;
  }): Promise<ApiAppointment[]> => {
    try {
      const response = await axiosInstance.get('/appointments', { params });
      return response.data;
    } catch (err) {
      console.warn('Failed fetching appointments from API, falling back...', err);
      throw err;
    }
  },
  
  createAppointment: async (appointmentData: {
    client_id?: string;
    phone_number?: string;
    client_name?: string;
    service_id?: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    payment_method?: string;
    payment_status?: string;
    provider?: string;
    notes?: string;
    booked_by?: string;
    booking_source?: string;
  }): Promise<ApiAppointment> => {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
  },
  
  rescheduleAppointment: async (id: string, newDateTime: string): Promise<ApiAppointment> => {
    const response = await axiosInstance.put(`/appointments/${id}/reschedule`, { newDateTime });
    return response.data;
  },
  
  cancelAppointment: async (id: string, reason: string): Promise<ApiAppointment> => {
    const response = await axiosInstance.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },
};

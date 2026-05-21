import { axiosInstance } from './axiosInstance';
import type { ApiClient } from '../types';

export const clientApi = {
  getClients: async (params?: { search?: string; type?: string; source?: string }): Promise<ApiClient[]> => {
    try {
      const response = await axiosInstance.get('/clients', { params });
      return response.data;
    } catch (err) {
      console.warn('Failed fetching clients from API, falling back...', err);
      throw err;
    }
  },
  
  getClientById: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/clients/${id}`);
    return response.data;
  },
  
  createClient: async (clientData: Partial<ApiClient>): Promise<ApiClient> => {
    const response = await axiosInstance.post('/clients', clientData);
    return response.data;
  },
  
  updateClient: async (id: string, clientData: Partial<ApiClient>): Promise<ApiClient> => {
    const response = await axiosInstance.put(`/clients/${id}`, clientData);
    return response.data;
  },
};

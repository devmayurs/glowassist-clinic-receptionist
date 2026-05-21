import { axiosInstance } from './axiosInstance';
import type { CrmDashboardStats } from '../types';

export const dashboardApi = {
  getStats: async (): Promise<CrmDashboardStats | null> => {
    try {
      const response = await axiosInstance.get('/dashboard/stats');
      // Backend returns { status: 'success', data: { totalClients, ... } }
      return response.data?.data || null;
    } catch (err) {
      console.log('Dashboard stats API not reachable — using derived fallback.', err);
      return null;
    }
  },
};

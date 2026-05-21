import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { dashboardApi, clientApi, appointmentApi } from '../apis';
import type { CrmDashboardStats } from '../types';

// ── Mock fallback stats (used when API is not yet wired up or offline) ──────────
function buildFallbackStats(
  clients: any[],
  appointments: any[]
): CrmDashboardStats {
  const aiBookings = appointments.filter((a: any) => a.booked_by === 'whatsapp_ai').length;
  const liveChat = appointments.filter((a: any) => a.booked_by === 'live_chat').length;
  const manual = appointments.filter((a: any) => a.booked_by === 'manual_crm' || a.booked_by === 'walk_in').length;
  const totalRevenue = appointments
    .filter((a: any) => a.payment_status === 'paid' && a.service_price)
    .reduce((s: number, a: any) => s + Number(a.service_price || 0), 0);
  const pending = appointments.filter((a: any) => a.payment_status === 'pending').length;
  const sourceCounts: Record<string, number> = {};
  appointments.forEach((a: any) => {
    sourceCounts[a.booked_by] = (sourceCounts[a.booked_by] || 0) + 1;
  });
  const now = new Date().toISOString();
  const upcoming = appointments
    .filter((a: any) => a.status === 'scheduled' && a.appointment_date >= now)
    .slice(0, 5);
  return {
    totalClients: clients.length,
    totalAppointments: appointments.length,
    aiBookings,
    manualBookings: manual,
    liveChatBookings: liveChat,
    totalRevenue,
    pendingPayments: pending,
    bookingSourceBreakdown: Object.entries(sourceCounts).map(([source, count]) => ({ source, count })),
    upcomingAppointments: upcoming,
  };
}

// ── Demo fallback when nothing is loaded yet ───────────────────────────────────
function buildDemoStats(): CrmDashboardStats {
  return {
    totalClients: 48,
    totalAppointments: 214,
    aiBookings: 162,
    manualBookings: 31,
    liveChatBookings: 21,
    totalRevenue: 87450,
    pendingPayments: 7,
    bookingSourceBreakdown: [
      { source: 'whatsapp_ai', count: 162 },
      { source: 'manual_crm', count: 31 },
      { source: 'live_chat', count: 21 },
    ],
    upcomingAppointments: [
      {
        id: '1', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210',
        service_name: 'Gel Nail Extension', service_price: 1800,
        appointment_date: new Date(Date.now() + 3600000).toISOString(),
        provider: 'Priya', status: 'scheduled', payment_status: 'pending',
        booked_by: 'whatsapp_ai', created_at: new Date().toISOString(),
      },
      {
        id: '2', client_id: 'c2', client_name: 'Nisha Kapoor', phone_number: '+91 99887 76655',
        service_name: 'Manicure + Pedicure', service_price: 1200,
        appointment_date: new Date(Date.now() + 7200000).toISOString(),
        provider: 'Riya', status: 'scheduled', payment_status: 'paid',
        booked_by: 'live_chat', created_at: new Date().toISOString(),
      },
      {
        id: '3', client_id: 'c3', client_name: 'Meera Shah', phone_number: '+91 97001 23456',
        service_name: 'Botox Treatment', service_price: 5000,
        appointment_date: new Date(Date.now() + 10800000).toISOString(),
        provider: 'Dr. Anjali', status: 'scheduled', payment_status: 'paid',
        booked_by: 'whatsapp_ai', created_at: new Date().toISOString(),
      },
      {
        id: '4', client_id: 'c4', client_name: 'Rina Patil', phone_number: '+91 90909 80808',
        service_name: 'Lip Filler', service_price: 8000,
        appointment_date: new Date(Date.now() + 18000000).toISOString(),
        provider: 'Dr. Anjali', status: 'scheduled', payment_status: 'pending',
        booked_by: 'manual_crm', created_at: new Date().toISOString(),
      },
      {
        id: '5', client_id: 'c5', client_name: 'Kavya Mehta', phone_number: '+91 88000 12345',
        service_name: 'Pedicure Classic', service_price: 700,
        appointment_date: new Date(Date.now() + 86400000).toISOString(),
        provider: 'Priya', status: 'scheduled', payment_status: 'pending',
        booked_by: 'whatsapp_ai', created_at: new Date().toISOString(),
      },
    ],
  };
}

export function useDashboard() {
  const [stats, setStats] = useState<CrmDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const updateStats = useAppStore((s) => s.updateStats);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiStats = await dashboardApi.getStats();
      
      if (apiStats) {
        setStats(apiStats);
        updateStats({
          callsHandled: apiStats.totalAppointments + 5,
          bookings: apiStats.totalAppointments,
          newClients: apiStats.totalClients,
          estimatedRevenue: apiStats.totalRevenue,
        });
      } else {
        // Try fallback querying raw collections
        const [clientsRes, apptRes] = await Promise.allSettled([
          clientApi.getClients(),
          appointmentApi.getAppointments(),
        ]);
        const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value || []) : [];
        const appointments = apptRes.status === 'fulfilled' ? (apptRes.value || []) : [];
        
        if (clients.length || appointments.length) {
          const derived = buildFallbackStats(clients, appointments);
          setStats(derived);
          updateStats({
            callsHandled: derived.totalAppointments + 5,
            bookings: derived.totalAppointments,
            newClients: derived.totalClients,
            estimatedRevenue: derived.totalRevenue,
          });
        } else {
          const demo = buildDemoStats();
          setStats(demo);
          updateStats({
            callsHandled: demo.totalAppointments + 5,
            bookings: demo.totalAppointments,
            newClients: demo.totalClients,
            estimatedRevenue: demo.totalRevenue,
          });
        }
      }
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.warn('Dashboard stats fetch warning — offline fallback applied', err);
      setError('Backend unreachable. Running in offline fallback mode.');
      const demo = buildDemoStats();
      setStats(demo);
      updateStats({
        callsHandled: demo.totalAppointments + 5,
        bookings: demo.totalAppointments,
        newClients: demo.totalClients,
        estimatedRevenue: demo.totalRevenue,
      });
      setLastRefreshed(new Date());
    } finally {
      setLoading(false);
    }
  }, [updateStats]);

  useEffect(() => {
    fetchDashboardStats();
    
    // Periodically sync every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    lastRefreshed,
    refreshStats: fetchDashboardStats,
  };
}

export default useDashboard;

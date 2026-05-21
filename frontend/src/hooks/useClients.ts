import { useState, useEffect, useCallback, useMemo } from 'react';
import { clientApi } from '../apis';
import type { ApiClient } from '../types';

const DEMO_CLIENTS: ApiClient[] = [
  { id: 'c1', name: 'Sophia Laurent', phone_number: '+91 98765 43210', email: 'sophia@example.com', client_type: 'vip', booking_source: 'whatsapp_ai', notes: 'Prefers morning slots', total_bookings: 14, created_at: '2024-01-15T10:00:00Z' },
  { id: 'c2', name: 'Nisha Kapoor', phone_number: '+91 99887 76655', email: 'nisha@example.com', client_type: 'regular', booking_source: 'live_chat', notes: '', total_bookings: 6, created_at: '2024-03-02T09:00:00Z' },
  { id: 'c3', name: 'Meera Shah', phone_number: '+91 97001 23456', email: 'meera@example.com', client_type: 'vip', booking_source: 'whatsapp_ai', notes: 'Allergic to latex gloves', total_bookings: 22, created_at: '2023-11-20T11:00:00Z' },
  { id: 'c4', name: 'Rina Patil', phone_number: '+91 90909 80808', email: '', client_type: 'first_time', booking_source: 'manual_crm', notes: '', total_bookings: 1, created_at: '2025-04-10T14:00:00Z' },
  { id: 'c5', name: 'Kavya Mehta', phone_number: '+91 88000 12345', email: 'kavya@example.com', client_type: 'regular', booking_source: 'whatsapp_ai', notes: 'Birthday: March 12', total_bookings: 9, created_at: '2024-06-01T08:00:00Z' },
  { id: 'c6', name: 'Divya Sharma', phone_number: '+91 70123 45678', email: 'divya@example.com', client_type: 'regular', booking_source: 'live_chat', notes: '', total_bookings: 4, created_at: '2024-09-18T16:00:00Z' },
  { id: 'c7', name: 'Ananya Joshi', phone_number: '+91 91234 56789', email: 'ananya@example.com', client_type: 'first_time', booking_source: 'walk_in', notes: 'Referred by Meera Shah', total_bookings: 1, created_at: '2025-05-01T10:30:00Z' },
];

export function useClients() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<ApiClient | null>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientApi.getClients({
        search: search || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      });
      const data: ApiClient[] = res || [];
      setClients(data.length ? data : DEMO_CLIENTS);
    } catch {
      setClients(DEMO_CLIENTS);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, sourceFilter]);

  // Debounced execution
  useEffect(() => {
    const t = setTimeout(() => {
      loadClients();
    }, 300);
    return () => clearTimeout(t);
  }, [loadClients]);

  // Client-side local filtering fallback
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone_number.includes(q);
      const matchType = typeFilter === 'all' || c.client_type === typeFilter;
      const matchSource = sourceFilter === 'all' || c.booking_source === sourceFilter;
      return matchSearch && matchType && matchSource;
    });
  }, [clients, search, typeFilter, sourceFilter]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setSourceFilter('all');
  };

  return {
    clients: filteredClients,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    sourceFilter,
    setSourceFilter,
    selectedClient,
    setSelectedClient,
    clearFilters,
    refreshClients: loadClients,
  };
}

export default useClients;

import { useState, useEffect, useCallback, useMemo } from 'react';
import { appointmentApi } from '../apis/appointment.api';
import type { ApiAppointment } from '../types';

function makeDemoAppts(): ApiAppointment[] {
  const base = new Date();
  const d = (h: number, min = 0, dayOffset = 0) => {
    const t = new Date(base);
    t.setDate(t.getDate() + dayOffset);
    t.setHours(h, min, 0, 0);
    return t.toISOString();
  };
  return [
    { id: 'a1', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210', service_name: 'Gel Nail Extension', service_price: 1800, appointment_date: d(10, 0), provider: 'Priya', status: 'scheduled', payment_status: 'pending', booked_by: 'whatsapp_ai', created_at: d(8, 0) },
    { id: 'a2', client_id: 'c2', client_name: 'Nisha Kapoor', phone_number: '+91 99887 76655', service_name: 'Manicure + Pedicure', service_price: 1200, appointment_date: d(11, 30), provider: 'Riya', status: 'scheduled', payment_status: 'paid', booked_by: 'live_chat', created_at: d(9, 0) },
    { id: 'a3', client_id: 'c3', client_name: 'Meera Shah', phone_number: '+91 97001 23456', service_name: 'Botox Treatment', service_price: 5000, appointment_date: d(14, 0), provider: 'Dr. Anjali', status: 'scheduled', payment_status: 'paid', booked_by: 'whatsapp_ai', created_at: d(9, 30) },
    { id: 'a4', client_id: 'c4', client_name: 'Rina Patil', phone_number: '+91 90909 80808', service_name: 'Lip Filler', service_price: 8000, appointment_date: d(16, 0), provider: 'Dr. Anjali', status: 'scheduled', payment_status: 'pending', booked_by: 'manual_crm', created_at: d(10, 0) },
    { id: 'a5', client_id: 'c5', client_name: 'Kavya Mehta', phone_number: '+91 88000 12345', service_name: 'Pedicure Classic', service_price: 700, appointment_date: d(10, 0, 1), provider: 'Priya', status: 'scheduled', payment_status: 'pending', booked_by: 'whatsapp_ai', created_at: d(10, 0, -1) },
    { id: 'a6', client_id: 'c6', client_name: 'Divya Sharma', phone_number: '+91 70123 45678', service_name: 'Manicure Classic', service_price: 700, appointment_date: d(14, 30, 1), provider: 'Riya', status: 'completed', payment_status: 'paid', booked_by: 'live_chat', created_at: d(9, 0, -1) },
    { id: 'a7', client_id: 'c7', client_name: 'Ananya Joshi', phone_number: '+91 91234 56789', service_name: 'Gel Extension Refill', service_price: 1200, appointment_date: d(11, 0, -1), provider: 'Priya', status: 'cancelled', payment_status: 'refunded', booked_by: 'whatsapp_ai', cancel_reason: 'Client requested rescheduling', created_at: d(10, 0, -2) },
    { id: 'a8', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210', service_name: 'Manicure Classic', service_price: 700, appointment_date: d(9, 0, 2), provider: 'Riya', status: 'scheduled', payment_status: 'pending', booked_by: 'whatsapp_ai', created_at: d(8, 0, 0) },
  ];
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payFilter, setPayFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Modals & Panels targets
  const [selectedAppt, setSelectedAppt] = useState<ApiAppointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<ApiAppointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ApiAppointment | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getAppointments({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        payment_status: payFilter !== 'all' ? payFilter : undefined,
      });
      // The modular api returns any format, let's process carefully
      const data: ApiAppointment[] = (res as any)?.data || res || [];
      setAppointments(data.length ? data : makeDemoAppts());
    } catch {
      setAppointments(makeDemoAppts());
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, statusFilter, payFilter]);

  useEffect(() => {
    const t = setTimeout(() => loadAppointments(), 300);
    return () => clearTimeout(t);
  }, [loadAppointments]);

  useEffect(() => {
    const handleReload = () => {
      loadAppointments();
    };
    window.addEventListener('appointment-created', handleReload);
    return () => window.removeEventListener('appointment-created', handleReload);
  }, [loadAppointments]);

  // Client-side filter on demo data (fallback/local filtering)
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchPay = payFilter === 'all' || a.payment_status === payFilter;
        const matchStart = !startDate || a.appointment_date >= startDate;
        const matchEnd = !endDate || a.appointment_date <= endDate + 'T23:59:59Z';
        return matchStatus && matchPay && matchStart && matchEnd;
      })
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));
  }, [appointments, startDate, endDate, statusFilter, payFilter]);

  const clearFilters = () => {
    setStatusFilter('all');
    setPayFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const handleRescheduleSuccess = () => {
    setRescheduleTarget(null);
    setSelectedAppt(null);
    showSuccess('Appointment successfully rescheduled! ↻');
    loadAppointments();
  };

  const handleCancelSuccess = () => {
    setCancelTarget(null);
    setSelectedAppt(null);
    showSuccess('Appointment cancelled and logged. ✕');
    loadAppointments();
  };

  return {
    appointments: filteredAppointments,
    loading,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    payFilter,
    setPayFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedAppt,
    setSelectedAppt,
    rescheduleTarget,
    setRescheduleTarget,
    cancelTarget,
    setCancelTarget,
    successMsg,
    showSuccess,
    clearFilters,
    loadAppointments,
    handleRescheduleSuccess,
    handleCancelSuccess,
  };
}

export default useAppointments;

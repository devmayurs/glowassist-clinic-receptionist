const { supabase } = require('../config/supabase');

/**
 * GET /api/dashboard/stats
 * Aggregates real-time KPI metrics from Supabase.
 * Returns: totalClients, totalAppointments, aiBookings, manualBookings,
 *          liveChatBookings, totalRevenue, pendingPayments,
 *          bookingSourceBreakdown[], upcomingAppointments[]
 *
 * DB column reference (from schema.sql):
 *   appointments.booking_source  — 'whatsapp_ai' | 'manual_crm' | 'live_chat' | 'walk_in'
 *   appointments.payment_status  — 'pending' | 'partial' | 'paid' | 'refunded'
 *   appointments.service_price   — numeric (may be null)
 *   appointments.status          — 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
 */
const getDashboardStats = async (req, res) => {
  try {
    // ── 1. Total Clients ───────────────────────────────────────────────────────
    const { count: totalClients, error: clientErr } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (clientErr) throw clientErr;

    // ── 2. Total Appointments ──────────────────────────────────────────────────
    const { count: totalAppointments, error: apptCountErr } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    if (apptCountErr) throw apptCountErr;

    // ── 3. Booking source breakdown ────────────────────────────────────────────
    const { data: sourceRows, error: sourceErr } = await supabase
      .from('appointments')
      .select('booking_source');

    if (sourceErr) throw sourceErr;

    const sourceCounts = {};
    (sourceRows || []).forEach(({ booking_source }) => {
      if (booking_source) {
        sourceCounts[booking_source] = (sourceCounts[booking_source] || 0) + 1;
      }
    });

    const bookingSourceBreakdown = Object.entries(sourceCounts).map(
      ([source, count]) => ({ source, count })
    );

    const aiBookings       = sourceCounts['whatsapp_ai']  || 0;
    const liveChatBookings = sourceCounts['live_chat']    || 0;
    const manualBookings   = (sourceCounts['manual_crm'] || 0) + (sourceCounts['walk_in'] || 0);

    // ── 4. Total Revenue (paid appointments) ───────────────────────────────────
    const { data: paidRows, error: revenueErr } = await supabase
      .from('appointments')
      .select('service_price')
      .eq('payment_status', 'paid');

    if (revenueErr) throw revenueErr;

    const totalRevenue = (paidRows || []).reduce((sum, row) => {
      return sum + (parseFloat(row.service_price) || 0);
    }, 0);

    // ── 5. Pending Payments count ──────────────────────────────────────────────
    const { count: pendingPayments, error: pendingErr } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending');

    if (pendingErr) throw pendingErr;

    // ── 6. Upcoming Appointments (next 5 scheduled slots after now) ────────────
    const { data: upcomingAppointments, error: upcomingErr } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        service_name,
        service_price,
        appointment_date,
        appointment_time,
        status,
        payment_status,
        booking_source,
        google_calendar_event_id,
        notes,
        created_at,
        clients (
          full_name,
          phone_number
        )
      `)
      .eq('status', 'scheduled')
      .gte('appointment_date', new Date().toISOString().slice(0, 10))
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(5);

    if (upcomingErr) throw upcomingErr;

    // Normalise upcoming appointments to the ApiAppointment shape the frontend expects
    const normalizedUpcoming = (upcomingAppointments || []).map(a => ({
      id:                a.id,
      client_id:         a.client_id,
      client_name:       a.clients?.full_name || 'Unknown',
      phone_number:      a.clients?.phone_number || '',
      service_name:      a.service_name,
      service_price:     a.service_price,
      appointment_date:  `${a.appointment_date}T${a.appointment_time || '00:00:00'}`,
      status:            a.status,
      payment_status:    a.payment_status,
      booked_by:         a.booking_source,
      google_event_id:   a.google_calendar_event_id,
      notes:             a.notes,
      created_at:        a.created_at,
    }));

    // ── Response ───────────────────────────────────────────────────────────────
    return res.status(200).json({
      status: 'success',
      data: {
        totalClients:          totalClients      || 0,
        totalAppointments:     totalAppointments || 0,
        aiBookings,
        manualBookings,
        liveChatBookings,
        totalRevenue:          Math.round(totalRevenue * 100) / 100,
        pendingPayments:       pendingPayments   || 0,
        bookingSourceBreakdown,
        upcomingAppointments:  normalizedUpcoming,
      }
    });

  } catch (error) {
    console.error('[Dashboard Stats Error]', error.message || error);
    return res.status(500).json({
      status:  'error',
      message: 'Failed to fetch dashboard statistics',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

module.exports = { getDashboardStats };

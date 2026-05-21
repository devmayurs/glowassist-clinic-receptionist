import { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { appointmentApi, clientApi, dashboardApi } from '../api/axiosClient';
import type { CrmDashboardStats, ApiAppointment } from '../types';

// ── Colour palette matching the design system ─────────────────────────────────
const PIE_COLORS = ['#C9847A', '#B8965A', '#7A9E7E', '#7B4F6E'];
const SOURCE_LABELS: Record<string, string> = {
  whatsapp_ai: 'WhatsApp AI',
  live_chat: 'Live Chat',
  manual_crm: 'Manual CRM',
  walk_in: 'Walk-in',
};

// ── KPI Card component ─────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'rose' | 'gold' | 'sage' | 'plum';
  loading?: boolean;
}

function KpiCard({ icon, label, value, sub, accent = 'rose', loading }: KpiCardProps) {
  const accentColors: Record<string, string> = {
    rose: 'text-rose border-rose/20 bg-rose-pale/40',
    gold: 'text-gold border-gold/20 bg-gold-pale/60',
    sage: 'text-sage border-sage/20 bg-sage-pale/60',
    plum: 'text-plum border-plum/20 bg-plum-pale/60',
  };
  const valueColors: Record<string, string> = {
    rose: 'text-rose',
    gold: 'text-gold',
    sage: 'text-sage',
    plum: 'text-plum',
  };

  return (
    <div
      className={`bg-white border rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200 ${accentColors[accent]}`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className="text-[0.6rem] font-semibold tracking-[1.5px] uppercase text-text-muted">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="h-9 w-24 rounded-lg bg-warm animate-pulse" />
      ) : (
        <div className={`font-serif text-[2.2rem] font-semibold leading-none ${valueColors[accent]}`}>
          {value}
        </div>
      )}
      {sub && (
        <div className="text-[0.68rem] text-text-muted leading-snug">{sub}</div>
      )}
    </div>
  );
}

// ── Status badge for upcoming appointments ─────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scheduled: 'bg-sage-pale text-sage',
    completed: 'bg-gold-pale text-gold',
    cancelled: 'bg-rose-pale text-rose',
    rescheduled: 'bg-plum-pale text-plum',
    no_show: 'bg-warm text-text-muted',
  };
  const label: Record<string, string> = {
    scheduled: '◷ Scheduled',
    completed: '✓ Completed',
    cancelled: '✕ Cancelled',
    rescheduled: '↻ Rescheduled',
    no_show: '— No Show',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.62rem] font-semibold ${map[status] || 'bg-warm text-text-muted'}`}>
      {label[status] || status}
    </span>
  );
}

// ── Booking source label for upcoming table ────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  if (source === 'whatsapp_ai') {
    return (
      <span className="inline-flex items-center gap-1 bg-rose-pale text-rose text-[0.6rem] font-bold px-2 py-0.5 rounded-md tracking-[0.4px]">
        ✦ AI
      </span>
    );
  }
  if (source === 'live_chat') {
    return (
      <span className="inline-flex items-center gap-1 bg-sage-pale text-sage text-[0.6rem] font-bold px-2 py-0.5 rounded-md tracking-[0.4px]">
        💬 Chat
      </span>
    );
  }
  return (
    <span className="text-[0.68rem] text-text-muted">👤 Manual</span>
  );
}

// ── Mock fallback stats (used when API is not yet wired up in Step 6) ──────────
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

// ── Custom Pie Tooltip ─────────────────────────────────────────────────────────
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-[0.78rem]">
        <span className="font-semibold text-deep">{SOURCE_LABELS[payload[0].name] || payload[0].name}</span>
        <span className="text-text-muted ml-2">{payload[0].value} bookings</span>
      </div>
    );
  }
  return null;
};

// ── Weekly revenue demo chart data ─────────────────────────────────────────────
const weeklyRevenue = [
  { name: 'Mon', value: 12400 },
  { name: 'Tue', value: 19800 },
  { name: 'Wed', value: 15300 },
  { name: 'Thu', value: 22100 },
  { name: 'Fri', value: 18700 },
  { name: 'Sat', value: 25600 },
];

// ── Main Dashboard Page ────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [stats, setStats] = useState<CrmDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      // Try live dashboard stats endpoint first (Step 6 target)
      const liveStats = await dashboardApi.getStats();
      if (liveStats) {
        setStats(liveStats);
        setLastRefreshed(new Date());
        return;
      }
      // Fallback: derive from individual APIs
      const [clientsRes, apptRes] = await Promise.allSettled([
        clientApi.getClients(),
        appointmentApi.getAppointments(),
      ]);
      const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value?.data || clientsRes.value || []) : [];
      const appointments = apptRes.status === 'fulfilled' ? (apptRes.value?.data || apptRes.value || []) : [];
      if (clients.length || appointments.length) {
        setStats(buildFallbackStats(clients, appointments));
      } else {
        setStats(buildDemoStats());
      }
    } catch {
      setStats(buildDemoStats());
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }, []);

  useEffect(() => {
    loadStats();
    // Auto-refresh every 60 seconds
    const iv = setInterval(loadStats, 60000);
    return () => clearInterval(iv);
  }, [loadStats]);

  const fmt = (n: number) => n.toLocaleString('en-IN');
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return `Today, ${fmtTime(iso)}`;
    if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${fmtTime(iso)}`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + `, ${fmtTime(iso)}`;
  };

  const pieData = (stats?.bookingSourceBreakdown || []).map((b: { source: string; count: number }) => ({
    name: b.source,
    value: b.count,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-ivory">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-deep leading-none">
            Dashboard
          </h1>
          <p className="text-[0.72rem] text-text-muted mt-1">
            Last refreshed {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 text-[0.78rem] font-medium text-text-muted hover:bg-warm transition-colors disabled:opacity-50"
        >
          <span className={loading ? 'animate-spin' : ''}>↻</span>
          Refresh
        </button>
      </div>

      {/* ── 7 KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon="👥"
          label="Total Clients"
          value={stats ? fmt(stats.totalClients) : '—'}
          sub="Registered in CRM"
          accent="rose"
          loading={loading}
        />
        <KpiCard
          icon="📅"
          label="Total Appointments"
          value={stats ? fmt(stats.totalAppointments) : '—'}
          sub="All time records"
          accent="gold"
          loading={loading}
        />
        <KpiCard
          icon="✦"
          label="AI Bookings"
          value={stats ? fmt(stats.aiBookings) : '—'}
          sub="Via WhatsApp AI agent"
          accent="rose"
          loading={loading}
        />
        <KpiCard
          icon="👤"
          label="Manual Bookings"
          value={stats ? fmt(stats.manualBookings) : '—'}
          sub="Created by receptionist"
          accent="plum"
          loading={loading}
        />
        <KpiCard
          icon="💬"
          label="Live Chat Bookings"
          value={stats ? fmt(stats.liveChatBookings) : '—'}
          sub="Via human chat agents"
          accent="sage"
          loading={loading}
        />
        <KpiCard
          icon="💰"
          label="Total Revenue"
          value={stats ? `₹${fmt(stats.totalRevenue)}` : '—'}
          sub="From paid appointments"
          accent="gold"
          loading={loading}
        />
        <KpiCard
          icon="⏳"
          label="Pending Payments"
          value={stats ? fmt(stats.pendingPayments) : '—'}
          sub="Awaiting collection"
          accent="plum"
          loading={loading}
        />
        {/* Empty slot or summary card */}
        <div className="bg-gradient-to-br from-deep to-brown rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="font-serif text-gold-light text-[0.9rem] mb-2">✦ AI Performance</div>
          {loading ? (
            <div className="h-6 w-20 bg-white/10 rounded animate-pulse mb-1" />
          ) : (
            <div className="font-serif text-[2rem] font-semibold text-white leading-none">
              {stats ? Math.round((stats.aiBookings / Math.max(stats.totalAppointments, 1)) * 100) : 0}%
            </div>
          )}
          <div className="text-[0.65rem] text-white/50 tracking-[0.5px]">Bookings automated by AI</div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Pie Chart — Booking Source Ratio */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-[0.65rem] font-semibold tracking-[1.2px] uppercase text-text-muted mb-4">
            Booking Source Ratio
          </h3>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-rose/20 border-t-rose animate-spin" />
            </div>
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_entry: { name: string; value: number }, index: number) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value) => SOURCE_LABELS[value] || value}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '0.72rem', color: '#8A7268' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-text-muted text-[0.8rem]">
              No booking data yet
            </div>
          )}
        </div>

        {/* Bar Chart — Weekly Revenue */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-[0.65rem] font-semibold tracking-[1.2px] uppercase text-text-muted mb-4">
            Weekly Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyRevenue} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8A7268' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#8A7268' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ fontSize: '0.78rem', borderRadius: '10px', border: '1px solid #E8DDD6' }}
              />
              <Bar dataKey="value" fill="#C9847A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Upcoming Appointments ── */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm mb-2">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-[0.65rem] font-semibold tracking-[1.2px] uppercase text-text-muted">
            Upcoming Appointments
          </h3>
          <span className="text-[0.68rem] text-text-muted">Next 5 slots</span>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-warm animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Date & Time', 'Client', 'Service', 'Provider', 'Status', 'Payment', 'Source'].map(h => (
                  <th key={h} className="bg-warm text-[0.62rem] font-semibold tracking-[1.2px] uppercase text-text-muted px-4 py-3 text-left border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.upcomingAppointments || []).map((a: ApiAppointment, i: number) => (
                <tr key={a.id || i} className="hover:bg-rose-pale/20 transition-colors">
                  <td className="px-4 py-3 border-b border-border text-[0.8rem] font-medium text-deep">
                    {fmtDate(a.appointment_date)}
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold flex-shrink-0 bg-rose-pale text-rose"
                      >
                        {a.client_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[0.8rem] font-semibold text-deep leading-none">{a.client_name}</div>
                        <div className="text-[0.65rem] text-text-muted">{a.phone_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-border text-[0.8rem] text-text-muted">{a.service_name}</td>
                  <td className="px-4 py-3 border-b border-border text-[0.78rem] text-text-muted">{a.provider || '—'}</td>
                  <td className="px-4 py-3 border-b border-border">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <span className={`text-[0.68rem] font-semibold ${a.payment_status === 'paid' ? 'text-sage' : 'text-gold'}`}>
                      {a.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <SourceBadge source={a.booked_by} />
                  </td>
                </tr>
              ))}
              {!(stats?.upcomingAppointments?.length) && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted text-[0.8rem]">
                    No upcoming appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

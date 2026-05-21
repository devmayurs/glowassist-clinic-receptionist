import { useState, useEffect, useCallback, useRef } from 'react';
import { appointmentApi } from '../api/axiosClient';
import type { ApiAppointment, BookingSource } from '../types';


// ── Demo data fallback ─────────────────────────────────────────────────────────
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

// ── Badge helpers ──────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-gold-pale text-gold',
  completed: 'bg-sage-pale text-sage',
  cancelled: 'bg-rose-pale text-rose',
  rescheduled: 'bg-plum-pale text-plum',
  no_show: 'bg-warm text-text-muted',
};
const STATUS_LABEL: Record<string, string> = {
  scheduled: '◷ Scheduled',
  completed: '✓ Completed',
  cancelled: '✕ Cancelled',
  rescheduled: '↻ Rescheduled',
  no_show: '— No Show',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.62rem] font-semibold ${STATUS_STYLE[status] || 'bg-warm text-text-muted'}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}
function PayBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-sage-pale text-sage',
    pending: 'bg-gold-pale text-gold',
    partial: 'bg-plum-pale text-plum',
    refunded: 'bg-rose-pale text-rose',
  };
  const lbl: Record<string, string> = { paid: '✓ Paid', pending: '⏳ Pending', partial: '½ Partial', refunded: '↩ Refunded' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.62rem] font-semibold ${map[status] || 'bg-warm text-text-muted'}`}>{lbl[status] || status}</span>;
}
function SourceBadge({ source }: { source: string }) {
  if (source === 'whatsapp_ai') return <span className="inline-flex items-center gap-1 bg-rose-pale text-rose text-[0.6rem] font-bold px-2 py-0.5 rounded-md">✦ AI</span>;
  if (source === 'live_chat') return <span className="inline-flex items-center gap-1 bg-sage-pale text-sage text-[0.6rem] font-bold px-2 py-0.5 rounded-md">💬 Chat</span>;
  return <span className="text-[0.68rem] text-text-muted">👤 Manual</span>;
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#F9EDEB', tc: '#C9847A' },
  { bg: '#F3EBF1', tc: '#7B4F6E' },
  { bg: '#FBF5E8', tc: '#B8965A' },
  { bg: '#EDF3EE', tc: '#7A9E7E' },
];
function Avatar({ name, idx }: { name: string; idx: number }) {
  const { bg, tc } = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold flex-shrink-0" style={{ background: bg, color: tc }}>
      {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Reschedule Modal ───────────────────────────────────────────────────────────
function RescheduleModal({ appt, onClose, onSuccess }: { appt: ApiAppointment; onClose: () => void; onSuccess: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [dateStr, setDateStr] = useState(() => appt.appointment_date.slice(0, 10));
  const [timeStr, setTimeStr] = useState(() => appt.appointment_date.slice(11, 16));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!dateStr || !timeStr) { setError('Please select a valid date and time.'); return; }
    setSaving(true);
    setError('');
    try {
      const newDateTime = `${dateStr}T${timeStr}:00.000Z`;
      await appointmentApi.rescheduleAppointment(appt.id, newDateTime);
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to reschedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="animate-slideUp bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-gold-pale/40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-[1.1rem] font-semibold text-deep">Reschedule Appointment</h2>
              <p className="text-[0.72rem] text-text-muted mt-0.5">{appt.client_name} · {appt.service_name}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-warm transition-colors">✕</button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[0.65rem] font-semibold tracking-[1.2px] uppercase text-text-muted mb-1.5">New Date</label>
            <input
              type="date"
              value={dateStr}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setDateStr(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-[0.85rem] text-deep focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-[0.65rem] font-semibold tracking-[1.2px] uppercase text-text-muted mb-1.5">New Time</label>
            <input
              type="time"
              value={timeStr}
              onChange={e => setTimeStr(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-[0.85rem] text-deep focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
            />
          </div>
          {error && (
            <div className="bg-rose-pale/60 border border-rose/20 rounded-lg px-3 py-2 text-[0.75rem] text-rose">{error}</div>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-border rounded-xl py-2.5 text-[0.82rem] font-medium text-text-muted hover:bg-warm transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gold text-white rounded-xl py-2.5 text-[0.82rem] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cancel Modal ───────────────────────────────────────────────────────────────
function CancelModal({ appt, onClose, onSuccess }: { appt: ApiAppointment; onClose: () => void; onSuccess: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    if (!reason.trim()) { setError('Please provide a cancellation reason.'); return; }
    setSaving(true);
    setError('');
    try {
      await appointmentApi.cancelAppointment(appt.id, reason.trim());
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to cancel. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="animate-slideUp bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-rose-pale/40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-[1.1rem] font-semibold text-deep">Cancel Appointment</h2>
              <p className="text-[0.72rem] text-text-muted mt-0.5">{appt.client_name} · {appt.service_name}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-warm transition-colors">✕</button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-rose-pale/50 border border-rose/20 rounded-xl p-3">
            <p className="text-[0.75rem] text-rose font-medium">
              ⚠️ This will cancel the appointment and notify the system. This action is logged.
            </p>
          </div>
          <div>
            <label className="block text-[0.65rem] font-semibold tracking-[1.2px] uppercase text-text-muted mb-1.5">
              Cancellation Reason <span className="text-rose">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Client requested to cancel, rescheduling…"
              rows={3}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-[0.82rem] text-deep placeholder-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose/50 transition-all"
            />
          </div>
          {error && (
            <div className="bg-rose-pale/60 border border-rose/20 rounded-lg px-3 py-2 text-[0.75rem] text-rose">{error}</div>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-border rounded-xl py-2.5 text-[0.82rem] font-medium text-text-muted hover:bg-warm transition-colors">
            Keep Appointment
          </button>
          <button
            onClick={handleCancel}
            disabled={saving || !reason.trim()}
            className="flex-1 bg-rose text-white rounded-xl py-2.5 text-[0.82rem] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Cancelling…' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar View ──────────────────────────────────────────────────────────────
function CalendarView({ appointments, onSelect }: { appointments: ApiAppointment[]; onSelect: (a: ApiAppointment) => void }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));

  // Group appointments by date string yyyy-mm-dd
  const byDate: Record<string, ApiAppointment[]> = {};
  appointments.forEach(a => {
    const key = a.appointment_date.slice(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(a);
  });

  const pad = (n: number) => String(n).padStart(2, '0');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={prev} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-warm transition-colors text-lg">‹</button>
        <h3 className="font-serif text-[1.05rem] font-semibold text-deep">{monthName}</h3>
        <button onClick={next} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-warm transition-colors text-lg">›</button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-border">
        {days.map(d => (
          <div key={d} className="text-center text-[0.62rem] font-semibold tracking-[1.2px] uppercase text-text-muted py-2.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7" style={{ minHeight: '320px' }}>
        {/* Empty cells before first day */}
        {[...Array(firstDay)].map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-border min-h-[80px] bg-warm/30" />
        ))}

        {/* Day cells */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const key = `${year}-${pad(month + 1)}-${pad(day)}`;
          const dayAppts = byDate[key] || [];
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const col = (firstDay + i) % 7;

          return (
            <div
              key={day}
              className={`border-b border-border min-h-[80px] p-1.5 ${col !== 6 ? 'border-r' : ''} ${isToday ? 'bg-rose-pale/30' : 'hover:bg-warm/40'} transition-colors`}
            >
              <div className={`text-[0.75rem] font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-rose text-white' : 'text-text-muted'}`}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayAppts.slice(0, 3).map((a, ai) => (
                  <button
                    key={a.id || ai}
                    onClick={() => onSelect(a)}
                    className={`w-full text-left px-1.5 py-0.5 rounded text-[0.58rem] font-medium truncate transition-colors hover:opacity-80 ${
                      a.status === 'cancelled' ? 'bg-rose-pale text-rose' :
                      a.status === 'completed' ? 'bg-sage-pale text-sage' :
                      'bg-gold-pale text-gold'
                    }`}
                    title={`${a.client_name} — ${a.service_name}`}
                  >
                    {new Date(a.appointment_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} {a.client_name.split(' ')[0]}
                  </button>
                ))}
                {dayAppts.length > 3 && (
                  <div className="text-[0.55rem] text-text-muted px-1">+{dayAppts.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Appointment Detail Slide Panel ─────────────────────────────────────────────
function AppointmentPanel({
  appt,
  onClose,
  onReschedule,
  onCancel,
}: {
  appt: ApiAppointment;
  onClose: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end"
      onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="animate-slideUp bg-white h-full w-[380px] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-gold-pale/50 to-white">
          <div className="flex items-start justify-between mb-3">
            <StatusBadge status={appt.status} />
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:bg-warm transition-colors text-sm">✕</button>
          </div>
          <h2 className="font-serif text-[1.15rem] font-semibold text-deep">{appt.service_name}</h2>
          <p className="text-[0.72rem] text-text-muted mt-0.5">{appt.client_name} · {appt.phone_number}</p>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Date</div>
              <div className="text-[0.82rem] font-medium text-deep">{fmtDate(appt.appointment_date)}</div>
            </div>
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Time</div>
              <div className="text-[0.82rem] font-medium text-deep">{fmtTime(appt.appointment_date)}</div>
            </div>
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Provider</div>
              <div className="text-[0.82rem] text-deep">{appt.provider || '—'}</div>
            </div>
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Price</div>
              <div className="font-serif text-[0.95rem] font-semibold text-gold">
                {appt.service_price ? `₹${Number(appt.service_price).toLocaleString('en-IN')}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Payment</div>
              <PayBadge status={appt.payment_status} />
            </div>
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Source</div>
              <SourceBadge source={appt.booked_by} />
            </div>
          </div>
          {appt.notes && (
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Notes</div>
              <p className="text-[0.8rem] text-deep bg-warm rounded-lg px-3 py-2">{appt.notes}</p>
            </div>
          )}
          {appt.cancel_reason && (
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Cancellation Reason</div>
              <p className="text-[0.8rem] text-rose bg-rose-pale/50 rounded-lg px-3 py-2 italic">{appt.cancel_reason}</p>
            </div>
          )}
          {appt.google_event_id && (
            <div>
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Google Calendar</div>
              <div className="text-[0.7rem] text-sage font-medium">✓ Synced to Google Calendar</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(appt.status === 'scheduled' || appt.status === 'rescheduled') && (
          <div className="px-6 py-5 border-t border-border space-y-2.5">
            <button
              onClick={onReschedule}
              className="w-full border border-gold/40 text-gold bg-gold-pale/50 rounded-xl py-2.5 text-[0.82rem] font-semibold hover:bg-gold-pale transition-colors"
            >
              ↻ Reschedule Appointment
            </button>
            <button
              onClick={onCancel}
              className="w-full border border-rose/30 text-rose bg-rose-pale/30 rounded-xl py-2.5 text-[0.82rem] font-semibold hover:bg-rose-pale transition-colors"
            >
              ✕ Cancel Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Appointments Page ─────────────────────────────────────────────────────
type ViewMode = 'calendar' | 'table';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payFilter, setPayFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<ApiAppointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<ApiAppointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ApiAppointment | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

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
      const data: ApiAppointment[] = res?.data || res || [];
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

  // Client-side filter on demo data
  const filtered = appointments.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchPay = payFilter === 'all' || a.payment_status === payFilter;
    const matchStart = !startDate || a.appointment_date >= startDate;
    const matchEnd = !endDate || a.appointment_date <= endDate + 'T23:59:59Z';
    return matchStatus && matchPay && matchStart && matchEnd;
  }).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  const fmtDateTime = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const tmrw = new Date(today); tmrw.setDate(today.getDate() + 1);
    const prefix = d.toDateString() === today.toDateString() ? 'Today' :
      d.toDateString() === tmrw.toDateString() ? 'Tomorrow' :
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `${prefix}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
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

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-ivory">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-deep leading-none">Appointments</h1>
          <p className="text-[0.72rem] text-text-muted mt-1">{filtered.length} records</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-[0.78rem] font-medium transition-colors ${viewMode === 'table' ? 'bg-deep text-white' : 'text-text-muted hover:bg-warm'}`}
            >
              ☰ Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-[0.78rem] font-medium transition-colors ${viewMode === 'calendar' ? 'bg-deep text-white' : 'text-text-muted hover:bg-warm'}`}
            >
              📅 Calendar
            </button>
          </div>
        </div>
      </div>

      {/* ── Success toast ── */}
      {successMsg && (
        <div className="mb-4 bg-sage-pale border border-sage/20 rounded-xl px-4 py-3 text-[0.8rem] text-sage font-medium animate-slideUp">
          {successMsg}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-border rounded-xl bg-white px-3 py-2.5 text-[0.82rem] text-deep focus:outline-none focus:ring-2 focus:ring-rose/30 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">◷ Scheduled</option>
          <option value="completed">✓ Completed</option>
          <option value="cancelled">✕ Cancelled</option>
          <option value="rescheduled">↻ Rescheduled</option>
          <option value="no_show">— No Show</option>
        </select>

        <select
          value={payFilter}
          onChange={e => setPayFilter(e.target.value)}
          className="border border-border rounded-xl bg-white px-3 py-2.5 text-[0.82rem] text-deep focus:outline-none focus:ring-2 focus:ring-rose/30 cursor-pointer"
        >
          <option value="all">All Payments</option>
          <option value="pending">⏳ Pending</option>
          <option value="paid">✓ Paid</option>
          <option value="partial">½ Partial</option>
          <option value="refunded">↩ Refunded</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border border-border rounded-xl bg-white px-3 py-2.5 text-[0.82rem] text-deep focus:outline-none focus:ring-2 focus:ring-rose/30 cursor-pointer"
          placeholder="From date"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border border-border rounded-xl bg-white px-3 py-2.5 text-[0.82rem] text-deep focus:outline-none focus:ring-2 focus:ring-rose/30 cursor-pointer"
          placeholder="To date"
        />

        {(statusFilter !== 'all' || payFilter !== 'all' || startDate || endDate) && (
          <button
            onClick={() => { setStatusFilter('all'); setPayFilter('all'); setStartDate(''); setEndDate(''); }}
            className="border border-rose/30 text-rose rounded-xl px-3 py-2.5 text-[0.78rem] font-medium hover:bg-rose-pale transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Calendar View ── */}
      {viewMode === 'calendar' && (
        <CalendarView appointments={filtered} onSelect={setSelectedAppt} />
      )}

      {/* ── Table View ── */}
      {viewMode === 'table' && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Date & Time', 'Client', 'Service', 'Provider', 'Status', 'Payment', 'Source', 'Price', ''].map(h => (
                  <th key={h} className="bg-warm text-[0.6rem] font-semibold tracking-[1.2px] uppercase text-text-muted px-4 py-3 text-left border-b border-border whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-3 border-b border-border">
                      <div className="h-8 rounded-lg bg-warm animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-muted text-[0.82rem]">
                    <div className="text-3xl mb-2">📅</div>
                    No appointments found for these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((a, idx) => (
                  <tr
                    key={a.id}
                    className="hover:bg-rose-pale/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedAppt(a)}
                  >
                    <td className="px-4 py-3.5 border-b border-border text-[0.8rem] font-medium text-deep whitespace-nowrap">
                      {fmtDateTime(a.appointment_date)}
                    </td>
                    <td className="px-4 py-3.5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Avatar name={a.client_name} idx={idx} />
                        <div>
                          <div className="text-[0.8rem] font-semibold text-deep leading-none">{a.client_name}</div>
                          <div className="text-[0.65rem] text-text-muted">{a.phone_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-border text-[0.78rem] text-text-muted max-w-[160px] truncate">
                      {a.service_name}
                    </td>
                    <td className="px-4 py-3.5 border-b border-border text-[0.78rem] text-text-muted whitespace-nowrap">
                      {a.provider || '—'}
                    </td>
                    <td className="px-4 py-3.5 border-b border-border">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3.5 border-b border-border">
                      <PayBadge status={a.payment_status} />
                    </td>
                    <td className="px-4 py-3.5 border-b border-border">
                      <SourceBadge source={a.booked_by as BookingSource} />
                    </td>
                    <td className="px-4 py-3.5 border-b border-border font-semibold text-gold text-[0.82rem] whitespace-nowrap">
                      {a.service_price ? `₹${Number(a.service_price).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 border-b border-border">
                      {(a.status === 'scheduled' || a.status === 'rescheduled') && (
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); setRescheduleTarget(a); }}
                            className="border border-gold/40 text-gold bg-gold-pale text-[0.65rem] font-bold px-2 py-1 rounded-lg hover:bg-gold/10 transition-colors whitespace-nowrap"
                          >
                            ↻ Move
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setCancelTarget(a); }}
                            className="border border-rose/30 text-rose bg-rose-pale text-[0.65rem] font-bold px-2 py-1 rounded-lg hover:bg-rose/10 transition-colors whitespace-nowrap"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals ── */}
      {selectedAppt && !rescheduleTarget && !cancelTarget && (
        <AppointmentPanel
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onReschedule={() => { setRescheduleTarget(selectedAppt); }}
          onCancel={() => { setCancelTarget(selectedAppt); }}
        />
      )}
      {rescheduleTarget && (
        <RescheduleModal
          appt={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={handleRescheduleSuccess}
        />
      )}
      {cancelTarget && (
        <CancelModal
          appt={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}

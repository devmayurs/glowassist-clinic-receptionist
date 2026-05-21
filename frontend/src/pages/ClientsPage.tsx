import { useState, useEffect, useCallback, useRef } from 'react';
import { clientApi } from '../api/axiosClient';
import type { ApiClient, ApiAppointment, ClientType, BookingSource } from '../types';


// ── Demo data for when backend is unreachable ──────────────────────────────────
const DEMO_CLIENTS: ApiClient[] = [
  { id: 'c1', name: 'Sophia Laurent', phone_number: '+91 98765 43210', email: 'sophia@example.com', client_type: 'vip', booking_source: 'whatsapp_ai', notes: 'Prefers morning slots', total_bookings: 14, created_at: '2024-01-15T10:00:00Z' },
  { id: 'c2', name: 'Nisha Kapoor', phone_number: '+91 99887 76655', email: 'nisha@example.com', client_type: 'regular', booking_source: 'live_chat', notes: '', total_bookings: 6, created_at: '2024-03-02T09:00:00Z' },
  { id: 'c3', name: 'Meera Shah', phone_number: '+91 97001 23456', email: 'meera@example.com', client_type: 'vip', booking_source: 'whatsapp_ai', notes: 'Allergic to latex gloves', total_bookings: 22, created_at: '2023-11-20T11:00:00Z' },
  { id: 'c4', name: 'Rina Patil', phone_number: '+91 90909 80808', email: '', client_type: 'first_time', booking_source: 'manual_crm', notes: '', total_bookings: 1, created_at: '2025-04-10T14:00:00Z' },
  { id: 'c5', name: 'Kavya Mehta', phone_number: '+91 88000 12345', email: 'kavya@example.com', client_type: 'regular', booking_source: 'whatsapp_ai', notes: 'Birthday: March 12', total_bookings: 9, created_at: '2024-06-01T08:00:00Z' },
  { id: 'c6', name: 'Divya Sharma', phone_number: '+91 70123 45678', email: 'divya@example.com', client_type: 'regular', booking_source: 'live_chat', notes: '', total_bookings: 4, created_at: '2024-09-18T16:00:00Z' },
  { id: 'c7', name: 'Ananya Joshi', phone_number: '+91 91234 56789', email: 'ananya@example.com', client_type: 'first_time', booking_source: 'walk_in', notes: 'Referred by Meera Shah', total_bookings: 1, created_at: '2025-05-01T10:30:00Z' },
];

const DEMO_HISTORY: ApiAppointment[] = [
  { id: 'a1', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210', service_name: 'Gel Nail Extension', service_price: 1800, appointment_date: '2025-05-10T10:00:00Z', provider: 'Priya', status: 'completed', payment_status: 'paid', booked_by: 'whatsapp_ai', created_at: '2025-05-08T09:00:00Z' },
  { id: 'a2', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210', service_name: 'Manicure Classic', service_price: 700, appointment_date: '2025-04-05T11:00:00Z', provider: 'Riya', status: 'completed', payment_status: 'paid', booked_by: 'whatsapp_ai', created_at: '2025-04-03T09:00:00Z' },
  { id: 'a3', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210', service_name: 'Botox Treatment', service_price: 5000, appointment_date: '2025-03-15T14:00:00Z', provider: 'Dr. Anjali', status: 'completed', payment_status: 'paid', booked_by: 'whatsapp_ai', created_at: '2025-03-12T10:00:00Z' },
];

// ── Badge components ───────────────────────────────────────────────────────────
const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  vip: '♛ VIP',
  regular: '⭐ Regular',
  first_time: '✨ First Time',
};
const CLIENT_TYPE_STYLES: Record<ClientType, string> = {
  vip: 'bg-plum-pale text-plum',
  regular: 'bg-gold-pale text-gold',
  first_time: 'bg-sage-pale text-sage',
};
const SOURCE_LABELS: Record<BookingSource, string> = {
  whatsapp_ai: '✦ WhatsApp AI',
  live_chat: '💬 Live Chat',
  manual_crm: '👤 Manual',
  walk_in: '🚶 Walk-in',
};
const SOURCE_STYLES: Record<BookingSource, string> = {
  whatsapp_ai: 'bg-rose-pale text-rose',
  live_chat: 'bg-sage-pale text-sage',
  manual_crm: 'bg-warm text-text-muted',
  walk_in: 'bg-gold-pale text-gold',
};

function ClientTypeBadge({ type }: { type: ClientType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.62rem] font-semibold ${CLIENT_TYPE_STYLES[type] || 'bg-warm text-text-muted'}`}>
      {CLIENT_TYPE_LABELS[type] || type}
    </span>
  );
}
function SourceBadge({ source }: { source: BookingSource }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.62rem] font-semibold ${SOURCE_STYLES[source] || 'bg-warm text-text-muted'}`}>
      {SOURCE_LABELS[source] || source}
    </span>
  );
}

// ── Initials avatar ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#F9EDEB', tc: '#C9847A' },
  { bg: '#F3EBF1', tc: '#7B4F6E' },
  { bg: '#FBF5E8', tc: '#B8965A' },
  { bg: '#EDF3EE', tc: '#7A9E7E' },
];
function Avatar({ name, idx }: { name: string; idx: number }) {
  const { bg, tc } = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-bold flex-shrink-0"
      style={{ background: bg, color: tc }}
    >
      {initials}
    </div>
  );
}

// ── History Modal ──────────────────────────────────────────────────────────────
interface HistoryModalProps {
  client: ApiClient;
  onClose: () => void;
}
function HistoryModal({ client, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await clientApi.getClientById(client.id);
        setHistory(res?.appointments || res?.data?.appointments || []);
      } catch {
        // If this is a demo client, show demo history
        setHistory(client.id === 'c1' ? DEMO_HISTORY : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [client.id]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const totalSpent = history
    .filter(a => a.payment_status === 'paid')
    .reduce((s, a) => s + Number(a.service_price || 0), 0);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end"
      onClick={handleOverlayClick}
    >
      <div className="animate-slideUp bg-white h-full w-[480px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-rose-pale/60 to-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={client.name} idx={0} />
            <div>
              <h2 className="font-serif text-[1.15rem] font-semibold text-deep">{client.name}</h2>
              <p className="text-[0.72rem] text-text-muted">{client.phone_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-warm transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Client Meta */}
        <div className="px-6 py-4 border-b border-border grid grid-cols-2 gap-3">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Client Type</div>
            <ClientTypeBadge type={client.client_type} />
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Booking Source</div>
            <SourceBadge source={client.booking_source} />
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Total Bookings</div>
            <span className="font-serif text-[1.1rem] font-semibold text-rose">{client.total_bookings ?? history.length}</span>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Total Spent</div>
            <span className="font-serif text-[1.1rem] font-semibold text-gold">₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>
          {client.email && (
            <div className="col-span-2">
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Email</div>
              <span className="text-[0.78rem] text-text-muted">{client.email}</span>
            </div>
          )}
          {client.notes && (
            <div className="col-span-2">
              <div className="text-[0.6rem] uppercase tracking-[1.2px] text-text-muted font-semibold mb-1">Notes</div>
              <p className="text-[0.78rem] text-deep leading-snug">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Appointment History */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-[0.62rem] font-semibold tracking-[1.4px] uppercase text-text-muted mb-3">
            Appointment History
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-warm animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-[0.8rem] text-text-muted">No appointment history found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((appt, i) => (
                <div key={appt.id || i} className="border border-border rounded-xl p-4 hover:bg-warm/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[0.85rem] font-semibold text-deep">{appt.service_name}</div>
                      <div className="text-[0.7rem] text-text-muted mt-0.5">{fmtDate(appt.appointment_date)}</div>
                    </div>
                    <div className="text-right">
                      {appt.service_price ? (
                        <div className="font-semibold text-gold text-[0.85rem]">₹{Number(appt.service_price).toLocaleString('en-IN')}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] font-semibold ${
                      appt.status === 'completed' ? 'bg-sage-pale text-sage' :
                      appt.status === 'cancelled' ? 'bg-rose-pale text-rose' :
                      appt.status === 'scheduled' ? 'bg-gold-pale text-gold' :
                      'bg-warm text-text-muted'
                    }`}>
                      {appt.status === 'completed' && '✓ Completed'}
                      {appt.status === 'cancelled' && '✕ Cancelled'}
                      {appt.status === 'scheduled' && '◷ Scheduled'}
                      {appt.status === 'rescheduled' && '↻ Rescheduled'}
                      {appt.status === 'no_show' && '— No Show'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] font-semibold ${
                      appt.payment_status === 'paid' ? 'bg-sage-pale text-sage' : 'bg-gold-pale text-gold'
                    }`}>
                      {appt.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                    {appt.provider && (
                      <span className="text-[0.65rem] text-text-muted">by {appt.provider}</span>
                    )}
                    {appt.booked_by === 'whatsapp_ai' && (
                      <span className="inline-flex items-center bg-rose-pale text-rose text-[0.58rem] font-bold px-1.5 py-0.5 rounded tracking-[0.4px]">
                        ✦ AI
                      </span>
                    )}
                  </div>
                  {appt.cancel_reason && (
                    <p className="text-[0.68rem] text-text-muted mt-1.5 italic">Reason: {appt.cancel_reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-warm/30">
          <p className="text-[0.65rem] text-text-muted text-center">
            Member since {new Date(client.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Clients Page ──────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      const data: ApiClient[] = res?.data || res || [];
      setClients(data.length ? data : DEMO_CLIENTS);
    } catch {
      setClients(DEMO_CLIENTS);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, sourceFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => loadClients(), 400);
    return () => clearTimeout(t);
  }, [loadClients]);

  // Client-side filtering on demo data
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone_number.includes(q);
    const matchType = typeFilter === 'all' || c.client_type === typeFilter;
    const matchSource = sourceFilter === 'all' || c.booking_source === sourceFilter;
    return matchSearch && matchType && matchSource;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-ivory">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-deep leading-none">Client Database</h1>
          <p className="text-[0.72rem] text-text-muted mt-1">{filtered.length} clients</p>
        </div>
        <button className="border border-border rounded-lg px-4 py-2 text-[0.78rem] font-medium text-text-muted hover:bg-warm transition-colors">
          Export CSV
        </button>
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[0.85rem]">🔍</span>
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 border border-border rounded-xl bg-white text-[0.82rem] text-deep placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-rose text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Client Type Filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-border rounded-xl bg-white px-3 py-2.5 text-[0.82rem] text-deep focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose/50 transition-all cursor-pointer"
        >
          <option value="all">All Client Types</option>
          <option value="vip">♛ VIP</option>
          <option value="regular">⭐ Regular</option>
          <option value="first_time">✨ First Time</option>
        </select>

        {/* Booking Source Filter */}
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="border border-border rounded-xl bg-white px-3 py-2.5 text-[0.82rem] text-deep focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose/50 transition-all cursor-pointer"
        >
          <option value="all">All Sources</option>
          <option value="whatsapp_ai">✦ WhatsApp AI</option>
          <option value="live_chat">💬 Live Chat</option>
          <option value="manual_crm">👤 Manual CRM</option>
          <option value="walk_in">🚶 Walk-in</option>
        </select>

        {/* Clear Filters */}
        {(typeFilter !== 'all' || sourceFilter !== 'all' || search) && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('all'); setSourceFilter('all'); }}
            className="border border-rose/30 text-rose rounded-xl px-3 py-2.5 text-[0.78rem] font-medium hover:bg-rose-pale transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Clients Table ── */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Client', 'Phone', 'Email', 'Type', 'Source', 'Bookings', 'Notes', ''].map(h => (
                <th key={h} className="bg-warm text-[0.62rem] font-semibold tracking-[1.2px] uppercase text-text-muted px-4 py-3 text-left border-b border-border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-4 py-3 border-b border-border">
                    <div className="h-8 rounded-lg bg-warm animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-text-muted text-[0.82rem]">
                  <div className="text-3xl mb-2">👥</div>
                  No clients found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((client, idx) => (
                <tr
                  key={client.id}
                  className="hover:bg-rose-pale/20 transition-colors group"
                >
                  {/* Avatar + Name */}
                  <td className="px-4 py-3.5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar name={client.name} idx={idx} />
                      <span className="font-semibold text-[0.85rem] text-deep">{client.name}</span>
                    </div>
                  </td>
                  {/* Phone */}
                  <td className="px-4 py-3.5 border-b border-border text-[0.8rem] text-text-muted">
                    {client.phone_number}
                  </td>
                  {/* Email */}
                  <td className="px-4 py-3.5 border-b border-border text-[0.78rem] text-text-muted">
                    {client.email || <span className="text-border">—</span>}
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3.5 border-b border-border">
                    <ClientTypeBadge type={client.client_type} />
                  </td>
                  {/* Source */}
                  <td className="px-4 py-3.5 border-b border-border">
                    <SourceBadge source={client.booking_source} />
                  </td>
                  {/* Bookings */}
                  <td className="px-4 py-3.5 border-b border-border">
                    <span className="font-serif text-[1rem] font-semibold text-rose">
                      {client.total_bookings ?? '—'}
                    </span>
                  </td>
                  {/* Notes */}
                  <td className="px-4 py-3.5 border-b border-border text-[0.75rem] text-text-muted max-w-[180px] truncate">
                    {client.notes || <span className="text-border">—</span>}
                  </td>
                  {/* Action */}
                  <td className="px-4 py-3.5 border-b border-border">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity border border-rose/30 text-rose text-[0.72rem] font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-pale transition-colors"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Client History Modal ── */}
      {selectedClient && (
        <HistoryModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}

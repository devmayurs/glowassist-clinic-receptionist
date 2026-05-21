// ── Legacy UI types (used by existing mock data + components) ────────────────
export interface Client {
  name: string;
  ini: string;
  bg: string;
  tc: string;
  last: string;
  status: string;
}

export interface Appointment {
  time: string;
  client: string;
  service: string;
  provider: string;
  status: 'confirmed' | 'pending' | 'vip' | 'cancelled';
  bookedBy: 'AI' | 'Human';
  ini: string;
  bg: string;
  tc: string;
  price: string;
}

export interface CallLog {
  client: string;
  time: string;
  dur: string;
  summary: string;
  chips: Array<'booked' | 'vip' | 'new' | 'pkg' | 'followup'>;
}

export interface Package {
  name: string;
  price: string;
  includes: string;
  active: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Toast {
  id: string;
  message: string;
  duration?: number;
}

export interface DashboardStats {
  callsHandled: number;
  bookings: number;
  newClients: number;
  estimatedRevenue: number;
}

export interface N8nChatRequest {
  message: string;
  history: Array<{ role: string; content: string }>;
  mode: 'sim' | 'live';
}

export interface N8nChatResponse {
  status: string;
  message: string;
  reply?: string;
}

// ── API / CRM types (Step 5 — real backend data) ─────────────────────────────

export type ClientType = 'first_time' | 'regular' | 'vip';
export type BookingSource = 'whatsapp_ai' | 'live_chat' | 'manual_crm' | 'walk_in' | 'instagram';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export interface ApiClient {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  client_type: ClientType;
  booking_source: BookingSource;
  notes?: string;
  total_bookings?: number;
  created_at: string;
}

export interface ApiAppointment {
  id: string;
  client_id: string;
  client_name: string;
  phone_number: string;
  service_name: string;
  service_price?: number;
  appointment_date: string;       // ISO datetime string
  provider?: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  booked_by: BookingSource;
  google_event_id?: string;
  notes?: string;
  cancel_reason?: string;
  created_at: string;
}

export interface ClientHistory {
  client: ApiClient;
  appointments: ApiAppointment[];
}

export interface CrmDashboardStats {
  totalClients: number;
  totalAppointments: number;
  aiBookings: number;
  manualBookings: number;
  liveChatBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  bookingSourceBreakdown: { source: string; count: number }[];
  upcomingAppointments: ApiAppointment[];
}

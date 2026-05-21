import type { ClientType, BookingSource, AppointmentStatus, PaymentStatus } from '../types';

export const CLINIC_METADATA = {
  name: 'Lumière Med Spa',
  phone: '(555) 784-2301',
  address: '45 Blossom Avenue, Suite 200',
  operatingHours: {
    weekdays: { label: 'Mon - Sat', start: '09:00', end: '19:00', startHour: 9, endHour: 19 },
    sunday: { label: 'Sunday', start: '10:00', end: '17:00', startHour: 10, endHour: 17 },
  },
};

export const TREATMENT_PACKAGES = [
  { name: 'Radiance Membership', price: '$299/mo', includes: '1 HydraFacial + 20% off all treatments + priority booking', active: 14 },
  { name: 'Glow Bundle — 6 Peels', price: '$1,499', includes: '6 VI Chemical Peels (save $601)', active: 8 },
  { name: 'Botox Club', price: '$199/mo', includes: 'Up to 40 units Botox monthly + free consultations', active: 22 },
  { name: 'Laser Package — 6 Sessions', price: '$2,400', includes: '6 laser resurfacing sessions (save $700)', active: 5 },
];

export const CLIENT_STATUS_COLORS: Record<ClientType, { bg: string; text: string; label: string }> = {
  first_time: { bg: '#FBF5E8', text: '#B8965A', label: 'First Time' },
  regular: { bg: '#EDF3EE', text: '#7A9E7E', label: 'Regular' },
  vip: { bg: '#F9EDEB', text: '#C9847A', label: 'VIP' },
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  scheduled: { bg: '#EDF3EE', text: '#7A9E7E', label: 'Scheduled' },
  completed: { bg: '#EDF3EE', text: '#7A9E7E', label: 'Completed' },
  cancelled: { bg: '#F9EDEB', text: '#C9847A', label: 'Cancelled' },
  rescheduled: { bg: '#FBF5E8', text: '#B8965A', label: 'Rescheduled' },
  no_show: { bg: '#FAF8F5', text: '#8A7268', label: 'No Show' },
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
  paid: { bg: '#EDF3EE', text: '#7A9E7E', label: 'Paid' },
  pending: { bg: '#F9EDEB', text: '#C9847A', label: 'Pending' },
  partial: { bg: '#FBF5E8', text: '#B8965A', label: 'Partial' },
  refunded: { bg: '#FAF8F5', text: '#8A7268', label: 'Refunded' },
};

export const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  whatsapp_ai: 'WhatsApp AI',
  live_chat: 'Live Chat',
  manual_crm: 'Manual CRM',
  walk_in: 'Walk-In',
  instagram: 'Instagram',
};

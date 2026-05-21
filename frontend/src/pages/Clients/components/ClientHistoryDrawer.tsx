import { useState, useEffect } from 'react';
import { 
  Drawer, Box, Typography, Avatar, IconButton, Grid, CircularProgress, Card, CardContent, Chip 
} from '@mui/material';
import { clientApi } from '../../../apis';
import type { ApiClient, ApiAppointment, ClientType, BookingSource } from '../../../types';

const DEMO_HISTORY: ApiAppointment[] = [
  { id: 'a1', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210', service_name: 'Gel Nail Extension', service_price: 1800, appointment_date: '2025-05-10T10:00:00Z', provider: 'Priya', status: 'completed', payment_status: 'paid', booked_by: 'whatsapp_ai', created_at: '2025-05-08T09:00:00Z' },
  { id: 'a2', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210', service_name: 'Manicure Classic', service_price: 700, appointment_date: '2025-04-05T11:00:00Z', provider: 'Riya', status: 'completed', payment_status: 'paid', booked_by: 'whatsapp_ai', created_at: '2025-04-03T09:00:00Z' },
  { id: 'a3', client_id: 'c1', client_name: 'Sophia Laurent', phone_number: '+91 98765 43210', service_name: 'Botox Treatment', service_price: 5000, appointment_date: '2025-03-15T14:00:00Z', provider: 'Dr. Anjali', status: 'completed', payment_status: 'paid', booked_by: 'whatsapp_ai', created_at: '2025-03-12T10:00:00Z' },
];

const CLIENT_TYPE_MAP: Record<ClientType, { bg: string; text: string; label: string }> = {
  vip: { bg: 'rgba(123, 79, 110, 0.1)', text: '#7B4F6E', label: '♛ VIP' },
  regular: { bg: 'rgba(184, 150, 90, 0.1)', text: '#B8965A', label: '⭐ Regular' },
  first_time: { bg: 'rgba(122, 158, 126, 0.1)', text: '#7A9E7E', label: '✨ First Time' },
};

const SOURCE_MAP: Record<BookingSource, { bg: string; text: string; label: string }> = {
  whatsapp_ai: { bg: 'rgba(201, 132, 122, 0.1)', text: '#C9847A', label: '✦ WhatsApp AI' },
  live_chat: { bg: 'rgba(122, 158, 126, 0.1)', text: '#7A9E7E', label: '💬 Live Chat' },
  manual_crm: { bg: '#FAF8F5', text: '#8A7268', label: '👤 Manual' },
  walk_in: { bg: 'rgba(184, 150, 90, 0.1)', text: '#B8965A', label: '🚶 Walk-in' },
  instagram: { bg: 'rgba(225, 48, 108, 0.1)', text: '#E1306C', label: '📸 Instagram' },
};

interface ClientHistoryDrawerProps {
  client: ApiClient | null;
  onClose: () => void;
}

export function ClientHistoryDrawer({ client, onClose }: ClientHistoryDrawerProps) {
  const [history, setHistory] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!client) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await clientApi.getClientById(client.id);
        const appts = res?.appointments || res?.data?.appointments || res || [];
        setHistory(Array.isArray(appts) ? appts : []);
      } catch {
        setHistory(client.id === 'c1' ? DEMO_HISTORY : []);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [client]);

  if (!client) return null;

  const totalSpent = history
    .filter(a => a.payment_status === 'paid')
    .reduce((s, a) => s + Number(a.service_price || 0), 0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const currentType = CLIENT_TYPE_MAP[client.client_type] || { bg: '#FAF8F5', text: '#8A7268', label: client.client_type };
  const currentSource = SOURCE_MAP[client.booking_source] || { bg: '#FAF8F5', text: '#8A7268', label: client.booking_source };

  return (
    <Drawer 
      anchor="right" 
      open={!!client} 
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 }, borderLeft: '1px solid', borderColor: 'divider' }
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2.5, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          bgcolor: 'rgba(201, 132, 122, 0.04)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              bgcolor: 'rgba(201, 132, 122, 0.1)', 
              color: '#C9847A' 
            }}
          >
            {getInitials(client.name)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: 'text.primary', fontSize: '1.15rem', lineHeight: 1.2 }}>
              {client.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {client.phone_number}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary', p: 0.5 }}>
          ✕
        </IconButton>
      </Box>

      {/* Client Summary Meta */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#FAF8F5' }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}>
              Client Type
            </Typography>
            <Chip 
              label={currentType.label} 
              sx={{ bgcolor: currentType.bg, color: currentType.text, fontWeight: 600, fontSize: '0.62rem', height: 20 }} 
              size="small" 
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}>
              Booking Source
            </Typography>
            <Chip 
              label={currentSource.label} 
              sx={{ bgcolor: currentSource.bg, color: currentSource.text, fontWeight: 600, fontSize: '0.62rem', height: 20 }} 
              size="small" 
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'text.secondary', mb: 0.2 }}>
              Total Bookings
            </Typography>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
              {client.total_bookings ?? history.length}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'text.secondary', mb: 0.2 }}>
              Total Spent
            </Typography>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: 'secondary.main' }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </Typography>
          </Grid>

          {client.email && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'text.secondary', mb: 0.2 }}>
                Email
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {client.email}
              </Typography>
            </Grid>
          )}

          {client.notes && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'text.secondary', mb: 0.2 }}>
                Notes
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.primary', bgcolor: 'rgba(255,255,255,0.7)', p: 1, borderRadius: 1.5, border: '1px solid rgba(0,0,0,0.03)', lineHeight: 1.4 }}>
                {client.notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Appointment History Logs */}
      <Box sx={{ flex1: 1, overflowY: 'auto', p: 3 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            fontSize: '0.62rem', 
            fontWeight: 600, 
            letterSpacing: 1.4, 
            textTransform: 'uppercase', 
            color: 'text.secondary', 
            mb: 2 
          }}
        >
          Appointment History
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} sx={{ color: 'primary.main' }} />
          </Box>
        ) : history.length === 0 ? (
          <Box alignContent="center" textAlign="center" py={5}>
            <Typography variant="body2" sx={{ fontSize: '2rem', mb: 1 }}>📋</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              No appointment history found.
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {history.map((appt, i) => (
              <Card 
                key={appt.id || i}
                sx={{ 
                  borderRadius: 3, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)', borderColor: 'rgba(201, 132, 122, 0.3)' }
                }}
              >
                <CardContent sx={{ p: '16px !important' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
                        {appt.service_name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.2 }}>
                        {fmtDate(appt.appointment_date)}
                      </Typography>
                    </Box>
                    {appt.service_price ? (
                      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', fontWeight: 600, color: 'secondary.main' }}>
                        ₹{Number(appt.service_price).toLocaleString('en-IN')}
                      </Typography>
                    ) : null}
                  </Box>

                  <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
                    <Chip 
                      label={
                        appt.status === 'completed' ? '✓ Completed' :
                        appt.status === 'cancelled' ? '✕ Cancelled' :
                        appt.status === 'scheduled' ? '◷ Scheduled' :
                        appt.status === 'rescheduled' ? '↻ Rescheduled' :
                        appt.status === 'no_show' ? '— No Show' : appt.status
                      }
                      sx={{
                        fontSize: '0.6rem',
                        height: 18,
                        fontWeight: 600,
                        bgcolor: 
                          appt.status === 'completed' ? 'rgba(122, 158, 126, 0.1)' :
                          appt.status === 'cancelled' ? 'rgba(201, 132, 122, 0.1)' :
                          appt.status === 'scheduled' ? 'rgba(184, 150, 90, 0.1)' :
                          '#FAF8F5',
                        color:
                          appt.status === 'completed' ? '#7A9E7E' :
                          appt.status === 'cancelled' ? '#C9847A' :
                          appt.status === 'scheduled' ? '#B8965A' :
                          '#8A7268'
                      }}
                      size="small"
                    />

                    <Chip 
                      label={appt.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      sx={{
                        fontSize: '0.6rem',
                        height: 18,
                        fontWeight: 600,
                        bgcolor: appt.payment_status === 'paid' ? 'rgba(122, 158, 126, 0.1)' : 'rgba(184, 150, 90, 0.1)',
                        color: appt.payment_status === 'paid' ? '#7A9E7E' : '#B8965A'
                      }}
                      size="small"
                    />

                    {appt.provider && (
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', ml: 0.5 }}>
                        by {appt.provider}
                      </Typography>
                    )}

                    {appt.booked_by === 'whatsapp_ai' && (
                      <Chip 
                        label="✦ AI"
                        sx={{
                          fontSize: '0.58rem',
                          height: 16,
                          fontWeight: 700,
                          bgcolor: 'rgba(201, 132, 122, 0.1)',
                          color: '#C9847A',
                          borderRadius: 0.5
                        }}
                        size="small"
                      />
                    )}
                  </Box>

                  {appt.cancel_reason && (
                    <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 1, fontStyle: 'italic', borderLeft: '2px solid rgba(201, 132, 122, 0.3)', pl: 1 }}>
                      Reason: {appt.cancel_reason}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer info */}
      <Box sx={{ px: 3, py: 2, bgcolor: 'rgba(0,0,0,0.02)', borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
          Member since {new Date(client.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </Typography>
      </Box>
    </Drawer>
  );
}

export default ClientHistoryDrawer;

import { 
  Paper, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Avatar, Chip, CircularProgress 
} from '@mui/material';
import type { ApiAppointment } from '../../../types';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    scheduled: { bg: 'rgba(122, 158, 126, 0.1)', text: '#7A9E7E', label: '◷ Scheduled' },
    completed: { bg: 'rgba(184, 150, 90, 0.1)', text: '#B8965A', label: '✓ Completed' },
    cancelled: { bg: 'rgba(201, 132, 122, 0.1)', text: '#C9847A', label: '✕ Cancelled' },
    rescheduled: { bg: 'rgba(123, 79, 110, 0.1)', text: '#7B4F6E', label: '↻ Rescheduled' },
    no_show: { bg: '#FAF8F5', text: '#8A7268', label: '— No Show' },
  };

  const current = map[status] || { bg: '#FAF8F5', text: '#8A7268', label: status };

  return (
    <Chip 
      label={current.label}
      sx={{
        bgcolor: current.bg,
        color: current.text,
        fontWeight: 600,
        fontSize: '0.62rem',
        height: 20,
        borderRadius: 5,
        border: 'none',
        '& .MuiChip-label': { px: 1 }
      }}
      size="small"
    />
  );
}

function SourceBadge({ source }: { source: string }) {
  if (source === 'whatsapp_ai') {
    return (
      <Chip 
        label="✦ AI"
        sx={{
          bgcolor: 'rgba(201, 132, 122, 0.1)',
          color: '#C9847A',
          fontWeight: 700,
          fontSize: '0.6rem',
          height: 18,
          borderRadius: 1,
          '& .MuiChip-label': { px: 1 }
        }}
        size="small"
      />
    );
  }
  if (source === 'live_chat') {
    return (
      <Chip 
        label="💬 Chat"
        sx={{
          bgcolor: 'rgba(122, 158, 126, 0.1)',
          color: '#7A9E7E',
          fontWeight: 700,
          fontSize: '0.6rem',
          height: 18,
          borderRadius: 1,
          '& .MuiChip-label': { px: 1 }
        }}
        size="small"
      />
    );
  }
  return (
    <Typography variant="body2" sx={{ fontSize: '0.68rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      👤 Manual
    </Typography>
  );
}

interface UpcomingAppointmentsGridProps {
  stats: any;
  loading: boolean;
}

export function UpcomingAppointmentsGrid({ stats, loading }: UpcomingAppointmentsGridProps) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const upcomingAppointments = stats?.upcomingAppointments || [];

  return (
    <Paper 
      sx={{ 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        boxShadow: 'none',
        overflow: 'hidden',
        '&:hover': {
          borderColor: '#C9847A',
          boxShadow: '0 4px 20px rgba(201, 132, 122, 0.04)',
        }
      }}
    >
      <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600, 
            letterSpacing: 1.2, 
            textTransform: 'uppercase', 
            color: 'text.secondary' 
          }}
        >
          Upcoming Appointments
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
          Next 5 slots
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={30} sx={{ color: 'primary.main' }} />
        </Box>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {['Date & Time', 'Client', 'Service', 'Provider', 'Status', 'Payment', 'Source'].map(h => (
                  <TableCell key={h} sx={{ py: 1.5, fontSize: '0.62rem', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'text.secondary' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingAppointments.map((a: ApiAppointment, i: number) => (
                <TableRow 
                  key={a.id || i} 
                  sx={{ 
                    transition: 'colors 0.2s', 
                    '&:hover': { bgcolor: 'rgba(201, 132, 122, 0.03)' } 
                  }}
                >
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary' }}>
                    {fmtDate(a.appointment_date)}
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          bgcolor: 'rgba(201, 132, 122, 0.1)', 
                          color: '#C9847A' 
                        }}
                      >
                        {getInitials(a.client_name)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.1 }}>
                          {a.client_name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.2 }}>
                          {a.phone_number}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {a.service_name}
                  </TableCell>
                  
                  <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                    {a.provider || '—'}
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 600, 
                        color: a.payment_status === 'paid' ? '#7A9E7E' : '#B8965A' 
                      }}
                    >
                      {a.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <SourceBadge source={a.booked_by} />
                  </TableCell>
                </TableRow>
              ))}

              {upcomingAppointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary', fontSize: '0.8rem' }}>
                    No upcoming appointments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default UpcomingAppointmentsGrid;

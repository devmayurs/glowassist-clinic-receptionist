import { ReactNode, ReactElement } from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  Button, 
  Grid, 
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { ApiAppointment, BookingSource } from '../../../types';

interface AppointmentDetailDrawerProps {
  appt: ApiAppointment | null;
  open: boolean;
  onClose: () => void;
  onRescheduleClick: () => void;
  onCancelClick: () => void;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: ReactNode }> = {
  scheduled: { bg: 'rgba(184, 150, 90, 0.1)', color: '#B8965A', label: 'Scheduled', icon: <CalendarMonthIcon sx={{ fontSize: '0.75rem' }} /> },
  completed: { bg: 'rgba(122, 158, 126, 0.1)', color: '#7A9E7E', label: 'Completed', icon: <CheckCircleOutlineIcon sx={{ fontSize: '0.75rem' }} /> },
  cancelled: { bg: 'rgba(201, 132, 122, 0.1)', color: '#C9847A', label: 'Cancelled', icon: <CancelOutlinedIcon sx={{ fontSize: '0.75rem' }} /> },
  rescheduled: { bg: 'rgba(123, 79, 110, 0.1)', color: '#7B4F6E', label: 'Rescheduled', icon: <AutorenewIcon sx={{ fontSize: '0.75rem' }} /> },
  no_show: { bg: 'rgba(142, 142, 142, 0.1)', color: '#8E8E8E', label: 'No Show', icon: <HelpOutlineIcon sx={{ fontSize: '0.75rem' }} /> },
};

function StatusBadge({ status }: { status: string }) {
  const conf = STATUS_CONFIG[status] || { bg: '#F4EFE8', color: '#666', label: status, icon: null };
  return (
    <Chip 
      icon={conf.icon as ReactElement}
      label={conf.label} 
      size="small"
      sx={{ 
        bgcolor: conf.bg, 
        color: conf.color, 
        fontWeight: 600, 
        fontSize: '0.62rem',
        height: '20px',
        '& .MuiChip-label': { px: 1 },
        '& .MuiChip-icon': { color: 'inherit', marginLeft: '6px', marginRight: '-2px' }
      }}
    />
  );
}

function PayBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    paid: { bg: 'rgba(122, 158, 126, 0.1)', color: '#7A9E7E', label: 'Paid' },
    pending: { bg: 'rgba(184, 150, 90, 0.1)', color: '#B8965A', label: 'Pending' },
    partial: { bg: 'rgba(123, 79, 110, 0.1)', color: '#7B4F6E', label: 'Partial' },
    refunded: { bg: 'rgba(201, 132, 122, 0.1)', color: '#C9847A', label: 'Refunded' },
  };
  const conf = map[status] || { bg: '#F4EFE8', color: '#666', label: status };
  return (
    <Chip 
      label={conf.label} 
      size="small"
      sx={{ 
        bgcolor: conf.bg, 
        color: conf.color, 
        fontWeight: 600, 
        fontSize: '0.62rem',
        height: '20px',
        '& .MuiChip-label': { px: 1 }
      }}
    />
  );
}

function SourceBadge({ source }: { source: BookingSource }) {
  if (source === 'whatsapp_ai') {
    return (
      <Box 
        component="span" 
        sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 0.5, 
          bgcolor: 'rgba(201, 132, 122, 0.1)', 
          color: '#C9847A', 
          fontSize: '0.6rem', 
          fontWeight: 700, 
          px: 1, 
          py: 0.25, 
          borderRadius: 1 
        }}
      >
        ✦ AI
      </Box>
    );
  }
  if (source === 'live_chat') {
    return (
      <Box 
        component="span" 
        sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 0.5, 
          bgcolor: 'rgba(122, 158, 126, 0.1)', 
          color: '#7A9E7E', 
          fontSize: '0.6rem', 
          fontWeight: 700, 
          px: 1, 
          py: 0.25, 
          borderRadius: 1 
        }}
      >
        💬 Chat
      </Box>
    );
  }
  return (
    <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
      👤 Manual
    </Typography>
  );
}

export default function AppointmentDetailDrawer({
  appt,
  open,
  onClose,
  onRescheduleClick,
  onCancelClick
}: AppointmentDetailDrawerProps) {
  if (!appt) return null;

  const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const fmtTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          bgcolor: '#FFFFFF',
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
        }
      }}
    >
      {/* Header with gradient overlay */}
      <Box 
        sx={{ 
          px: 3, 
          py: 3, 
          bgcolor: 'rgba(244, 239, 232, 0.3)', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <StatusBadge status={appt.status} />
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon sx={{ fontSize: '1.1rem' }} />
          </IconButton>
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            fontWeight: 700, 
            color: '#2A1F1A',
            fontSize: '1.25rem',
            lineHeight: 1.2
          }}
        >
          {appt.service_name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
          {appt.client_name} · {appt.phone_number}
        </Typography>
      </Box>

      {/* Detail Content */}
      <Box sx={{ flex1: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Date
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#2A1F1A' }}>
              {fmtDate(appt.appointment_date)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Time
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#2A1F1A' }}>
              {fmtTime(appt.appointment_date)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Provider
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#2A1F1A', fontWeight: 500 }}>
              {appt.provider || '—'}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Price
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#B8965A', fontFamily: "'Cormorant Garamond', serif" }}>
              {appt.service_price ? `₹${Number(appt.service_price).toLocaleString('en-IN')}` : '—'}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Payment Status
            </Typography>
            <Box sx={{ mt: 0.25 }}>
              <PayBadge status={appt.payment_status} />
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Booking Source
            </Typography>
            <Box sx={{ mt: 0.25 }}>
              <SourceBadge source={appt.booked_by} />
            </Box>
          </Grid>
        </Grid>

        {appt.notes && (
          <Box>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Notes
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#2A1F1A', p: 1.5, bgcolor: '#FAF8F5', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {appt.notes}
            </Typography>
          </Box>
        )}

        {appt.cancel_reason && (
          <Box>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Cancellation Reason
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#C9847A', p: 1.5, bgcolor: 'rgba(201, 132, 122, 0.05)', borderRadius: 2, border: '1px dashed', borderColor: 'rgba(201, 132, 122, 0.3)', fontStyle: 'italic' }}>
              {appt.cancel_reason}
            </Typography>
          </Box>
        )}

        {appt.google_event_id && (
          <Box display="flex" alignItems="center" gap={1} sx={{ mt: -1 }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#7A9E7E', fontWeight: 600 }}>
              ✓ Synced to Google Calendar
            </Typography>
          </Box>
        )}
      </Box>

      {/* Drawer Action Buttons footer */}
      {(appt.status === 'scheduled' || appt.status === 'rescheduled') && (
        <Box sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onRescheduleClick}
            sx={{
              borderColor: 'rgba(184, 150, 90, 0.4)',
              color: '#B8965A',
              py: 1.25,
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 3,
              textTransform: 'none',
              bgcolor: 'rgba(184, 150, 90, 0.02)',
              '&:hover': {
                borderColor: '#B8965A',
                bgcolor: 'rgba(184, 150, 90, 0.08)'
              }
            }}
          >
            ↻ Reschedule Appointment
          </Button>
          <Button
            variant="outlined"
            onClick={onCancelClick}
            sx={{
              borderColor: 'rgba(201, 132, 122, 0.3)',
              color: '#C9847A',
              py: 1.25,
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 3,
              textTransform: 'none',
              bgcolor: 'rgba(201, 132, 122, 0.02)',
              '&:hover': {
                borderColor: '#C9847A',
                bgcolor: 'rgba(201, 132, 122, 0.08)'
              }
            }}
          >
            ✕ Cancel Appointment
          </Button>
        </Box>
      )}
    </Drawer>
  );
}

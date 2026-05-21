import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Avatar, 
  Typography, 
  Box, 
  Button, 
  Skeleton,
  Chip
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { ApiAppointment, BookingSource } from '../../../types';
import { getInitials, getAvatarStyles } from '../../../utilities/format.utils';

interface AppointmentsTableProps {
  appointments: ApiAppointment[];
  loading: boolean;
  onSelect: (appt: ApiAppointment) => void;
  onRescheduleClick: (e: React.MouseEvent, appt: ApiAppointment) => void;
  onCancelClick: (e: React.MouseEvent, appt: ApiAppointment) => void;
}

// Color and Label mappings for statuses
const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
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
      icon={conf.icon as React.ReactElement}
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

export default function AppointmentsTable({ 
  appointments, 
  loading, 
  onSelect, 
  onRescheduleClick, 
  onCancelClick 
}: AppointmentsTableProps) {

  const fmtDateTime = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const tmrw = new Date(today); 
    tmrw.setDate(today.getDate() + 1);
    
    const prefix = d.toDateString() === today.toDateString() ? 'Today' :
      d.toDateString() === tmrw.toDateString() ? 'Tomorrow' :
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
    return `${prefix}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const headers = ['Date & Time', 'Client', 'Service', 'Provider', 'Status', 'Payment', 'Source', 'Price', ''];

  return (
    <TableContainer 
      component={Paper} 
      elevation={0}
      sx={{ 
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4, 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}
    >
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#FAF8F5' }}>
            {headers.map((h, i) => (
              <TableCell 
                key={h} 
                align={i === 7 ? 'right' : 'left'}
                sx={{ 
                  color: 'text.secondary', 
                  fontSize: '0.6rem', 
                  fontWeight: 700, 
                  letterSpacing: '1.2px', 
                  textTransform: 'uppercase',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 1.5,
                  px: 2
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={9} sx={{ py: 2, px: 2 }}>
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
                </TableCell>
              </TableRow>
            ))
          ) : appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>📅</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  No appointments found for these filters.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appt) => {
              const avatarStyle = getAvatarStyles(appt.client_name);
              const initials = getInitials(appt.client_name);

              return (
                <TableRow
                  key={appt.id}
                  hover
                  onClick={() => onSelect(appt)}
                  sx={{ 
                    cursor: 'pointer', 
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(201, 132, 122, 0.02)'
                    },
                    '&:hover .action-buttons': {
                      opacity: 1
                    }
                  }}
                >
                  {/* Date & Time */}
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#2A1F1A', py: 2, px: 2 }}>
                    {fmtDateTime(appt.appointment_date)}
                  </TableCell>

                  {/* Client Info */}
                  <TableCell sx={{ py: 2, px: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          fontSize: '0.62rem', 
                          fontWeight: 700, 
                          bgcolor: avatarStyle.bg, 
                          color: avatarStyle.tc 
                        }}
                      >
                        {initials}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#2A1F1A', lineHeight: 1.2 }}>
                          {appt.client_name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                          {appt.phone_number}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Service */}
                  <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary', py: 2, px: 2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appt.service_name}
                  </TableCell>

                  {/* Provider */}
                  <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary', py: 2, px: 2 }}>
                    {appt.provider || '—'}
                  </TableCell>

                  {/* Status */}
                  <TableCell sx={{ py: 2, px: 2 }}>
                    <StatusBadge status={appt.status} />
                  </TableCell>

                  {/* Payment */}
                  <TableCell sx={{ py: 2, px: 2 }}>
                    <PayBadge status={appt.payment_status} />
                  </TableCell>

                  {/* Source */}
                  <TableCell sx={{ py: 2, px: 2 }}>
                    <SourceBadge source={appt.booked_by} />
                  </TableCell>

                  {/* Price */}
                  <TableCell align="right" sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#B8965A', py: 2, px: 2 }}>
                    {appt.service_price ? `₹${Number(appt.service_price).toLocaleString('en-IN')}` : '—'}
                  </TableCell>

                  {/* Action Hover Buttons */}
                  <TableCell sx={{ py: 2, px: 2 }}>
                    {(appt.status === 'scheduled' || appt.status === 'rescheduled') && (
                      <Box 
                        className="action-buttons"
                        display="flex" 
                        gap={1} 
                        sx={{ 
                          opacity: 0, 
                          transition: 'opacity 0.2s', 
                          justifyContent: 'flex-end',
                          pointerEvents: 'auto'
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => onRescheduleClick(e, appt)}
                          sx={{
                            borderColor: 'rgba(184, 150, 90, 0.4)',
                            color: '#B8965A',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            py: 0.25,
                            px: 1.5,
                            minWidth: 0,
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: 'rgba(184, 150, 90, 0.02)',
                            '&:hover': {
                              borderColor: '#B8965A',
                              bgcolor: 'rgba(184, 150, 90, 0.08)',
                            }
                          }}
                        >
                          ↻ Move
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => onCancelClick(e, appt)}
                          sx={{
                            borderColor: 'rgba(201, 132, 122, 0.3)',
                            color: '#C9847A',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            py: 0.25,
                            px: 1.5,
                            minWidth: 0,
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: 'rgba(201, 132, 122, 0.02)',
                            '&:hover': {
                              borderColor: '#C9847A',
                              bgcolor: 'rgba(201, 132, 122, 0.08)',
                            }
                          }}
                        >
                          ✕ Cancel
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import { useState } from 'react';
import { Box, Typography, Button, IconButton, Grid, Paper, Tooltip } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import type { ApiAppointment } from '../../../types';

interface AppointmentsCalendarProps {
  appointments: ApiAppointment[];
  onSelect: (appt: ApiAppointment) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AppointmentsCalendar({ appointments, onSelect }: AppointmentsCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  
  const handlePrev = () => setViewDate(new Date(year, month - 1, 1));
  const handleNext = () => setViewDate(new Date(year, month + 1, 1));

  // Group appointments by date string yyyy-mm-dd
  const byDate: Record<string, ApiAppointment[]> = {};
  appointments.forEach(a => {
    const key = a.appointment_date.slice(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(a);
  });

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Paper 
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
      {/* Calendar Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <IconButton onClick={handlePrev} size="small" sx={{ color: 'text.secondary' }}>
          <ArrowBackIosNewIcon sx={{ fontSize: '0.9rem' }} />
        </IconButton>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            fontWeight: 600, 
            color: '#2A1F1A',
            fontSize: '1.2rem'
          }}
        >
          {monthName}
        </Typography>
        <IconButton onClick={handleNext} size="small" sx={{ color: 'text.secondary' }}>
          <ArrowForwardIosIcon sx={{ fontSize: '0.9rem' }} />
        </IconButton>
      </Box>

      {/* Day of Week Labels */}
      <Grid container sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F4EFE8/20' }}>
        {DAYS.map(day => (
          <Grid 
            item 
            xs={12/7} 
            key={day} 
            sx={{ 
              textAlign: 'center', 
              py: 1.5,
              color: 'text.secondary',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '1.2px',
              textTransform: 'uppercase'
            }}
          >
            {day}
          </Grid>
        ))}
      </Grid>

      {/* Calendar Month Grid */}
      <Grid container sx={{ minHeight: '380px' }}>
        {/* Empty cells before the start of the month */}
        {[...Array(firstDay)].map((_, i) => (
          <Grid 
            item 
            xs={12/7} 
            key={`empty-${i}`} 
            sx={{ 
              borderRight: '1px solid', 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              minHeight: '90px',
              bgcolor: 'rgba(244, 239, 232, 0.2)' 
            }}
          />
        ))}

        {/* Calendar days cells */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const key = `${year}-${pad(month + 1)}-${pad(day)}`;
          const dayAppts = byDate[key] || [];
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const colIndex = (firstDay + i) % 7;
          const isLastColumn = colIndex === 6;

          return (
            <Grid 
              item 
              xs={12/7} 
              key={day}
              sx={{ 
                borderBottom: '1px solid', 
                borderRight: isLastColumn ? 'none' : '1px solid',
                borderColor: 'divider',
                minHeight: '90px',
                p: 1,
                bgcolor: isToday ? 'rgba(201, 132, 122, 0.05)' : 'transparent',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: isToday ? 'rgba(201, 132, 122, 0.08)' : 'rgba(244, 239, 232, 0.15)'
                }
              }}
            >
              <Box display="flex" justifyContent="flex-start" sx={{ mb: 0.5 }}>
                <Typography 
                  sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    color: isToday ? '#FFFFFF' : 'text.primary',
                    bgcolor: isToday ? 'primary.main' : 'transparent'
                  }}
                >
                  {day}
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={0.5}>
                {dayAppts.slice(0, 3).map((appt) => {
                  let badgeColors = { bg: 'rgba(184, 150, 90, 0.1)', color: '#B8965A' }; // default scheduled/rescheduled gold
                  if (appt.status === 'cancelled') {
                    badgeColors = { bg: 'rgba(201, 132, 122, 0.1)', color: '#C9847A' }; // cancelled rose
                  } else if (appt.status === 'completed') {
                    badgeColors = { bg: 'rgba(122, 158, 126, 0.1)', color: '#7A9E7E' }; // completed sage
                  }

                  const apptTime = new Date(appt.appointment_date).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });

                  return (
                    <Tooltip key={appt.id} title={`${appt.client_name} - ${appt.service_name}`} arrow>
                      <Button
                        onClick={() => onSelect(appt)}
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.58rem',
                          fontWeight: 600,
                          borderRadius: 1,
                          bgcolor: badgeColors.bg,
                          color: badgeColors.color,
                          textTransform: 'none',
                          minWidth: 0,
                          height: '18px',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            bgcolor: badgeColors.bg,
                            opacity: 0.8
                          }
                        }}
                      >
                        {apptTime} {appt.client_name.split(' ')[0]}
                      </Button>
                    </Tooltip>
                  );
                })}
                {dayAppts.length > 3 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.55rem', 
                      color: 'text.secondary', 
                      pl: 0.5, 
                      fontWeight: 600 
                    }}
                  >
                    +{dayAppts.length - 3} more
                  </Typography>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}

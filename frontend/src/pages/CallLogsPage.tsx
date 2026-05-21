import { useState } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { callLogs as mockCallLogs } from '../data/mock';
import type { CallLog } from '../types';

const CHIP_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  booked: { bg: 'rgba(122, 158, 126, 0.1)', color: '#7A9E7E', label: '✓ Booked' },
  vip: { bg: 'rgba(123, 79, 110, 0.1)', color: '#7B4F6E', label: '♛ VIP' },
  new: { bg: 'rgba(79, 70, 229, 0.08)', color: '#4F46E5', label: '★ New' },
  pkg: { bg: 'rgba(184, 150, 90, 0.1)', color: '#B8965A', label: '🎁 Package' },
  followup: { bg: 'rgba(201, 132, 122, 0.1)', color: '#C9847A', label: '↻ Follow-up' },
};

export default function CallLogsPage() {
  const [callLogs] = useState<CallLog[]>(mockCallLogs);

  const handleExport = () => {
    const headers = 'Client,Duration,Time,Summary,Tags\n';
    const rows = callLogs.map(log => 
      `"${log.client}","${log.dur}","${log.time}","${log.summary.replace(/"/g, '""')}","${log.chips.join(', ')}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `glowassist_call_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ flex1: 1, overflowY: 'auto', p: 4, bgcolor: '#FAF8F5', minHeight: '100vh' }}>
      {/* Header Panel */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: '2rem', 
              fontWeight: 600, 
              color: '#2A1F1A',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            Call Logs
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {callLogs.length} interactions recorded
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleExport}
          sx={{ 
            borderRadius: 2.5, 
            fontSize: '0.78rem',
            borderColor: 'divider',
            color: 'text.secondary',
            textTransform: 'none',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(201, 132, 122, 0.04)',
            }
          }}
        >
          Export Logs
        </Button>
      </Box>

      {/* Call Log Cards */}
      <Box display="flex" flexDirection="column" gap={2}>
        {callLogs.map((log: CallLog, i: number) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3.5,
              cursor: 'pointer',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#C9847A',
                boxShadow: '0 6px 20px rgba(201, 132, 122, 0.08)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {/* Card Top Row */}
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box display="flex" alignItems="center" gap={1.25}>
                <AvatarSubtleIcon />
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1F1A' }}>
                  {log.client}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={2} sx={{ color: 'text.secondary' }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <AccessTimeIcon sx={{ fontSize: '0.82rem', color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                    {log.dur}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarTodayIcon sx={{ fontSize: '0.82rem', color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                    {log.time}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Summary details */}
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.82rem', 
                color: 'text.secondary', 
                lineHeight: 1.6, 
                mb: 2,
                fontFamily: "'Jost', sans-serif" 
              }}
            >
              {log.summary}
            </Typography>

            {/* Logs labels/chips tags */}
            <Box display="flex" gap={1} flexWrap="wrap">
              {log.chips.map((chip) => {
                const conf = CHIP_CONFIG[chip] || { bg: '#F4EFE8', color: '#666', label: chip };
                return (
                  <Chip 
                    key={chip} 
                    label={conf.label} 
                    size="small"
                    sx={{ 
                      bgcolor: conf.bg, 
                      color: conf.color, 
                      fontWeight: 600, 
                      fontSize: '0.65rem',
                      height: '22px',
                      '& .MuiChip-label': { px: 1.25 }
                    }}
                  />
                );
              })}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function AvatarSubtleIcon() {
  return (
    <Box 
      sx={{ 
        width: 32, 
        height: 32, 
        borderRadius: '50%', 
        bgcolor: 'rgba(201, 132, 122, 0.08)', 
        color: '#C9847A', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <CallIcon sx={{ fontSize: '0.95rem' }} />
    </Box>
  );
}

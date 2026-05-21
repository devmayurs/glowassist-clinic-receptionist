import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useDashboard } from '../hooks/useDashboard';
import KpiCardsGrid from './Dashboard/components/KpiCardsGrid';
import DashboardCharts from './Dashboard/components/DashboardCharts';
import UpcomingAppointmentsGrid from './Dashboard/components/UpcomingAppointmentsGrid';

export default function AnalyticsPage() {
  const { stats, loading, error, lastRefreshed, refreshStats } = useDashboard();

  return (
    <Box sx={{ flex1: 1, overflowY: 'auto', p: 4, bgcolor: '#FAF8F5' }}>
      {/* ── Header ── */}
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
            Dashboard
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            Last refreshed {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          onClick={refreshStats}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'primary.main' }} /> : <span>↻</span>}
          sx={{ 
            borderRadius: 2, 
            fontSize: '0.78rem',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(201, 132, 122, 0.04)',
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'rgba(211, 47, 47, 0.05)', border: '1px solid rgba(211, 47, 47, 0.2)' }}>
          <Typography variant="body2" sx={{ color: 'error.main', fontSize: '0.8rem' }}>
            ⚠️ {error}
          </Typography>
        </Box>
      )}

      {/* ── 7 KPI Cards Grid ── */}
      <KpiCardsGrid stats={stats} loading={loading} />

      {/* ── Visual Analytics Charts ── */}
      <DashboardCharts stats={stats} loading={loading} />

      {/* ── Upcoming Appointments ── */}
      <UpcomingAppointmentsGrid stats={stats} loading={loading} />
    </Box>
  );
}

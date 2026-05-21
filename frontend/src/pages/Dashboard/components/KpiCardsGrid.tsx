import { Card, CardContent, Typography, Box, Grid, Skeleton } from '@mui/material';

interface KpiCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'rose' | 'gold' | 'sage' | 'plum';
  loading?: boolean;
}

function KpiCard({ icon, label, value, sub, accent = 'rose', loading }: KpiCardProps) {
  // Luxury accent maps in hex codes
  const colors = {
    rose: {
      text: '#C9847A',
      border: 'rgba(201, 132, 122, 0.2)',
      bg: 'rgba(201, 132, 122, 0.04)',
    },
    gold: {
      text: '#B8965A',
      border: 'rgba(184, 150, 90, 0.2)',
      bg: 'rgba(184, 150, 90, 0.05)',
    },
    sage: {
      text: '#7A9E7E',
      border: 'rgba(122, 158, 126, 0.2)',
      bg: 'rgba(122, 158, 126, 0.05)',
    },
    plum: {
      text: '#7B4F6E',
      border: 'rgba(123, 79, 110, 0.2)',
      bg: 'rgba(123, 79, 110, 0.05)',
    },
  };

  const scheme = colors[accent] || colors.rose;

  return (
    <Card 
      sx={{ 
        borderColor: 'divider', 
        bgcolor: scheme.bg, 
        borderLeft: `4px solid ${scheme.text}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent sx={{ p: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
            {icon}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              letterSpacing: 1.5, 
              textTransform: 'uppercase', 
              color: 'text.secondary',
              fontSize: '0.62rem'
            }}
          >
            {label}
          </Typography>
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={36} width={120} sx={{ borderRadius: 1, my: 0.5 }} />
        ) : (
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              fontWeight: 600, 
              color: scheme.text,
              fontSize: '2.1rem',
              lineHeight: 1.1,
              my: 0.5
            }}
          >
            {value}
          </Typography>
        )}

        {sub && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', mt: 'auto', display: 'block' }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface KpiCardsGridProps {
  stats: any;
  loading: boolean;
}

export function KpiCardsGrid({ stats, loading }: KpiCardsGridProps) {
  const fmt = (n: number) => n ? n.toLocaleString('en-IN') : '0';
  
  const aiPercentage = stats && stats.totalAppointments 
    ? Math.round((stats.aiBookings / stats.totalAppointments) * 100) 
    : 0;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon="👥"
          label="Total Clients"
          value={stats ? fmt(stats.totalClients) : '—'}
          sub="Registered in CRM"
          accent="rose"
          loading={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon="📅"
          label="Total Appointments"
          value={stats ? fmt(stats.totalAppointments) : '—'}
          sub="All time records"
          accent="gold"
          loading={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon="✦"
          label="AI Bookings"
          value={stats ? fmt(stats.aiBookings) : '—'}
          sub="Via WhatsApp AI agent"
          accent="rose"
          loading={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon="👤"
          label="Manual Bookings"
          value={stats ? fmt(stats.manualBookings) : '—'}
          sub="Created by receptionist"
          accent="plum"
          loading={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon="💬"
          label="Live Chat Bookings"
          value={stats ? fmt(stats.liveChatBookings) : '—'}
          sub="Via human chat agents"
          accent="sage"
          loading={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon="💰"
          label="Total Revenue"
          value={stats ? `₹${fmt(stats.totalRevenue)}` : '—'}
          sub="From paid appointments"
          accent="gold"
          loading={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon="⏳"
          label="Pending Payments"
          value={stats ? fmt(stats.pendingPayments) : '—'}
          sub="Awaiting collection"
          accent="plum"
          loading={loading}
        />
      </Grid>

      {/* AI Performance Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #1C1410 0%, #3C2B22 100%)',
            color: '#FFFFFF',
            border: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(28, 20, 16, 0.25)',
              borderColor: 'transparent'
            }
          }}
        >
          <CardContent sx={{ p: '20px !important', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontFamily: "'Cormorant Garamond', serif", color: '#D4AF7A', fontSize: '0.9rem', lineHeight: 1 }}>
              ✦ AI Performance
            </Typography>

            {loading ? (
              <Skeleton variant="rectangular" height={36} width={80} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1, my: 0.5 }} />
            ) : (
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: "'Cormorant Garamond', serif", 
                  fontWeight: 600, 
                  color: '#FFFFFF',
                  fontSize: '2rem',
                  lineHeight: 1
                }}
              >
                {aiPercentage}%
              </Typography>
            )}

            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem', tracking: '0.5px' }}>
              Bookings automated by AI
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default KpiCardsGrid;

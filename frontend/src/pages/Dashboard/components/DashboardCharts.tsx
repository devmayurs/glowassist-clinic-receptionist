import { Paper, Typography, Box, Grid, CircularProgress } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const PIE_COLORS = ['#C9847A', '#B8965A', '#7A9E7E', '#7B4F6E'];
const SOURCE_LABELS: Record<string, string> = {
  whatsapp_ai: 'WhatsApp AI',
  live_chat: 'Live Chat',
  manual_crm: 'Manual CRM',
  walk_in: 'Walk-in',
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper 
        sx={{ 
          border: '1px solid', 
          borderColor: 'divider', 
          px: 1.5, 
          py: 1, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRadius: 2
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.78rem' }}>
          {SOURCE_LABELS[payload[0].name] || payload[0].name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.72rem', mt: 0.5 }}>
          {payload[0].value} bookings
        </Typography>
      </Paper>
    );
  }
  return null;
};

const weeklyRevenue = [
  { name: 'Mon', value: 12400 },
  { name: 'Tue', value: 19800 },
  { name: 'Wed', value: 15300 },
  { name: 'Thu', value: 22100 },
  { name: 'Fri', value: 18700 },
  { name: 'Sat', value: 25600 },
];

interface DashboardChartsProps {
  stats: any;
  loading: boolean;
}

export function DashboardCharts({ stats, loading }: DashboardChartsProps) {
  const pieData = (stats?.bookingSourceBreakdown || []).map((b: { source: string; count: number }) => ({
    name: b.source,
    value: b.count,
  }));

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Pie Chart — Booking Source Ratio */}
      <Grid item xs={12} md={6}>
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider', 
            boxShadow: 'none',
            '&:hover': {
              borderColor: '#C9847A',
              boxShadow: '0 4px 20px rgba(201, 132, 122, 0.04)',
            }
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              letterSpacing: 1.2, 
              textTransform: 'uppercase', 
              color: 'text.secondary', 
              mb: 3, 
              display: 'block' 
            }}
          >
            Booking Source Ratio
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={220}>
              <CircularProgress size={40} sx={{ color: 'primary.main' }} />
            </Box>
          ) : pieData.length > 0 ? (
            <Box height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_entry: any, index: number) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    formatter={(value) => SOURCE_LABELS[value] || value}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.72rem', color: '#8A7268' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={220}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No booking data yet
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Bar Chart — Weekly Revenue */}
      <Grid item xs={12} md={6}>
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider', 
            boxShadow: 'none',
            '&:hover': {
              borderColor: '#C9847A',
              boxShadow: '0 4px 20px rgba(201, 132, 122, 0.04)',
            }
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              letterSpacing: 1.2, 
              textTransform: 'uppercase', 
              color: 'text.secondary', 
              mb: 3, 
              display: 'block' 
            }}
          >
            Weekly Revenue Trend
          </Typography>
          
          <Box height={220}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenue} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8A7268' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#8A7268' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ fontSize: '0.78rem', borderRadius: '10px', border: '1px solid #E8DDD6' }}
                />
                <Bar dataKey="value" fill="#C9847A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default DashboardCharts;

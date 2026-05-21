import { useEffect, useState } from 'react';
import { Grid, Box, Typography } from '@mui/material';

type AnimatedStats = { calls: number; bookings: number; newClients: number; revenue: number };

export default function SidebarStats() {
  const [animated, setAnimated] = useState<AnimatedStats>({ calls: 0, bookings: 0, newClients: 0, revenue: 0 });

  useEffect(() => {
    const targets = { calls: 14, bookings: 7, newClients: 3, revenue: 23 } as const;
    const intervals: ReturnType<typeof setInterval>[] = [];

    (['calls', 'bookings', 'newClients', 'revenue'] as const).forEach((key) => {
      let v = 0;
      const target = targets[key];
      const iv = setInterval(() => {
        v++;
        setAnimated((prev) => ({ ...prev, [key]: v }));
        if (v >= target) clearInterval(iv);
      }, 70);
      intervals.push(iv);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  const statsItems = [
    { value: animated.calls, label: 'Calls Handled', color: '#C9847A' },
    { value: animated.bookings, label: 'Bookings', color: '#C9847A' },
    { value: animated.newClients, label: 'New Clients', color: '#C9847A' },
    { value: `$${animated.revenue * 300}`, label: 'Est. Revenue', color: '#B8965A' },
  ];

  return (
    <Grid container spacing={1}>
      {statsItems.map((item, idx) => (
        <Grid item xs={6} key={idx}>
          <Box 
            sx={{ 
              bgcolor: '#F4EFE8', // warm background
              borderRadius: 2, 
              p: 1.5, 
              textAlign: 'center', 
              border: '1px solid #E8DDD6',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: item.color,
                transform: 'translateY(-1px)',
              }
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontWeight: 600, 
                color: item.color,
                lineHeight: 1,
              }}
            >
              {item.value}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.62rem', 
                color: '#8A7268', 
                mt: 0.5, 
                display: 'block',
                fontWeight: 500,
                letterSpacing: '0.3px',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

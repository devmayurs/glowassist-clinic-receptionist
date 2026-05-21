import { Box, Paper, Typography } from '@mui/material';
import { useAppStore } from '../../store/useAppStore';

export default function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        zIndex: 1500, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1 
      }}
    >
      {toasts.map((t) => (
        <Paper
          key={t.id}
          className="animate-toastIn"
          sx={{
            bgcolor: '#1C1410', // deep background
            color: '#FFFFFF',
            px: 2,
            py: 1.5,
            borderRadius: '12px',
            maxWidth: 290,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            borderLeft: '4px solid #C9847A', // rose left-accent border
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: '0.79rem', fontWeight: 500, fontFamily: "'Jost', sans-serif" }}>
            {t.message}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

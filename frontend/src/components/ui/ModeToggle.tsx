import { Box, Button } from '@mui/material';
import { useAppStore } from '../../store/useAppStore';

export default function ModeToggle() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const addToast = useAppStore((s) => s.addToast);

  const toggle = (newMode: 'sim' | 'live') => {
    setMode(newMode);
    if (newMode === 'live') {
      addToast('🔴 Live AI — powered by Mayur API');
    }
  };

  return (
    <Box 
      sx={{ 
        ml: 'auto', 
        display: 'flex', 
        bgcolor: '#F4EFE8', // warm background
        borderRadius: '8px', 
        p: 0.25,
        border: '1px solid #E8DDD6',
      }}
    >
      <Button
        onClick={() => toggle('sim')}
        size="small"
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontFamily: "'Jost', sans-serif",
          textTransform: 'none',
          minWidth: 0,
          lineHeight: 1,
          bgcolor: mode === 'sim' ? '#FFFFFF' : 'transparent',
          color: mode === 'sim' ? '#C9847A' : '#8A7268',
          boxShadow: mode === 'sim' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
          '&:hover': {
            bgcolor: mode === 'sim' ? '#FFFFFF' : 'rgba(0,0,0,0.02)',
          },
        }}
      >
        Simulate
      </Button>
      <Button
        onClick={() => toggle('live')}
        size="small"
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontFamily: "'Jost', sans-serif",
          textTransform: 'none',
          minWidth: 0,
          lineHeight: 1,
          bgcolor: mode === 'live' ? '#FFFFFF' : 'transparent',
          color: mode === 'live' ? '#C9847A' : '#8A7268',
          boxShadow: mode === 'live' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
          '&:hover': {
            bgcolor: mode === 'live' ? '#FFFFFF' : 'rgba(0,0,0,0.02)',
          },
        }}
      >
        Live AI
      </Button>
    </Box>
  );
}

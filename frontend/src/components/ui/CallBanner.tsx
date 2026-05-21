import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '../../store/useAppStore';

export default function CallBanner() {
  const isCallActive = useAppStore((s) => s.isCallActive);
  const activeCall = useAppStore((s) => s.activeCall);
  const endCall = useAppStore((s) => s.endCall);
  const addToast = useAppStore((s) => s.addToast);
  const updateStats = useAppStore((s) => s.updateStats);

  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isCallActive && activeCall) {
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);

      // Auto-end call after 18 seconds (simulated)
      const timeout = setTimeout(() => {
        endCall();
        addToast('✦ Call ended — transcript & booking saved');
        updateStats({ callsHandled: useAppStore.getState().stats.callsHandled + 1 });
      }, 18000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearTimeout(timeout);
      };
    }
  }, [isCallActive, activeCall, endCall, addToast, updateStats]);

  if (!isCallActive || !activeCall) return null;

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <Box 
      sx={{ 
        background: 'linear-gradient(90deg, #1C1410 0%, #3D2B1F 100%)', 
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5, 
        borderBottom: '1px solid rgba(184, 150, 90, 0.3)', // gold/30
      }}
    >
      <Box 
        className="animate-callRing"
        sx={{ 
          width: 32, 
          height: 32, 
          borderRadius: '50%', 
          bgcolor: '#C9847A', // rose
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '1rem',
          flexShrink: 0,
        }}
      >
        📞
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.62rem', 
            color: 'rgba(255, 255, 255, 0.45)', 
            letterSpacing: '1px', 
            textTransform: 'uppercase',
            display: 'block',
          }}
        >
          Active Call — AI Handling
        </Typography>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: '#FFFFFF', 
            fontWeight: 600, 
            fontSize: '0.83rem',
          }}
        >
          Incoming: {activeCall.phone}
        </Typography>
      </Box>
      <Typography 
        id="ctimer"
        sx={{ 
          color: '#D4AF7A', 
          fontWeight: 'semibold', 
          fontSize: '0.875rem',
        }}
      >
        {formatTime(duration)}
      </Typography>
    </Box>
  );
}

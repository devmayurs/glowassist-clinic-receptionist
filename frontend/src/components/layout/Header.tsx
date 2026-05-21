import { AppBar, Toolbar, Box, Typography } from '@mui/material';

export default function Header() {
  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: '#1C1410', // deep background color
        height: '62px', 
        justifyContent: 'center',
        borderBottom: '1px solid rgba(184, 150, 90, 0.25)', // gold/25 border
        boxShadow: 'none',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Brand Logo & Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            sx={{ 
              width: 36, 
              height: 36, 
              border: '1px solid #B8965A', // gold
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#D4AF7A', // gold light
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            ✦
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              fontWeight: 600, 
              color: '#FFFFFF',
              letterSpacing: '0.5px',
            }}
          >
            Glow<Box component="em" sx={{ color: '#D4AF7A', fontStyle: 'italic', fontWeight: 'normal', mr: 0.5 }}>Assist</Box>AI
          </Typography>
        </Box>

        {/* Center Tagline */}
        <Typography 
          variant="caption" 
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            color: 'rgba(255, 255, 255, 0.4)', 
            letterSpacing: '2px', 
            textTransform: 'uppercase',
            fontSize: '0.72rem',
          }}
        >
          Lumière Med Spa · AI Concierge System
        </Typography>

        {/* Status Indicator */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            border: '1px solid rgba(184, 150, 90, 0.4)', 
            borderRadius: '16px', 
            px: 1.5, 
            py: 0.5, 
            fontSize: '0.68rem', 
            color: '#D4AF7A', 
            letterSpacing: '1px', 
            textTransform: 'uppercase', 
            fontWeight: 600,
          }}
        >
          <Box 
            className="animate-glow"
            sx={{ 
              width: 6, 
              height: 6, 
              bgcolor: '#D4AF7A', 
              borderRadius: '50%', 
            }} 
          />
          Live
        </Box>
      </Toolbar>
    </AppBar>
  );
}

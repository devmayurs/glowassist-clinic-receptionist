import { Box, Typography } from '@mui/material';
import SidebarStats from './SidebarStats';
import SidebarNav from './SidebarNav';
import ClientList from './ClientList';

export default function Sidebar() {
  return (
    <Box 
      component="aside"
      sx={{ 
        width: 250, 
        bgcolor: '#FFFFFF', 
        borderRight: '1px solid #E8DDD6', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid #E8DDD6' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.62rem', 
            fontWeight: 600, 
            letterSpacing: '2px', 
            textTransform: 'uppercase', 
            color: '#8A7268',
            mb: 1.5,
            display: 'block',
          }}
        >
          Today's Overview
        </Typography>
        <SidebarStats />
      </Box>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #E8DDD6' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.62rem', 
            fontWeight: 600, 
            letterSpacing: '2px', 
            textTransform: 'uppercase', 
            color: '#8A7268',
            mb: 1.5,
            display: 'block',
          }}
        >
          Menu
        </Typography>
        <SidebarNav />
      </Box>
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.62rem', 
            fontWeight: 600, 
            letterSpacing: '2px', 
            textTransform: 'uppercase', 
            color: '#8A7268',
            mb: 1.5,
            display: 'block',
          }}
        >
          Recent Clients
        </Typography>
        <ClientList />
      </Box>
    </Box>
  );
}

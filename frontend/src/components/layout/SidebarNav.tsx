import { Link, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemText, Box, Badge } from '@mui/material';

const navItems = [
  { path: '/appointments', icon: '📅', label: 'Appointments', badge: undefined },
  { path: '/calls',        icon: '📞', label: 'Call Logs',    badge: 4 },
  { path: '/analytics',   icon: '✦',  label: 'Dashboard',    badge: undefined },
  { path: '/clients',     icon: '👤', label: 'Clients',       badge: undefined },
  { path: '/packages',    icon: '🎁', label: 'Packages',      badge: undefined },
];

export default function SidebarNav() {
  const location = useLocation();

  return (
    <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <ListItem disablePadding key={item.path}>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                borderRadius: '8px',
                padding: '10px 12px',
                backgroundColor: isActive ? '#F9EDEB' : 'transparent',
                color: isActive ? '#C9847A' : '#8A7268',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive ? '#F9EDEB' : '#F4EFE8',
                },
              }}
            >
              <Box 
                sx={{ 
                  width: 24, 
                  textAlign: 'center', 
                  fontSize: '1rem', 
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </Box>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.2px',
                }}
              />
              {item.badge && (
                <Badge 
                  badgeContent={item.badge} 
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#C9847A',
                      color: '#FFFFFF',
                      fontSize: '0.62rem',
                      fontWeight: 'bold',
                      height: 18,
                      minWidth: 18,
                    }
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

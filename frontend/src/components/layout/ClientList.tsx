import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Box } from '@mui/material';
import { clients } from '../../data/mock';

export default function ClientList() {
  return (
    <List sx={{ p: 0, overflowY: 'auto' }}>
      {clients.map((c) => (
        <ListItem
          key={c.name}
          disablePadding
          sx={{
            mb: 0.5,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.15s',
            '&:hover': {
              bgcolor: '#F4EFE8', // warm background
            },
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%', 
              px: 1, 
              py: 0.8,
              gap: 1.5,
            }}
          >
            <ListItemAvatar sx={{ minWidth: 0, m: 0 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  bgcolor: c.bg,
                  color: c.tc,
                }}
              >
                {c.ini}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={c.name}
              secondary={c.last}
              primaryTypographyProps={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#2A1F1A',
                noWrap: true,
              }}
              secondaryTypographyProps={{
                fontSize: '0.68rem',
                color: '#8A7268',
                noWrap: true,
              }}
              sx={{ m: 0, minWidth: 0 }}
            />
            <Box 
              sx={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                bgcolor: c.status,
                flexShrink: 0,
              }} 
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

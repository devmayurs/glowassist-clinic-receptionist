import { Box, Typography, Button, Grid, Card, CardContent, Paper, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { packages as mockPackages } from '../data/mock';

export default function PackagesPage() {
  return (
    <Box sx={{ flex1: 1, overflowY: 'auto', p: 4, bgcolor: '#FAF8F5', minHeight: '100vh' }}>
      {/* Header Panel */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: '2rem', 
              fontWeight: 600, 
              color: '#2A1F1A',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            Memberships & Packages
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            Manage promotional packages and active memberships
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: 2.5, 
            fontSize: '0.78rem',
            bgcolor: '#C9847A',
            color: '#FFFFFF',
            textTransform: 'none',
            px: 2.5,
            py: 1,
            '&:hover': {
              bgcolor: '#B87369',
            }
          }}
        >
          New Package
        </Button>
      </Box>

      {/* Grid of Treatment Packages */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockPackages.map((pkg, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 4,
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#C9847A',
                  boxShadow: '0 8px 24px rgba(201, 132, 122, 0.06)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: "'Cormorant Garamond', serif", 
                      fontWeight: 700, 
                      color: '#2A1F1A',
                      fontSize: '1.2rem',
                      lineHeight: 1.2
                    }}
                  >
                    {pkg.name}
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#B8965A', 
                      fontSize: '0.95rem',
                      fontFamily: "'Cormorant Garamond', serif"
                    }}
                  >
                    {pkg.price}
                  </Typography>
                </Box>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontSize: '0.78rem', 
                    lineHeight: 1.6, 
                    mb: 3.5,
                    height: '42px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {pkg.includes}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#C9847A' }}>
                    <PeopleOutlineIcon sx={{ fontSize: '0.9rem' }} />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      {pkg.active} active clients
                    </Typography>
                  </Box>

                  <Chip
                    icon={<AutoAwesomeIcon sx={{ fontSize: '0.75rem !important', color: '#C9847A !important' }} />}
                    label="AI Promoted"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(201, 132, 122, 0.08)',
                      color: '#C9847A',
                      fontWeight: 700,
                      fontSize: '0.62rem',
                      height: '22px',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Promoted features highlight banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'rgba(184, 150, 90, 0.15)',
          background: 'linear-gradient(90deg, rgba(201, 132, 122, 0.05) 0%, rgba(184, 150, 90, 0.05) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <AutoAwesomeIcon sx={{ color: '#B8965A', fontSize: '1.2rem' }} />
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8rem', 
            color: '#5C4A3E', 
            fontWeight: 500,
            lineHeight: 1.5 
          }}
        >
          The AI assistant automatically detects when a client is booking their 3rd+ session and suggests the relevant package during checkout — seamlessly converting single bookings into recurring membership revenue.
        </Typography>
      </Paper>
    </Box>
  );
}

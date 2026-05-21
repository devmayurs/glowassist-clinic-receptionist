import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#C9847A', // rose
      light: '#E8A89F',
      dark: '#A65F55',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#B8965A', // gold
      light: '#D4AF7A',
      dark: '#8C6F35',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF8F5', // ivory
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2A1F1A', // deep brown
      secondary: '#8A7268', // muted brown
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: '#7A9E7E', // sage
    },
    divider: '#E8DDD6', // border
  },
  typography: {
    fontFamily: "'Jost', sans-serif",
    h1: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
      color: '#1C1410',
    },
    h2: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
      color: '#1C1410',
    },
    h3: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
      color: '#1C1410',
    },
    h4: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
      color: '#1C1410',
    },
    h5: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
      color: '#1C1410',
    },
    h6: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
      color: '#1C1410',
    },
    subtitle1: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: 500,
    },
    body1: {
      fontFamily: "'Jost', sans-serif",
      color: '#2A1F1A',
    },
    body2: {
      fontFamily: "'Jost', sans-serif",
      color: '#8A7268',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: '#C9847A',
          color: '#FFFFFF',
          '&:hover': {
            background: '#A65F55',
          },
        },
        outlinedPrimary: {
          borderColor: '#C9847A',
          color: '#C9847A',
          '&:hover': {
            borderColor: '#A65F55',
            background: 'rgba(201, 132, 122, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E8DDD6',
          boxShadow: 'none',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#C9847A',
            boxShadow: '0 4px 20px rgba(201, 132, 122, 0.08)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E8DDD6',
          padding: '14px 16px',
        },
        head: {
          fontWeight: 600,
          color: '#8A7268',
          background: '#FAF8F5',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          border: '1px solid #E8DDD6',
          boxShadow: '0 8px 32px rgba(28, 20, 16, 0.08)',
        },
      },
    },
  },
});

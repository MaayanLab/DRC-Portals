'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(51, 102, 153)',
      contrastText: '#FFF',
    },
    secondary: {
      main: '#7000FF', // Purple Accent
    },
    background: {
      default: '#070D1E', // Deep Navy Space
      paper: '#0F1A36',   // Dark Navy Card
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.2,
      '@media (min-width:600px)': {
        fontSize: '4.2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h6: {
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
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            borderColor: 'rgba(0, 210, 255, 0.4)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
  },
});

export default theme;
// src/styles/medglass-theme.js
import { createTheme } from '@mui/material/styles';

export const medglassTheme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#f59e0b', // Amber
    },
    background: {
      default: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
      paper: 'rgba(255, 255, 255, 0.8)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: `
            0 8px 32px 0 rgba(31, 38, 135, 0.07),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.5)
          `,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
        },
        outlined: {
          border: '2px solid',
          '&:hover': {
            border: '2px solid',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
  },
});
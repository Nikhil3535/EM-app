import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: '#8B5CF6', // Purple
    },

    secondary: {
      main: '#06B6D4', // Cyan
    },

    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },

    success: {
      main: '#10B981',
    },

    warning: {
      main: '#F59E0B',
    },
  },

  shape: {
    borderRadius: 16,
  },

  typography: {
    fontFamily:
      "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },

    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingLeft: 20,
          paddingRight: 20,
          boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: '#1E293B',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundImage: 'none',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background:
            'linear-gradient(90deg, #7C3AED, #2563EB)',
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#334155',
        },
      },
    },
  },
});

export default theme;
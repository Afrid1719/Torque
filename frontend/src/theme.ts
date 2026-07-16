import { createTheme } from '@mui/material/styles'

export const torqueTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0058be',
      dark: '#004191',
      light: '#2170e4',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#515f74',
    },
    success: {
      main: '#00855b',
      dark: '#006947',
    },
    error: {
      main: '#ba1a1a',
    },
    background: {
      default: '#f7f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#191c1e',
      secondary: '#424754',
    },
    divider: '#c2c6d6',
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    h4: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: 0,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.33,
      letterSpacing: 0,
    },
    button: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: 0,
      textTransform: 'none',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.33,
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
})

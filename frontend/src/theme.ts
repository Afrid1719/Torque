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
    allVariants: {
      letterSpacing: 0,
    },
    h4: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: '40px',
    },
    h5: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '32px',
    },
    h6: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '28px',
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    },
    subtitle1: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '18px',
    },
    caption: {
      fontSize: '11px',
      fontWeight: 500,
      lineHeight: '14px',
    },
    button: {
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '16px',
      textTransform: 'none',
    },
    overline: {
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '16px',
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
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: '14px',
          lineHeight: '20px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: '16px',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '11px',
          fontWeight: 500,
          lineHeight: '14px',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: '13px',
          fontWeight: 400,
          lineHeight: '18px',
        },
      },
    },
  },
})

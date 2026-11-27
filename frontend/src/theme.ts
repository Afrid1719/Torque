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
    fontFamily: '"Inter", sans-serif',
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
          boxShadow: 'none',
          minHeight: 40,
          paddingBottom: 6,
          paddingTop: 6,
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
        root: {
          color: '#191c1e',
        },
        input: {
          fontSize: '14px',
          lineHeight: '20px',
          '&::placeholder': {
            color: '#727785',
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#424754',
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: '16px',
          '&.Mui-focused': {
            color: '#0058be',
          },
          '&.Mui-error': {
            color: '#ba1a1a',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#424754',
          fontSize: '11px',
          fontWeight: 500,
          lineHeight: '14px',
          '&.Mui-error': {
            color: '#ba1a1a',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#424754',
          fontSize: '13px',
          fontWeight: 400,
          lineHeight: '18px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#c2c6d6',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#727785',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0058be',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ba1a1a',
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: '#727785',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#727785',
          '&:hover': {
            backgroundColor: 'rgba(33, 112, 228, 0.08)',
            color: '#191c1e',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#727785',
          '&.Mui-checked': {
            color: '#0058be',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#424754',
        },
      },
    },
  },
})

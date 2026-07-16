import { Box, Link, Paper, Stack } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

export type ServerState = 'checking' | 'connected' | 'disconnected'

export const LoginPageRoot = styled('main', {
  shouldForwardProp: (prop) => prop !== '$backgroundImage',
})<{ $backgroundImage: string }>(({ $backgroundImage, theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.palette.secondary.main,
  backgroundImage: `url(${$backgroundImage})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '100svh',
  overflow: 'auto',
  padding: theme.spacing(3),
  position: 'relative',
  '@media (max-width: 480px)': {
    padding: theme.spacing(2),
  },
  '@media (max-height: 760px)': {
    alignItems: 'flex-start',
  },
}))

export const LoginOverlay = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.text.primary, 0.48),
  inset: 0,
  position: 'absolute',
}))

export const LoginContent = styled(Stack)({
  maxWidth: 400,
  position: 'relative',
  width: '100%',
  zIndex: 1,
})

export const LoginPanel = styled(Paper)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.96),
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  '@media (max-width: 480px)': {
    padding: theme.spacing(3, 2.5),
  },
}))

export const BrandMark = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.dark, 0.25)}`,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  height: 64,
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  width: 64,
}))

export const DecorativeLink = styled(Link)(({ theme }) => ({
  alignItems: 'center',
  display: 'inline-flex',
  fontSize: theme.typography.button.fontSize,
  fontWeight: theme.typography.button.fontWeight,
  gap: theme.spacing(0.5),
  lineHeight: theme.typography.button.lineHeight,
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
}))

export const ServerStatus = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$state',
})<{ $state: ServerState }>(({ theme }) => ({
  alignItems: 'center',
  color: alpha(theme.palette.common.white, 0.8),
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'center',
  minHeight: 20,
  textShadow: `0 1px 2px ${alpha(theme.palette.text.primary, 0.6)}`,
  textTransform: 'uppercase',
}))

export const ServerStatusDot = styled('span', {
  shouldForwardProp: (prop) => prop !== '$state',
})<{ $state: ServerState }>(({ $state, theme }) => {
  const color =
    $state === 'connected'
      ? theme.palette.success.dark
      : $state === 'disconnected'
        ? theme.palette.error.main
        : theme.palette.divider

  return {
    backgroundColor: color,
    borderRadius: '50%',
    boxShadow: `0 0 0 4px ${alpha(color, 0.22)}`,
    height: 8,
    width: 8,
  }
})

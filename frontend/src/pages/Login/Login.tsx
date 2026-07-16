import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { ApiError } from '@app/api/client'
import { getBackendHealth } from '@app/api/health'
import workshopImage from '@app/assets/workshop-login.webp'
import { useAuth } from '@app/hooks/useAuth'
import {
  BrandMark,
  DecorativeLink,
  LoginBackground,
  LoginContent,
  LoginOverlay,
  LoginPageRoot,
  LoginPanel,
  ServerStatus,
  ServerStatusDot,
  type ServerState,
} from './Login.styles'

type FieldErrors = {
  username?: string
  password?: string
}

function preventDecorativeNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, status } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [requestError, setRequestError] = useState<string | null>(null)
  const [serverState, setServerState] = useState<ServerState>('checking')

  useEffect(() => {
    if (status !== 'unauthenticated') return

    let isCurrent = true

    getBackendHealth()
      .then(() => {
        if (isCurrent) setServerState('connected')
      })
      .catch(() => {
        if (isCurrent) setServerState('disconnected')
      })

    return () => {
      isCurrent = false
    }
  }, [status])

  if (status === 'initializing') return null

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedUsername = username.trim()
    const nextErrors: FieldErrors = {}

    if (!normalizedUsername) nextErrors.username = 'Username is required.'
    if (!password) nextErrors.password = 'Password is required.'

    setFieldErrors(nextErrors)
    setRequestError(null)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      await login({
        username: normalizedUsername,
        password,
        rememberMe,
      })
      navigate('/', { replace: true })
    } catch (error) {
      setRequestError(
        error instanceof ApiError
          ? error.message
          : 'Unable to sign in. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const serverLabel =
    serverState === 'checking'
      ? 'Connecting to server'
      : serverState === 'connected'
        ? 'Server connected'
        : 'Server unavailable'

  return (
    <LoginPageRoot>
      <LoginBackground
        alt=""
        aria-hidden="true"
        data-testid="login-background"
        src={workshopImage}
      />
      <LoginOverlay />

      <LoginContent spacing={2.5}>
        <LoginPanel elevation={18}>
          <Stack spacing={3}>
            <Stack
              spacing={0.75}
              sx={{ alignItems: 'center', textAlign: 'center' }}
            >
              <BrandMark>
                <PrecisionManufacturingIcon aria-hidden fontSize="large" />
              </BrandMark>
              <Typography color="primary" component="h1" variant="h4">
                TORQUE
              </Typography>
              <Typography sx={{ color: 'text.secondary' }} variant="overline">
                Service Management System
              </Typography>
            </Stack>

            <Stack
              component="form"
              noValidate
              onSubmit={handleSubmit}
              spacing={2}
            >
              {requestError && (
                <Alert severity="error" variant="outlined">
                  {requestError}
                </Alert>
              )}

              <TextField
                autoComplete="username"
                disabled={isSubmitting}
                error={Boolean(fieldErrors.username)}
                fullWidth
                helperText={fieldErrors.username}
                id="username"
                label="Username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                value={username}
              />

              <TextField
                autoComplete="current-password"
                disabled={isSubmitting}
                error={Boolean(fieldErrors.password)}
                fullWidth
                helperText={fieldErrors.password}
                id="password"
                label="Password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                        >
                          <IconButton
                            aria-label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
                            edge="end"
                            onClick={() =>
                              setShowPassword((visible) => !visible)
                            }
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOffOutlinedIcon fontSize="small" />
                            ) : (
                              <VisibilityOutlinedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
                type={showPassword ? 'text' : 'password'}
                value={password}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    disabled={isSubmitting}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    size="small"
                  />
                }
                label="Remember this device for 30 days"
                sx={{
                  alignSelf: 'flex-start',
                  color: 'text.secondary',
                  m: 0,
                }}
              />

              <Button
                disabled={isSubmitting}
                endIcon={
                  isSubmitting ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : (
                    <LoginOutlinedIcon />
                  )
                }
                fullWidth
                type="submit"
                variant="contained"
              >
                {isSubmitting ? 'Signing in' : 'Access Platform'}
              </Button>
            </Stack>

            <Divider />

            <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }} variant="subtitle1">
                Authorized Personnel Only
              </Typography>
              <Stack
                direction="row"
                divider={<Divider flexItem orientation="vertical" />}
                spacing={2}
              >
                <DecorativeLink
                  color="text.secondary"
                  href="#"
                  onClick={preventDecorativeNavigation}
                  underline="none"
                >
                  <HelpOutlineOutlinedIcon fontSize="small" />
                  Support
                </DecorativeLink>
                <DecorativeLink
                  color="text.secondary"
                  href="#"
                  onClick={preventDecorativeNavigation}
                  underline="none"
                >
                  <ShieldOutlinedIcon fontSize="small" />
                  Security
                </DecorativeLink>
              </Stack>
            </Stack>
          </Stack>
        </LoginPanel>

        <ServerStatus $state={serverState} aria-live="polite" role="status">
          <ServerStatusDot $state={serverState} />
          <Typography component="span" variant="caption">
            {serverLabel}
          </Typography>
        </ServerStatus>
      </LoginContent>
    </LoginPageRoot>
  )
}

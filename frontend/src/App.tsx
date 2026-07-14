import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'

import type { BackendHealthResponse } from './api/health'
import { getBackendHealth } from './api/health'
import './App.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e',
    },
    background: {
      default: '#f7f8fb',
    },
  },
  shape: {
    borderRadius: 8,
  },
})

type RequestState = 'loading' | 'success' | 'error'

function App() {
  const [requestState, setRequestState] = useState<RequestState>('loading')
  const [health, setHealth] = useState<BackendHealthResponse | null>(null)

  const loadHealth = useCallback(async () => {
    setRequestState('loading')

    try {
      const response = await getBackendHealth()
      setHealth(response)
      setRequestState('success')
    } catch {
      setHealth(null)
      setRequestState('error')
    }
  }, [])

  useEffect(() => {
    void loadHealth()
  }, [loadHealth])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box component="main" className="status-page">
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography component="h1" variant="h4">
                System Status
              </Typography>
              <Typography color="text.secondary">
                Temporary health check for TORQUE frontend and backend connectivity.
              </Typography>
            </Stack>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={3}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{
                      alignItems: { sm: 'center' },
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography component="h2" variant="h6">
                        Backend API
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        GET /api/v1/health
                      </Typography>
                    </Box>

                    <Button
                      disabled={requestState === 'loading'}
                      onClick={loadHealth}
                      variant="outlined"
                    >
                      Refresh
                    </Button>
                  </Stack>

                  <Divider />

                  {requestState === 'loading' && (
                    <Alert
                      icon={<CircularProgress size={22} />}
                      severity="info"
                      variant="outlined"
                    >
                      Checking backend health...
                    </Alert>
                  )}

                  {requestState === 'success' && health && (
                    <Alert
                      severity="success"
                      variant="outlined"
                    >
                      <Stack spacing={1}>
                        <Typography sx={{ fontWeight: 600 }}>
                          Backend API is reachable.
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          sx={{ flexWrap: 'wrap' }}
                        >
                          <Chip label={`status: ${health.status}`} color="success" size="small" />
                          <Chip label={`service: ${health.service}`} size="small" />
                        </Stack>
                      </Stack>
                    </Alert>
                  )}

                  {requestState === 'error' && (
                    <Alert
                      severity="error"
                      variant="outlined"
                    >
                      Backend API is unavailable. Confirm the FastAPI server is running and
                      VITE_API_BASE_URL points to the backend origin.
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App

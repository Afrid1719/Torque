import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { BrowserRouter } from 'react-router'

import { AuthProvider } from '@app/contexts/AuthProvider'
import { AppRoutes } from '@app/routes/AppRoutes'
import { torqueTheme } from '@app/theme'

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 5 * 60 * 1000 },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={torqueTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

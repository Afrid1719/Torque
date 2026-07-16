import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter } from 'react-router'

import { AuthProvider } from '@app/contexts/AuthProvider'
import { AppRoutes } from '@app/routes/AppRoutes'
import { torqueTheme } from '@app/theme'

function App() {
  return (
    <ThemeProvider theme={torqueTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/useAuth'
import { LoginPage } from './features/auth/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { torqueTheme } from './theme'

function ProtectedDashboard() {
  const { accessToken } = useAuth()

  return accessToken ? <DashboardPage /> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedDashboard />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<Navigate to="/" replace />} path="*" />
    </Routes>
  )
}

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

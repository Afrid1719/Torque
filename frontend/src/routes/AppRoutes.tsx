import { Navigate, Route, Routes } from 'react-router'

import { ProtectedDashboard } from '@app/components/auth/ProtectedDashboard'
import { LoginPage } from '@app/pages/Login/Login'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedDashboard />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<Navigate to="/" replace />} path="*" />
    </Routes>
  )
}

import { Navigate, Route, Routes } from 'react-router'

import { LoginPage } from '../pages/Login/Login'
import { ProtectedDashboard } from './ProtectedDashboard'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedDashboard />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<Navigate to="/" replace />} path="*" />
    </Routes>
  )
}

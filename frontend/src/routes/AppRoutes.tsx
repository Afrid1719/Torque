import { Navigate, Route, Routes } from 'react-router'

import { ProtectedRoute } from '@app/contexts/ProtectedRoute'
import { DashboardPage } from '@app/pages/DashboardPage'
import { LoginPage } from '@app/pages/Login/Login'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardPage />} path="/" />
      </Route>
      <Route element={<Navigate to="/" replace />} path="*" />
    </Routes>
  )
}

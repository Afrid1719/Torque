import { Navigate } from 'react-router'

import { useAuth } from '../hooks/useAuth'
import { DashboardPage } from '../pages/DashboardPage'

export function ProtectedDashboard() {
  const { accessToken } = useAuth()

  return accessToken ? <DashboardPage /> : <Navigate to="/login" replace />
}

import { Navigate } from 'react-router'

import { useAuth } from '@app/hooks/useAuth'
import { DashboardPage } from '@app/pages/DashboardPage'

export function ProtectedDashboard() {
  const { accessToken } = useAuth()

  return accessToken ? <DashboardPage /> : <Navigate to="/login" replace />
}

import { Navigate, Outlet, useLocation } from 'react-router'

import type { RoleName } from '@app/api/auth'
import { useAuth } from '@app/hooks/useAuth'

type ProtectedRouteProps = {
  allowedRoles?: readonly RoleName[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { hasRole, status } = useAuth()

  if (status === 'initializing') return null

  if (status === 'unauthenticated') {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate replace to="/" />
  }

  return <Outlet />
}

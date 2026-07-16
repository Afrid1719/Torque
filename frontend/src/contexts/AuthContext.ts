import { createContext } from 'react'

import type { CurrentUser, LoginCredentials, RoleName } from '@app/api/auth'

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  accessToken: string | null
  status: AuthStatus
  user: CurrentUser | null
  hasRole: (allowedRoles: readonly RoleName[]) => boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

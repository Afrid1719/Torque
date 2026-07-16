import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  restoreAuthSession,
  type CurrentUser,
  type LoginCredentials,
  type RoleName,
} from '@app/api/auth'
import { AuthContext, type AuthStatus } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('initializing')

  useEffect(() => {
    let isCurrent = true

    restoreAuthSession()
      .then((session) => {
        if (!isCurrent) return
        setAccessToken(session.accessToken)
        setUser(session.user)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!isCurrent) return
        setAccessToken(null)
        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginUser(credentials)
    const currentUser = await getCurrentUser(response.access_token)

    setAccessToken(response.access_token)
    setUser(currentUser)
    setStatus('authenticated')
  }, [])

  const hasRole = useCallback(
    (allowedRoles: readonly RoleName[]) =>
      user !== null && allowedRoles.includes(user.role.name),
    [user],
  )

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch {
      // Local authentication state must be cleared even when logout cannot reach the API.
    }

    setAccessToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo(
    () => ({ accessToken, status, user, hasRole, login, logout }),
    [accessToken, status, user, hasRole, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { loginUser, type LoginCredentials } from '@app/api/auth'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginUser(credentials)
    setAccessToken(response.access_token)
  }, [])

  const value = useMemo(() => ({ accessToken, login }), [accessToken, login])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

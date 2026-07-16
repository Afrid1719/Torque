import { createContext } from 'react'

import type { LoginCredentials } from '../api/auth'

export type AuthContextValue = {
  accessToken: string | null
  login: (credentials: LoginCredentials) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

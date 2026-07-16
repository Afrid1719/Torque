import { postJson, requestJson } from '@app/api/client'
import { API_V1_PREFIX } from '@app/api/constants'

export type RoleName = 'workshop_manager' | 'service_advisor' | 'mechanic'

export type CurrentUserRole = {
  id: number
  name: RoleName
  display_name: string
}

export type CurrentUser = {
  id: number
  username: string
  role: CurrentUserRole
}

export type LoginCredentials = {
  username: string
  password: string
  rememberMe: boolean
}

export type LoginResponse = {
  access_token: string
  token_type: 'bearer'
  expires_in: number
}

export type AuthSession = {
  accessToken: string
  user: CurrentUser
}

type LoginRequest = {
  username: string
  password: string
  remember_me: boolean
}

export function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return postJson<LoginResponse, LoginRequest>(`${API_V1_PREFIX}/auth/login`, {
    username: credentials.username,
    password: credentials.password,
    remember_me: credentials.rememberMe,
  })
}

export function refreshUserSession(): Promise<LoginResponse> {
  return requestJson<LoginResponse>(`${API_V1_PREFIX}/auth/refresh`, {
    method: 'POST',
  })
}

export function logoutUser(): Promise<void> {
  return requestJson<void>(`${API_V1_PREFIX}/auth/logout`, {
    method: 'POST',
  })
}

export function getCurrentUser(accessToken: string): Promise<CurrentUser> {
  return requestJson<CurrentUser>(`${API_V1_PREFIX}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

async function requestSessionRestore(): Promise<AuthSession> {
  const response = await refreshUserSession()
  const user = await getCurrentUser(response.access_token)

  return { accessToken: response.access_token, user }
}

let pendingSessionRestore: Promise<AuthSession> | null = null

export function restoreAuthSession(): Promise<AuthSession> {
  if (!pendingSessionRestore) {
    pendingSessionRestore = requestSessionRestore().finally(() => {
      pendingSessionRestore = null
    })
  }

  return pendingSessionRestore
}

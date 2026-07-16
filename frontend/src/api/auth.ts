import { postJson } from './client'

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

type LoginRequest = {
  username: string
  password: string
  remember_me: boolean
}

export function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return postJson<LoginResponse, LoginRequest>('/api/v1/auth/login', {
    username: credentials.username,
    password: credentials.password,
    remember_me: credentials.rememberMe,
  })
}

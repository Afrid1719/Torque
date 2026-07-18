import { postJson, requestJson } from './client'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  restoreAuthSession,
} from './auth'

jest.mock('./client', () => ({ postJson: jest.fn(), requestJson: jest.fn() }))

it('uses the expected authentication contracts', async () => {
  jest.mocked(postJson).mockResolvedValue({} as never)
  jest.mocked(requestJson).mockResolvedValue({} as never)
  await loginUser({ username: 'advisor', password: 'secret', rememberMe: true })
  expect(postJson).toHaveBeenCalledWith('/api/v1/auth/login', {
    username: 'advisor',
    password: 'secret',
    remember_me: true,
  })
  await getCurrentUser('token')
  expect(requestJson).toHaveBeenCalledWith('/api/v1/auth/me', {
    headers: { Authorization: 'Bearer token' },
  })
  await refreshUserSession()
  await logoutUser()
  expect(requestJson).toHaveBeenCalledWith('/api/v1/auth/logout', {
    method: 'POST',
  })
})

it('deduplicates concurrent session restoration', async () => {
  jest
    .mocked(requestJson)
    .mockResolvedValueOnce({
      access_token: 'token',
      token_type: 'bearer',
      expires_in: 1,
    } as never)
    .mockResolvedValueOnce({
      id: 1,
      username: 'manager',
      role: { id: 1, name: 'workshop_manager', display_name: 'Manager' },
    } as never)
  const first = restoreAuthSession()
  expect(restoreAuthSession()).toBe(first)
  await expect(first).resolves.toEqual(
    expect.objectContaining({ accessToken: 'token' }),
  )
})

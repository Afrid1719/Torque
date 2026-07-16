import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '@app/hooks/useAuth'
import { AuthProvider } from './AuthProvider'

function jsonResponse(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response
}

function noContentResponse(): Response {
  return {
    ok: true,
    status: 204,
    json: vi.fn(),
  } as unknown as Response
}

function AuthProbe() {
  const { accessToken, logout, status, user } = useAuth()

  return (
    <>
      <span>{status}</span>
      <span>{user?.username ?? 'no user'}</span>
      <span>{accessToken ? 'token present' : 'no token'}</span>
      <button onClick={() => void logout()} type="button">
        Test logout
      </button>
    </>
  )
}

function sessionFetch(logoutFails = false) {
  return vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input)

    if (url.endsWith('/api/v1/auth/refresh')) {
      return Promise.resolve(
        jsonResponse({
          access_token: 'signed-access-token',
          token_type: 'bearer',
          expires_in: 1800,
        }),
      )
    }
    if (url.endsWith('/api/v1/auth/me')) {
      return Promise.resolve(
        jsonResponse({
          id: 1,
          username: 'dev_manager',
          role: {
            id: 1,
            name: 'workshop_manager',
            display_name: 'Workshop Manager',
          },
        }),
      )
    }
    if (url.endsWith('/api/v1/auth/logout')) {
      return logoutFails
        ? Promise.reject(new Error('offline'))
        : Promise.resolve(noContentResponse())
    }

    return Promise.reject(new Error(`Unexpected request: ${url}`))
  })
}

describe('AuthProvider logout', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls the logout endpoint and clears all local authentication state', async () => {
    const fetchMock = sessionFetch()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    expect(await screen.findByText('dev_manager')).toBeTruthy()
    expect(screen.getByText('token present')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Test logout' }))

    expect(await screen.findByText('unauthenticated')).toBeTruthy()
    expect(screen.getByText('no user')).toBeTruthy()
    expect(screen.getByText('no token')).toBeTruthy()

    const logoutCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/api/v1/auth/logout'),
    )
    expect(logoutCall?.[1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
    })
  })

  it('clears local authentication state when the logout request fails', async () => {
    vi.stubGlobal('fetch', sessionFetch(true))

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    expect(await screen.findByText('dev_manager')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Test logout' }))

    expect(await screen.findByText('unauthenticated')).toBeTruthy()
    expect(screen.getByText('no user')).toBeTruthy()
    expect(screen.getByText('no token')).toBeTruthy()
  })
})

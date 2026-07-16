import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '@app/App'

function jsonResponse(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response
}

function healthResponse(): Response {
  return jsonResponse({ status: 'ok', service: 'torque-api' })
}

function loginResponse(): Response {
  return jsonResponse({
    access_token: 'signed-access-token',
    token_type: 'bearer',
    expires_in: 1800,
  })
}

function noContentResponse(): Response {
  return {
    ok: true,
    status: 204,
    json: vi.fn(),
  } as unknown as Response
}

function currentUserResponse(
  role:
    'workshop_manager' | 'service_advisor' | 'mechanic' = 'workshop_manager',
): Response {
  return jsonResponse({
    id: 1,
    username: 'dev_manager',
    role: {
      id: 1,
      name: role,
      display_name: 'Workshop Manager',
    },
  })
}

type FetchResponses = {
  login?: Response
  me?: Response
  refresh?: Response
}

function routeFetch(responses: FetchResponses = {}) {
  return vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input)

    if (url.endsWith('/api/v1/health')) return Promise.resolve(healthResponse())
    if (url.endsWith('/api/v1/auth/refresh')) {
      return Promise.resolve(
        responses.refresh ??
          jsonResponse({ detail: 'Could not refresh session.' }, 401),
      )
    }
    if (url.endsWith('/api/v1/auth/login')) {
      return Promise.resolve(responses.login ?? loginResponse())
    }
    if (url.endsWith('/api/v1/auth/me')) {
      return Promise.resolve(responses.me ?? currentUserResponse())
    }
    if (url.endsWith('/api/v1/auth/logout')) {
      return Promise.resolve(noContentResponse())
    }

    return Promise.reject(new Error(`Unexpected request: ${url}`))
  })
}

function enterCredentials() {
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: ' dev_manager ' },
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'test-password' },
  })
}

describe('App login flow', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/login')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the approved username login design and connected server state', async () => {
    vi.stubGlobal('fetch', routeFetch())

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'TORQUE' })).toBeTruthy()
    expect(
      screen.getByTestId('login-background').getAttribute('src'),
    ).toContain('workshop-login.webp')
    expect(screen.getByLabelText('Username')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(
      screen.getByLabelText('Remember this device for 30 days'),
    ).toBeTruthy()
    expect(screen.queryByText('Forgot Password?')).toBeNull()
    expect(screen.getByRole('link', { name: 'Support' }).className).toContain(
      'MuiLink-underlineNone',
    )
    expect(screen.getByRole('link', { name: 'Security' }).className).toContain(
      'MuiLink-underlineNone',
    )
    expect(await screen.findByText('Server connected')).toBeTruthy()
  })

  it('makes one health request when StrictMode remounts the login effect', async () => {
    const fetchMock = routeFetch()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )

    expect(await screen.findByText('Server connected')).toBeTruthy()
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith('/api/v1/health'),
      ),
    ).toHaveLength(1)
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith('/api/v1/auth/refresh'),
      ),
    ).toHaveLength(1)
  })

  it('validates both required fields before making a login request', async () => {
    const fetchMock = routeFetch()
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await screen.findByText('Server connected')
    fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))

    expect(await screen.findByText('Username is required.')).toBeTruthy()
    expect(screen.getByText('Password is required.')).toBeTruthy()
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith('/api/v1/auth/login'),
      ),
    ).toHaveLength(0)
  })

  it('toggles password visibility accessibly', async () => {
    vi.stubGlobal('fetch', routeFetch())
    render(<App />)

    const password = (await screen.findByLabelText(
      'Password',
    )) as HTMLInputElement
    expect(password.type).toBe('password')

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password.type).toBe('text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy()
  })

  it('submits the remembered login contract and redirects to the dashboard', async () => {
    const fetchMock = routeFetch()
    vi.stubGlobal('fetch', fetchMock)
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem')

    render(<App />)
    await screen.findByText('Server connected')
    enterCredentials()
    fireEvent.click(screen.getByLabelText('Remember this device for 30 days'))
    fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeTruthy()
    expect(window.location.pathname).toBe('/')

    const loginCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/api/v1/auth/login'),
    )
    expect(loginCall?.[1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username: 'dev_manager',
        password: 'test-password',
        remember_me: true,
      }),
    })
    const meCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/api/v1/auth/me'),
    )
    expect(meCall?.[1]).toMatchObject({
      credentials: 'include',
      headers: expect.objectContaining({
        Authorization: 'Bearer signed-access-token',
      }),
    })
    expect(localStorageSpy).not.toHaveBeenCalled()
  })

  it('shows a meaningful backend authentication error', async () => {
    vi.stubGlobal(
      'fetch',
      routeFetch({
        login: jsonResponse({ detail: 'Invalid username or password.' }, 401),
      }),
    )

    render(<App />)
    await screen.findByText('Server connected')
    enterCredentials()
    fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))

    expect(
      await screen.findByText('Invalid username or password.'),
    ).toBeTruthy()
    expect(window.location.pathname).toBe('/login')
  })

  it('disables the form and displays progress while login is pending', async () => {
    let resolveLogin: ((response: Response) => void) | undefined
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/api/v1/health'))
        return Promise.resolve(healthResponse())
      if (url.endsWith('/api/v1/auth/refresh')) {
        return Promise.resolve(
          jsonResponse({ detail: 'Could not refresh session.' }, 401),
        )
      }
      if (url.endsWith('/api/v1/auth/me')) {
        return Promise.resolve(currentUserResponse())
      }
      return new Promise<Response>((resolve) => {
        resolveLogin = resolve
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await screen.findByText('Server connected')
    enterCredentials()
    fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))

    expect(
      (await screen.findByRole('button', {
        name: /Signing in/i,
      })) as HTMLButtonElement,
    ).toHaveProperty('disabled', true)
    expect(screen.getByLabelText('Username')).toHaveProperty('disabled', true)

    resolveLogin?.(loginResponse())
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeTruthy()
  })

  it('reports a disconnected server without hiding the login form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    render(<App />)

    expect(await screen.findByText('Server unavailable')).toBeTruthy()
    expect(screen.getByLabelText('Username')).toBeTruthy()
  })

  it('redirects unauthenticated root navigation to login', async () => {
    window.history.replaceState({}, '', '/')
    vi.stubGlobal('fetch', routeFetch())

    render(<App />)

    expect(await screen.findByLabelText('Username')).toBeTruthy()
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('restores a remembered session and current role before showing a protected route', async () => {
    window.history.replaceState({}, '', '/')
    const fetchMock = routeFetch({ refresh: loginResponse() })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeTruthy()
    expect(screen.queryByLabelText('Username')).toBeNull()

    const refreshCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/api/v1/auth/refresh'),
    )
    expect(refreshCall?.[1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
    })
    const meCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/api/v1/auth/me'),
    )
    expect(meCall?.[1]).toMatchObject({
      headers: expect.objectContaining({
        Authorization: 'Bearer signed-access-token',
      }),
    })
  })

  it('returns to login when the refreshed access token cannot load the current user', async () => {
    window.history.replaceState({}, '', '/')
    vi.stubGlobal(
      'fetch',
      routeFetch({
        refresh: loginResponse(),
        me: jsonResponse({ detail: 'Could not validate credentials.' }, 401),
      }),
    )

    render(<App />)

    expect(await screen.findByLabelText('Username')).toBeTruthy()
    expect(window.location.pathname).toBe('/login')
  })

  it('renders the authenticated header and sidebar with routed placeholders', async () => {
    window.history.replaceState({}, '', '/')
    vi.stubGlobal('fetch', routeFetch({ refresh: loginResponse() }))

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeTruthy()
    expect(screen.getByText('Dev Manager')).toBeTruthy()
    expect(screen.getByText('Workshop Manager')).toBeTruthy()
    expect(screen.getByPlaceholderText(/Search registration/)).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Vehicles' }))

    expect(
      await screen.findByRole('heading', { name: 'Vehicles' }),
    ).toBeTruthy()
    expect(window.location.pathname).toBe('/vehicles')
  })

  it('logs out from the sidebar and prevents stale authenticated content', async () => {
    window.history.replaceState({}, '', '/')
    const fetchMock = routeFetch({ refresh: loginResponse() })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(await screen.findByText('Dev Manager')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(await screen.findByLabelText('Username')).toBeTruthy()
    expect(window.location.pathname).toBe('/login')
    expect(screen.queryByText('Dev Manager')).toBeNull()

    const logoutCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/api/v1/auth/logout'),
    )
    expect(logoutCall?.[1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
    })
  })
})

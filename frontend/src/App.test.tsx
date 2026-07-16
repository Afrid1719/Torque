import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'

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

function routeFetch(authResponse: Response = loginResponse()) {
  return vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input)

    if (url.endsWith('/api/v1/health')) return Promise.resolve(healthResponse())
    if (url.endsWith('/api/v1/auth/login')) return Promise.resolve(authResponse)

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

    expect(screen.getByRole('heading', { name: 'TORQUE' })).toBeTruthy()
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

  it('validates both required fields before making a login request', async () => {
    const fetchMock = routeFetch()
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await screen.findByText('Server connected')
    fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))

    expect(await screen.findByText('Username is required.')).toBeTruthy()
    expect(screen.getByText('Password is required.')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('toggles password visibility accessibly', async () => {
    vi.stubGlobal('fetch', routeFetch())
    render(<App />)

    const password = screen.getByLabelText('Password') as HTMLInputElement
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
    expect(localStorageSpy).not.toHaveBeenCalled()
  })

  it('shows a meaningful backend authentication error', async () => {
    vi.stubGlobal(
      'fetch',
      routeFetch(
        jsonResponse({ detail: 'Invalid username or password.' }, 401),
      ),
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
})

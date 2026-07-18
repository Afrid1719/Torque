import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
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

function customerResponse(): Response {
  return jsonResponse({
    address: null,
    created_at: '2026-07-19T00:00:00Z',
    email: 'john@mail.com',
    id: 44,
    mobile_number: '1234567890',
    name: 'John',
    notes: 'Prefers morning appointments.',
    updated_at: '2026-07-19T00:00:00Z',
  })
}

type FetchResponses = {
  customer?: Response
  customerCreate?: Response | Promise<Response>
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
    if (url.endsWith('/api/v1/customers') && responses.customerCreate) {
      return Promise.resolve(responses.customerCreate)
    }
    if (url.includes('/api/v1/customers/')) {
      return Promise.resolve(responses.customer ?? customerResponse())
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
    cleanup()
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
      await screen.findByRole(
        'heading',
        { name: 'Dashboard' },
        { timeout: 5_000 },
      ),
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
  }, 10_000)

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
  }, 10_000)

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
      await screen.findByRole(
        'heading',
        { name: 'Dashboard' },
        { timeout: 5_000 },
      ),
    ).toBeTruthy()
  }, 10_000)

  it('reports a disconnected server without hiding the login form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    render(<App />)

    expect(await screen.findByText('Server unavailable')).toBeTruthy()
    expect(screen.getByLabelText('Username')).toBeTruthy()
  }, 10_000)

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

  it('renders the approved add-customer default state for authorized staff', async () => {
    window.history.replaceState({}, '', '/customers/new')
    vi.stubGlobal('fetch', routeFetch({ refresh: loginResponse() }))

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Add Customer' }),
    ).toBeTruthy()
    expect(screen.getByLabelText(/Customer Name/)).toHaveProperty(
      'required',
      true,
    )
    expect(screen.getByLabelText(/Mobile Number/)).toHaveProperty(
      'required',
      true,
    )
    expect(screen.getByLabelText('Email (Optional)')).toBeTruthy()
    expect(screen.getByLabelText('Address (Optional)')).toBeTruthy()
    expect(screen.getByLabelText('Internal Notes (Optional)')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create Customer' })).toBeTruthy()
    expect(screen.getByText('Data Privacy')).toBeTruthy()
    expect(window.location.pathname).toBe('/customers/new')
  }, 10_000)

  it('renders a newly created customer profile from navigation state', async () => {
    window.history.replaceState(
      {
        usr: {
          customer: {
            email: 'john@mail.com',
            mobileNumber: '1234567890',
            name: 'John',
            notes: 'Prefers morning appointments.',
          },
        },
      },
      '',
      '/customers/new-customer',
    )
    const fetchMock = routeFetch({ refresh: loginResponse() })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )

    expect(await screen.findByRole('heading', { name: 'John' })).toBeTruthy()
    expect(screen.getByText('1234567890')).toBeTruthy()
    expect(screen.getByText('john@mail.com')).toBeTruthy()
    expect(screen.getByText('Prefers morning appointments.')).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'No vehicles registered' }),
    ).toBeTruthy()
    expect(screen.getByText('No service history yet')).toBeTruthy()
    expect(window.location.pathname).toBe('/customers/new-customer')
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.filter(([url]) =>
          String(url).includes('/api/v1/customers/'),
        ),
      ).toHaveLength(1),
    )
  })

  it('redirects mechanics away from customer creation', async () => {
    window.history.replaceState({}, '', '/customers/new')
    vi.stubGlobal(
      'fetch',
      routeFetch({
        refresh: loginResponse(),
        me: currentUserResponse('mechanic'),
      }),
    )

    render(<App />)

    await waitFor(() => expect(window.location.pathname).toBe('/'))
    expect(screen.queryByRole('heading', { name: 'Add Customer' })).toBeNull()
  }, 10_000)

  it('shows consistent inline validation for required customer fields', async () => {
    window.history.replaceState({}, '', '/customers/new')
    vi.stubGlobal('fetch', routeFetch({ refresh: loginResponse() }))

    render(<App />)

    const nameInput = await screen.findByLabelText(/Customer Name/)
    fireEvent.change(nameInput, { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

    expect(screen.getByText('Customer name is required.')).toBeTruthy()
    expect(screen.getByText('Mobile number is required.')).toBeTruthy()
    expect(document.activeElement).toBe(nameInput)
    expect(screen.queryByRole('status')).toBeNull()

    fireEvent.change(nameInput, { target: { value: 'John' } })
    expect(screen.queryByText('Customer name is required.')).toBeNull()
  }, 10_000)

  it('validates customer contact formats before showing the loading state', async () => {
    window.history.replaceState({}, '', '/customers/new')
    vi.stubGlobal('fetch', routeFetch({ refresh: loginResponse() }))

    render(<App />)

    fireEvent.change(await screen.findByLabelText(/Customer Name/), {
      target: { value: 'John' },
    })
    const mobileInput = screen.getByLabelText(/Mobile Number/)
    fireEvent.change(mobileInput, { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText('Email (Optional)'), {
      target: { value: 'john@invalid' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

    expect(
      screen.getByText(
        'Enter a valid mobile number containing 7 to 15 digits.',
      ),
    ).toBeTruthy()
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy()
    expect(document.activeElement).toBe(mobileInput)
    expect(screen.queryByRole('status')).toBeNull()
  }, 10_000)

  it('shows duplicate mobile API errors on the mobile field', async () => {
    window.history.replaceState({}, '', '/customers/new')
    vi.stubGlobal(
      'fetch',
      routeFetch({
        customerCreate: jsonResponse(
          { detail: 'A customer with this mobile number already exists.' },
          409,
        ),
        refresh: loginResponse(),
      }),
    )

    render(<App />)

    fireEvent.change(await screen.findByLabelText(/Customer Name/), {
      target: { value: 'John' },
    })
    const mobileInput = screen.getByLabelText(/Mobile Number/)
    fireEvent.change(mobileInput, { target: { value: '1234567890' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

    expect(
      await screen.findByText(
        'A customer with this mobile number already exists.',
      ),
    ).toBeTruthy()
    expect(mobileInput.getAttribute('aria-invalid')).toBe('true')
    expect(screen.queryByRole('status')).toBeNull()
  }, 10_000)

  it('shows the top loading state and disables the customer form', async () => {
    window.history.replaceState({}, '', '/customers/new')
    vi.stubGlobal(
      'fetch',
      routeFetch({
        customerCreate: new Promise<Response>(() => undefined),
        refresh: loginResponse(),
      }),
    )

    render(<App />)

    fireEvent.change(await screen.findByLabelText(/Customer Name/), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText(/Mobile Number/), {
      target: { value: '1234567890' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

    expect((await screen.findByRole('status')).textContent).toContain(
      'REGISTERING CUSTOMER...',
    )
    expect(
      screen.getByLabelText('Customer registration in progress'),
    ).toBeTruthy()
    expect(screen.getByLabelText(/Customer Name/)).toHaveProperty(
      'disabled',
      true,
    )
    expect(screen.getByLabelText(/Mobile Number/)).toHaveProperty(
      'disabled',
      true,
    )
    expect(screen.getByLabelText('Email (Optional)')).toHaveProperty(
      'disabled',
      true,
    )
    expect(screen.getByLabelText('Address (Optional)')).toHaveProperty(
      'disabled',
      true,
    )
    expect(screen.getByLabelText('Internal Notes (Optional)')).toHaveProperty(
      'disabled',
      true,
    )
    expect(
      screen.getByRole('button', { name: 'Creating Customer...' }),
    ).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveProperty(
      'disabled',
      true,
    )
  }, 20_000)

  it('shows the customer success state without actions after loading', async () => {
    window.history.replaceState({}, '', '/customers/new')
    const fetchMock = routeFetch({
      customerCreate: customerResponse(),
      refresh: loginResponse(),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    fireEvent.change(await screen.findByLabelText(/Customer Name/), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText(/Mobile Number/), {
      target: { value: '1234567890' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

    expect(
      await screen.findByText(
        'Customer Profile Created Successfully',
        {},
        {
          timeout: 2_000,
        },
      ),
    ).toBeTruthy()
    expect(screen.getByText('John')).toBeTruthy()
    expect(screen.getByText('1234567890')).toBeTruthy()
    expect(
      screen.getByText(
        'You will be redirected to the customer profile in 5 seconds.',
      ),
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'View Customer Profile' }),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: 'Add Vehicle' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Go to Dashboard' })).toBeNull()
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith('/api/v1/customers'),
      ),
    ).toHaveLength(1)
    const customerCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/api/v1/customers'),
    )
    expect(customerCall?.[1]).toMatchObject({
      headers: {
        Authorization: 'Bearer signed-access-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(JSON.parse(String(customerCall?.[1]?.body))).toEqual({
      address: null,
      email: null,
      mobile_number: '1234567890',
      name: 'John',
      notes: null,
    })
  }, 20_000)

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

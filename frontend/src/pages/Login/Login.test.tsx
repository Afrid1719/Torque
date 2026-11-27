import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ApiError } from '@app/api/client'
import { getBackendHealth } from '../../api/health'
import { useAuth } from '../../hooks/useAuth'
import { LoginPage } from './Login'

jest.mock('../../api/health', () => ({ getBackendHealth: jest.fn() }))
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }))

const login = jest.fn()

beforeEach(() => {
  login.mockReset()
  jest
    .mocked(getBackendHealth)
    .mockResolvedValue({ status: 'ok', service: 'torque-api' })
  jest
    .mocked(useAuth)
    .mockReturnValue({ login, status: 'unauthenticated' } as never)
})

it('validates and submits credentials', async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))
  expect(await screen.findByText('Username is required.')).toBeInTheDocument()
  expect(await screen.findByText('Password is required.')).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: ' advisor ' },
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'secret' },
  })
  fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))
  await waitFor(() =>
    expect(login).toHaveBeenCalledWith({
      username: 'advisor',
      password: 'secret',
      rememberMe: false,
    }),
  )
})

it('toggles password visibility and submits the remember-me choice', async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
  const password = screen.getByLabelText('Password')
  expect(password).toHaveAttribute('type', 'password')
  fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
  expect(password).toHaveAttribute('type', 'text')
  fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
  expect(password).toHaveAttribute('type', 'password')
  fireEvent.click(
    screen.getByRole('checkbox', { name: /Remember this device/i }),
  )
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: 'advisor' },
  })
  fireEvent.change(password, { target: { value: 'secret' } })
  fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))

  await waitFor(() =>
    expect(login).toHaveBeenCalledWith({
      username: 'advisor',
      password: 'secret',
      rememberMe: true,
    }),
  )
})

it('reports backend connectivity', async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
  expect(await screen.findByText('Server connected')).toBeInTheDocument()
})

it('reports when the backend cannot be reached', async () => {
  jest.mocked(getBackendHealth).mockRejectedValue(new Error('offline'))
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Server unavailable')).toBeInTheDocument()
})

it.each([
  [
    new ApiError('Invalid credentials.', 401, 'authentication_failed'),
    'Invalid credentials.',
  ],
  [new Error('Unexpected error'), 'Unable to sign in. Please try again.'],
])('shows a login request error', async (error, message) => {
  login.mockRejectedValue(error)
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: 'advisor' },
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'secret' },
  })
  fireEvent.click(screen.getByRole('button', { name: /Access Platform/i }))

  expect(await screen.findByText(message)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Access Platform/i })).toBeEnabled()
})

it('renders nothing while auth initializes and redirects authenticated users', () => {
  jest.mocked(useAuth).mockReturnValue({
    login,
    status: 'initializing',
  } as never)
  const { rerender, container } = render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<div>Application home</div>} path="/" />
      </Routes>
    </MemoryRouter>,
  )
  expect(container).toBeEmptyDOMElement()
  expect(getBackendHealth).not.toHaveBeenCalled()

  jest.mocked(useAuth).mockReturnValue({
    login,
    status: 'authenticated',
  } as never)
  rerender(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<div>Application home</div>} path="/" />
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByText('Application home')).toBeInTheDocument()
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { getBackendHealth } from '../../api/health'
import { useAuth } from '../../hooks/useAuth'
import { LoginPage } from './Login'

jest.mock('../../api/health', () => ({ getBackendHealth: jest.fn() }))
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }))

const login = jest.fn()

beforeEach(() => {
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

it('reports backend connectivity', async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
  expect(await screen.findByText('Server connected')).toBeInTheDocument()
})

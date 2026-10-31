import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { AppShell } from './AppShell'

jest.mock('../hooks/useAuth', () => ({ useAuth: jest.fn() }))

const logout = jest.fn()

function renderShell(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="*" element={<div>Page content</div>} />
        </Route>
        <Route path="/login" element={<div>Login destination</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  logout.mockReset().mockResolvedValue(undefined)
})

it('renders navigation, the current user, and nested content', () => {
  jest.mocked(useAuth).mockReturnValue({
    logout,
    user: {
      id: 1,
      username: 'dev_manager',
      role: {
        id: 1,
        name: 'workshop_manager',
        display_name: 'Workshop Manager',
      },
    },
  } as never)
  renderShell()
  expect(screen.getByText('Dev Manager')).toBeInTheDocument()
  expect(screen.getAllByText('Customers').length).toBeGreaterThan(0)
  expect(screen.getByText('Page content')).toBeInTheDocument()
})

it('uses a default profile label when the user has not loaded', () => {
  jest.mocked(useAuth).mockReturnValue({ logout, user: null } as never)

  renderShell('/customers/44')

  expect(screen.getByLabelText('User profile')).toHaveTextContent('T')
})

it('logs out and navigates to the login page', async () => {
  jest.mocked(useAuth).mockReturnValue({
    logout,
    user: {
      id: 1,
      username: 'dev_manager',
      role: {
        id: 1,
        name: 'workshop_manager',
        display_name: 'Workshop Manager',
      },
    },
  } as never)

  renderShell()
  fireEvent.click(screen.getAllByText('Logout')[0]!)

  await waitFor(() => expect(logout).toHaveBeenCalledTimes(1))
  expect(await screen.findByText('Login destination')).toBeInTheDocument()
})

it('keeps support navigation on the current page', () => {
  jest.mocked(useAuth).mockReturnValue({ logout, user: null } as never)
  renderShell()

  fireEvent.click(screen.getAllByText('Support')[0]!)

  expect(screen.getByText('Page content')).toBeInTheDocument()
})

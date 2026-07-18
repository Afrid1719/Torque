import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { AppShell } from './AppShell'

jest.mock('../hooks/useAuth', () => ({ useAuth: jest.fn() }))

it('renders navigation, the current user, and nested content', () => {
  jest
    .mocked(useAuth)
    .mockReturnValue({
      logout: jest.fn(),
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
  render(
    <MemoryRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<div>Page content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByText('Dev Manager')).toBeInTheDocument()
  expect(screen.getAllByText('Customers').length).toBeGreaterThan(0)
  expect(screen.getByText('Page content')).toBeInTheDocument()
})

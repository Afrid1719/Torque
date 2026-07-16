import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import type { CurrentUser, RoleName } from '@app/api/auth'
import { AuthContext, type AuthContextValue } from '@app/contexts/AuthContext'
import { ProtectedRoute } from '@app/contexts/ProtectedRoute'

const workshopManager: CurrentUser = {
  id: 1,
  username: 'dev_manager',
  role: {
    id: 1,
    name: 'workshop_manager',
    display_name: 'Workshop Manager',
  },
}

function contextValue(
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue {
  const user = overrides.user === undefined ? workshopManager : overrides.user

  return {
    accessToken: 'signed-access-token',
    status: 'authenticated',
    user,
    hasRole: (roles: readonly RoleName[]) =>
      user !== null && roles.includes(user.role.name),
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  }
}

function CurrentPath() {
  return <span>{useLocation().pathname}</span>
}

function renderProtectedRoute(
  value: AuthContextValue,
  allowedRoles?: readonly RoleName[],
) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/restricted']}>
        <CurrentPath />
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route
              element={<span>{value.user?.role.name} content</span>}
              path="/restricted"
            />
          </Route>
          <Route element={<span>Login page</span>} path="/login" />
          <Route element={<span>Dashboard</span>} path="/" />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('waits for authentication initialization before rendering or redirecting', () => {
    renderProtectedRoute(
      contextValue({
        accessToken: null,
        status: 'initializing',
        user: null,
      }),
    )

    expect(screen.queryByText('Login page')).toBeNull()
    expect(screen.queryByText(/content/)).toBeNull()
  })

  it('redirects an unauthenticated user to login', async () => {
    renderProtectedRoute(
      contextValue({
        accessToken: null,
        status: 'unauthenticated',
        user: null,
      }),
    )

    expect(await screen.findByText('Login page')).toBeTruthy()
    await waitFor(() => expect(screen.getByText('/login')).toBeTruthy())
  })

  it('renders a protected route and exposes the authenticated role', () => {
    renderProtectedRoute(contextValue(), ['workshop_manager'])

    expect(screen.getByText('workshop_manager content')).toBeTruthy()
  })

  it('redirects a user with the wrong role without clearing authentication', async () => {
    const value = contextValue()
    renderProtectedRoute(value, ['mechanic'])

    expect(await screen.findByText('Dashboard')).toBeTruthy()
    expect(value.status).toBe('authenticated')
    expect(value.user).toBe(workshopManager)
    await waitFor(() => expect(screen.getByText('/')).toBeTruthy())
  })
})

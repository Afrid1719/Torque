import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from './AppRoutes'

jest.mock('../contexts/ProtectedRoute', () => ({
  ProtectedRoute: () => {
    const { Outlet } = jest.requireActual('react-router')
    return <Outlet />
  },
}))
jest.mock('../layouts/AppShell', () => ({
  AppShell: () => {
    const { Outlet } = jest.requireActual('react-router')
    return <Outlet />
  },
}))
jest.mock('../pages/Login/Login', () => ({
  LoginPage: () => <div>Login route</div>,
}))
jest.mock('../pages/DashboardPage', () => ({
  DashboardPage: () => <div>Dashboard route</div>,
}))
jest.mock('../pages/Customers/AddCustomerPage', () => ({
  AddCustomerPage: () => <div>Add customer route</div>,
}))
jest.mock('../pages/Customers/CustomerProfilePage', () => ({
  CustomerProfilePage: () => <div>Customer profile route</div>,
}))

it.each([
  ['/login', 'Login route'],
  ['/', 'Dashboard route'],
  ['/customers/new', 'Add customer route'],
  ['/customers/44', 'Customer profile route'],
])('routes %s to its page', (path, content) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
  expect(screen.getByText(content)).toBeInTheDocument()
})

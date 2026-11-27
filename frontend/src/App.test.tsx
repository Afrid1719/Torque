import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import App from './App'

jest.mock('./routes/AppRoutes', () => ({
  AppRoutes: () => <div>Application routes</div>,
}))
jest.mock('./contexts/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}))

it('renders the application providers and routes', () => {
  render(<App />)
  expect(screen.getByText('Application routes')).toBeInTheDocument()
})

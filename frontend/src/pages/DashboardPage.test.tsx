import { render, screen } from '@testing-library/react'
import { DashboardPage } from './DashboardPage'

it('renders the dashboard placeholder', () => {
  render(<DashboardPage />)
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
})

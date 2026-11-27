import { render, screen } from '@testing-library/react'
import { CustomerStats } from './CustomerStats'

it('renders customer activity statistics', () => {
  render(<CustomerStats />)
  expect(screen.getByText('Total Visits')).toBeInTheDocument()
  expect(screen.getByText('Total Spend')).toBeInTheDocument()
  expect(screen.getByText('No vehicles registered')).toBeInTheDocument()
})

it('shows the registered vehicle count', () => {
  render(<CustomerStats vehiclesCount={2} />)

  expect(screen.getByText('2')).toBeInTheDocument()
  expect(screen.getByText('2 vehicles registered')).toBeInTheDocument()
})

import { render, screen } from '@testing-library/react'
import { CustomerStats } from './CustomerStats'

it('renders customer activity statistics', () => {
  render(<CustomerStats />)
  expect(screen.getByText('Total Visits')).toBeInTheDocument()
  expect(screen.getByText('Total Spend')).toBeInTheDocument()
  expect(screen.getByText('No vehicles registered')).toBeInTheDocument()
})

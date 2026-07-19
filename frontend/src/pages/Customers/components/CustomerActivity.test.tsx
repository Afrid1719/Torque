import { render, screen } from '@testing-library/react'
import { CustomerActivity } from './CustomerActivity'

it('renders empty activity and customer notes', () => {
  render(<CustomerActivity notes="Morning appointments" />)
  expect(screen.getByText('No vehicles registered')).toBeInTheDocument()
  expect(screen.getByText('Morning appointments')).toBeInTheDocument()
  expect(screen.getByText('No service history yet')).toBeInTheDocument()
})

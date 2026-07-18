import { render, screen } from '@testing-library/react'
import { PlaceholderPage } from './PlaceholderPage'

it('renders its route title', () => {
  render(<PlaceholderPage title="Customers" />)
  expect(screen.getByRole('heading', { name: 'Customers' })).toBeInTheDocument()
})

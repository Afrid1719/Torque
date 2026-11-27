import { render, screen } from '@testing-library/react'
import { CustomerListSummary } from './CustomerListSummary'

it('shows the available customer total and unavailable future metrics', () => {
  render(<CustomerListSummary customerCount={12} />)

  expect(screen.getByText('Total Clients')).toBeInTheDocument()
  expect(screen.getByText('12')).toBeInTheDocument()
  expect(screen.getAllByText('Not available')).toHaveLength(2)
})

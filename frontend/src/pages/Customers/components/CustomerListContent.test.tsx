import { fireEvent, render, screen } from '@testing-library/react'
import { CustomerListContent } from './CustomerListContent'

const customer = {
  address: null,
  created_at: '2026-09-17T00:00:00Z',
  email: null,
  id: 44,
  mobile_number: '9876543210',
  name: 'Asha Rao',
  notes: null,
  updated_at: '2026-09-17T00:00:00Z',
}

const baseProps = {
  customers: [customer],
  error: null,
  isLoading: false,
  onSelect: jest.fn(),
  search: '',
}

describe('CustomerListContent', () => {
  it('shows customer names and mobile numbers and opens the selected profile', () => {
    render(<CustomerListContent {...baseProps} />)

    expect(screen.getByText('Asha Rao')).toBeInTheDocument()
    expect(screen.getByText('9876543210')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'View profile' }))
    expect(baseProps.onSelect).toHaveBeenCalledWith(44)
  })

  it('shows distinct empty states for an empty list and an empty search', () => {
    const { rerender } = render(
      <CustomerListContent {...baseProps} customers={[]} />,
    )
    expect(screen.getByText('No customers yet')).toBeInTheDocument()

    rerender(
      <CustomerListContent {...baseProps} customers={[]} search="Asha" />,
    )
    expect(screen.getByText('No matching customers')).toBeInTheDocument()
  })

  it('shows loading and error states', () => {
    const { rerender } = render(
      <CustomerListContent {...baseProps} isLoading />,
    )
    expect(screen.getByLabelText('Loading customers')).toBeInTheDocument()

    rerender(
      <CustomerListContent {...baseProps} error="Unable to load customers." />,
    )
    expect(screen.getByText('Unable to load customers.')).toBeInTheDocument()
  })
})

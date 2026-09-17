import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { useAuth } from '@app/hooks/useAuth'
import { CustomerListPage } from './CustomerListPage'

jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }))
jest.mock('@app/hooks/useAuth', () => ({ useAuth: jest.fn() }))

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

beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValue({
    data: [customer],
    error: null,
    isPending: false,
  } as never)
})

it('renders the customer list and accepts a name or mobile search value', () => {
  render(
    <MemoryRouter>
      <CustomerListPage />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { name: 'Customers' })).toBeInTheDocument()
  expect(screen.getByText('Asha Rao')).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Search customers'), {
    target: { value: '98765' },
  })
  expect(screen.getByLabelText('Search customers')).toHaveValue('98765')
  return waitFor(() =>
    expect(jest.mocked(useQuery)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryKey: ['customers', 'list', '98765'],
      }),
    ),
  )
})

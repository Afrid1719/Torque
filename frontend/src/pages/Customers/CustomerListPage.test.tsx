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
  const searchInput = screen.getByRole('textbox', {
    name: 'Search customers',
  })
  fireEvent.change(searchInput, {
    target: { value: '98765' },
  })
  expect(searchInput).toHaveValue('98765')
  return waitFor(() =>
    expect(jest.mocked(useQuery)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryKey: ['customers', 'list', '98765'],
      }),
    ),
  )
})

it('exports the currently loaded customer list as CSV', () => {
  const createObjectUrl = jest.fn(() => 'blob:customers')
  const revokeObjectUrl = jest.fn()
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation()
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectUrl,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectUrl,
  })

  render(
    <MemoryRouter>
      <CustomerListPage />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Export List' }))

  expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob))
  expect(click).toHaveBeenCalled()
  expect(revokeObjectUrl).toHaveBeenCalledWith('blob:customers')
  click.mockRestore()
})

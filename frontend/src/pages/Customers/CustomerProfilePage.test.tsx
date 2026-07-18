import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { CustomerProfilePage } from './CustomerProfilePage'

jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }))
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }))

it('renders fetched customer details', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValue({
    data: {
      address: null,
      email: 'john@mail.com',
      id: 44,
      mobile_number: '123',
      name: 'John',
      notes: null,
    },
    error: null,
    isPending: false,
  } as never)
  render(
    <MemoryRouter initialEntries={['/customers/44']}>
      <Routes>
        <Route
          path="/customers/:customerId"
          element={<CustomerProfilePage />}
        />
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'John' })).toBeInTheDocument()
  expect(screen.getByText('john@mail.com')).toBeInTheDocument()
})

it('shows the loading state before customer data arrives', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest
    .mocked(useQuery)
    .mockReturnValue({ data: undefined, error: null, isPending: true } as never)
  render(
    <MemoryRouter initialEntries={['/customers/44']}>
      <Routes>
        <Route
          path="/customers/:customerId"
          element={<CustomerProfilePage />}
        />
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByText('Loading customer profile...')).toBeInTheDocument()
})

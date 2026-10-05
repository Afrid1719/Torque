import { fireEvent, render, screen } from '@testing-library/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '@app/hooks/useAuth'
import { CustomerEditPage } from './CustomerEditPage'

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}))
jest.mock('@app/hooks/useAuth', () => ({ useAuth: jest.fn() }))

const customer = {
  address: '14 Market Road',
  created_at: '2026-09-01T12:00:00Z',
  email: 'asha@example.com',
  id: 23,
  mobile_number: '+919876543210',
  name: 'Asha Rao',
  notes: 'Prefers WhatsApp',
  updated_at: '2026-09-01T12:00:00Z',
}

beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest
    .mocked(useQuery)
    .mockReturnValue({ data: customer, error: null, isPending: false } as never)
  jest.mocked(useMutation).mockReturnValue({
    isPending: false,
    mutateAsync: jest.fn(),
  } as never)
  jest
    .mocked(useQueryClient)
    .mockReturnValue({ setQueryData: jest.fn() } as never)
})

it('preloads the customer fields and validates required fields before saving', () => {
  render(
    <MemoryRouter initialEntries={['/customers/23/edit']}>
      <Routes>
        <Route
          path="/customers/:customerId/edit"
          element={<CustomerEditPage />}
        />
      </Routes>
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: 'Edit Customer Profile' }),
  ).toBeInTheDocument()
  const nameField = screen.getByRole('textbox', { name: /customer name/i })
  expect(nameField).toHaveValue('Asha Rao')
  expect(screen.getByRole('textbox', { name: /mobile number/i })).toHaveValue(
    '+919876543210',
  )
  expect(screen.getByRole('textbox', { name: /address/i })).toHaveValue(
    '14 Market Road',
  )

  fireEvent.change(nameField, { target: { value: ' ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  expect(screen.getByText('Customer name is required.')).toBeInTheDocument()
  expect(
    jest.mocked(useMutation).mock.results[0]?.value.mutateAsync,
  ).not.toHaveBeenCalled()
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ApiError } from '@app/api/client'
import { useAuth } from '@app/hooks/useAuth'
import { CustomerEditPage } from './CustomerEditPage'

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}))
jest.mock('@app/hooks/useAuth', () => ({ useAuth: jest.fn() }))

const mutateAsync = jest.fn()

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
    .mockReset()
    .mockReturnValue({ data: customer, error: null, isPending: false } as never)
  mutateAsync.mockReset().mockResolvedValue(customer)
  jest.mocked(useMutation).mockReturnValue({
    isPending: false,
    mutateAsync,
  } as never)
  jest
    .mocked(useQueryClient)
    .mockReturnValue({ setQueryData: jest.fn() } as never)
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/customers/23/edit']}>
      <Routes>
        <Route
          path="/customers/:customerId/edit"
          element={<CustomerEditPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

it('preloads the customer fields and validates required fields before saving', () => {
  renderPage()

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

it('shows loading and customer-fetch error states', () => {
  jest.mocked(useQuery).mockReturnValueOnce({
    data: undefined,
    error: null,
    isPending: true,
  } as never)
  renderPage()
  expect(screen.getByText('Loading customer details...')).toBeInTheDocument()

  jest.mocked(useQuery).mockReturnValueOnce({
    data: undefined,
    error: new ApiError('Customer not found.', 404, 'request_failed'),
    isPending: false,
  } as never)
  renderPage()
  expect(screen.getByText('Customer not found.')).toBeInTheDocument()
})

it('shows a fallback error when the customer query returns no data', () => {
  jest.mocked(useQuery).mockReturnValueOnce({
    data: undefined,
    error: null,
    isPending: false,
  } as never)

  renderPage()

  expect(
    screen.getByText('Unable to load the customer details.'),
  ).toBeInTheDocument()
})

it('submits trimmed values and converts optional blanks to null', async () => {
  renderPage()
  fireEvent.change(screen.getByRole('textbox', { name: /customer name/i }), {
    target: { value: '  Asha Rao  ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /mobile number/i }), {
    target: { value: ' +919876543210 ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
    target: { value: '  ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /address/i }), {
    target: { value: '  ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /workshop notes/i }), {
    target: { value: '  ' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  await waitFor(() => {
    expect(mutateAsync).toHaveBeenCalledWith({
      address: null,
      email: null,
      mobile_number: '+919876543210',
      name: 'Asha Rao',
      notes: null,
    })
  })
})

it('clears field validation errors when corrected and submits', async () => {
  renderPage()
  const emailField = screen.getByRole('textbox', { name: /email/i })
  fireEvent.change(emailField, { target: { value: 'not-an-email' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  expect(mutateAsync).not.toHaveBeenCalled()

  fireEvent.change(emailField, { target: { value: 'asha@newmail.com' } })
  expect(
    screen.queryByText('Enter a valid email address.'),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  await waitFor(() => {
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'asha@newmail.com' }),
    )
  })
})

it('shows a conflict as a mobile validation error and clears it on edit', async () => {
  mutateAsync.mockRejectedValue(
    new ApiError('Mobile number already exists.', 409, 'request_failed'),
  )
  renderPage()
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  expect(
    await screen.findByText('Mobile number already exists.'),
  ).toBeInTheDocument()
  fireEvent.change(screen.getByRole('textbox', { name: /mobile number/i }), {
    target: { value: '+919876543211' },
  })
  expect(
    screen.queryByText('Mobile number already exists.'),
  ).not.toBeInTheDocument()
})

it.each([
  [
    new ApiError('Update service unavailable.', 503, 'server_error'),
    'Update service unavailable.',
  ],
  [
    new Error('Unexpected error'),
    'Unable to update the customer. Please try again.',
  ],
])('shows an update request error', async (error, message) => {
  mutateAsync.mockRejectedValue(error)
  renderPage()
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  expect(await screen.findByText(message)).toBeInTheDocument()
})

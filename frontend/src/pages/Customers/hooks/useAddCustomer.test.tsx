import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { ApiError } from '@app/api/client'
import { createCustomer } from '@app/api/customers'
import { useAuth } from '@app/hooks/useAuth'
import { CustomerForm } from '@app/pages/Customers/components/CustomerForm'
import { useAddCustomer } from './useAddCustomer'

jest.mock('@app/api/customers', () => ({
  createCustomer: jest.fn(),
  customerQueryKey: (customerId: number | string) => [
    'customer',
    String(customerId),
  ],
}))
jest.mock('@app/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

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

function CustomerFormHarness() {
  const flow = useAddCustomer()
  return (
    <>
      <CustomerForm
        {...flow}
        onCancel={() => undefined}
        onSubmit={flow.handleSubmit}
      />
      <output>{flow.flowState}</output>
    </>
  )
}

function HookWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

function ProfileDestination() {
  const location = useLocation()
  const state = location.state as { customer?: { name?: string } } | null
  return <div>Customer profile {state?.customer?.name}</div>
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/add']}>
        <Routes>
          <Route path="/add" element={children} />
          <Route
            path="/customers/:customerId"
            element={<ProfileDestination />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByRole('textbox', { name: /customer name/i }), {
    target: { value: '  Asha Rao  ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /mobile number/i }), {
    target: { value: ' +919876543210 ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
    target: { value: ' asha@example.com ' },
  })
}

beforeEach(() => {
  queryClient.clear()
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
})

afterEach(() => {
  jest.useRealTimers()
})

it('provides the initial customer creation state', () => {
  const { result } = renderHook(() => useAddCustomer(), {
    wrapper: HookWrapper,
  })
  expect(result.current.flowState).toBe('form')
  expect(result.current.isCreating).toBe(false)
  expect(result.current.fieldErrors).toEqual({})
})

it('validates required fields and focuses the first invalid input', () => {
  render(
    <Wrapper>
      <CustomerFormHarness />
    </Wrapper>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

  expect(screen.getByText('Customer name is required.')).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /customer name/i })).toHaveFocus()
  expect(createCustomer).not.toHaveBeenCalled()
})

it('creates a normalized customer and caches its profile', async () => {
  jest.mocked(createCustomer).mockResolvedValue(customer)
  render(
    <Wrapper>
      <CustomerFormHarness />
    </Wrapper>,
  )
  fillRequiredFields()
  fireEvent.change(screen.getByRole('textbox', { name: /address/i }), {
    target: { value: '  14 Market Road  ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: /internal notes/i }), {
    target: { value: '  Prefers WhatsApp  ' },
  })

  fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

  await waitFor(() => expect(screen.getByText('success')).toBeInTheDocument())
  expect(createCustomer).toHaveBeenCalledWith('token', {
    address: '14 Market Road',
    email: 'asha@example.com',
    mobile_number: '+919876543210',
    name: 'Asha Rao',
    notes: 'Prefers WhatsApp',
  })
  expect(queryClient.getQueryData(['customer', '23'])).toEqual(customer)
})

it('redirects to the new profile after the success delay', async () => {
  jest.useFakeTimers()
  jest.mocked(createCustomer).mockResolvedValue(customer)
  render(
    <Wrapper>
      <CustomerFormHarness />
    </Wrapper>,
  )
  fillRequiredFields()

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))
  })
  await act(async () => {
    await Promise.resolve()
  })
  expect(screen.getByText('success')).toBeInTheDocument()

  await act(async () => {
    jest.advanceTimersByTime(5_000)
  })

  expect(screen.getByText('Customer profile Asha Rao')).toBeInTheDocument()
})

it('shows a conflict as a mobile field error and focuses that field', async () => {
  jest
    .mocked(createCustomer)
    .mockRejectedValue(
      new ApiError('Mobile number already exists.', 409, 'request_failed'),
    )
  render(
    <Wrapper>
      <CustomerFormHarness />
    </Wrapper>,
  )
  fillRequiredFields()
  fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

  expect(
    await screen.findByText('Mobile number already exists.'),
  ).toBeInTheDocument()
  expect(screen.getByText('form')).toBeInTheDocument()
})

it('returns a visible error if the authenticated session is missing', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: null } as never)
  render(
    <Wrapper>
      <CustomerFormHarness />
    </Wrapper>,
  )
  fillRequiredFields()
  fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

  expect(
    await screen.findByText('Unable to create the customer. Please try again.'),
  ).toBeInTheDocument()
  expect(createCustomer).not.toHaveBeenCalled()
})

it.each([
  [
    new ApiError('Service unavailable.', 503, 'server_error'),
    'Service unavailable.',
  ],
  [
    new Error('Unexpected error'),
    'Unable to create the customer. Please try again.',
  ],
])('shows request errors without leaving the form', async (error, message) => {
  jest.mocked(createCustomer).mockRejectedValue(error)
  render(
    <Wrapper>
      <CustomerFormHarness />
    </Wrapper>,
  )
  fillRequiredFields()
  fireEvent.click(screen.getByRole('button', { name: 'Create Customer' }))

  expect(await screen.findByText(message)).toBeInTheDocument()
  expect(screen.getByText('form')).toBeInTheDocument()
})

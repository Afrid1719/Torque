import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { useAddCustomer } from './hooks/useAddCustomer'
import { AddCustomerPage } from './AddCustomerPage'

jest.mock('./hooks/useAddCustomer', () => ({ useAddCustomer: jest.fn() }))

const navigate = jest.fn()

function customerFlow(overrides: Record<string, unknown> = {}) {
  return {
    customerSummary: {
      address: '',
      email: '',
      id: 44,
      mobileNumber: '+919876543210',
      name: 'Asha Rao',
      notes: '',
    },
    email: '',
    emailInputRef: { current: null },
    fieldErrors: {},
    flowState: 'form',
    handleSubmit: jest.fn(),
    isCreating: false,
    mobileInputRef: { current: null },
    mobileNumber: '',
    name: '',
    nameInputRef: { current: null },
    navigate,
    requestError: null,
    updateField: jest.fn(),
    ...overrides,
  }
}

it('renders the customer creation form', () => {
  jest.mocked(useAddCustomer).mockReturnValue(customerFlow() as never)
  render(
    <MemoryRouter>
      <AddCustomerPage />
    </MemoryRouter>,
  )
  expect(
    screen.getByRole('heading', { name: 'Add Customer' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Create Customer' }),
  ).toBeInTheDocument()
})

it('navigates back to customers when the form is cancelled', () => {
  jest.mocked(useAddCustomer).mockReturnValue(customerFlow() as never)
  render(
    <MemoryRouter>
      <AddCustomerPage />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

  expect(navigate).toHaveBeenCalledWith('/customers')
})

it('shows the in-progress creation state', () => {
  jest
    .mocked(useAddCustomer)
    .mockReturnValue(
      customerFlow({ flowState: 'loading', isCreating: true }) as never,
    )
  render(
    <MemoryRouter>
      <AddCustomerPage />
    </MemoryRouter>,
  )

  expect(screen.getByText('REGISTERING CUSTOMER...')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Creating Customer...' }),
  ).toBeDisabled()
})

it('shows the created customer confirmation', () => {
  jest
    .mocked(useAddCustomer)
    .mockReturnValue(customerFlow({ flowState: 'success' }) as never)
  render(
    <MemoryRouter>
      <AddCustomerPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', {
      name: 'Customer Profile Created Successfully',
    }),
  ).toBeInTheDocument()
  expect(screen.getByText('Asha Rao')).toBeInTheDocument()
  expect(screen.getByText('Customer created successfully')).toBeInTheDocument()
})

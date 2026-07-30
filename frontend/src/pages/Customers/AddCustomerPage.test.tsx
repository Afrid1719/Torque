import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { useAddCustomer } from './hooks/useAddCustomer'
import { AddCustomerPage } from './AddCustomerPage'

jest.mock('./hooks/useAddCustomer', () => ({ useAddCustomer: jest.fn() }))

it('renders the customer creation form', () => {
  jest.mocked(useAddCustomer).mockReturnValue({
    customerSummary: {
      address: '',
      email: '',
      id: 0,
      mobileNumber: '',
      name: '',
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
    navigate: jest.fn(),
    requestError: null,
    updateField: jest.fn(),
  } as never)
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

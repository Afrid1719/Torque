import { fireEvent, render, screen } from '@testing-library/react'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'
import { VehicleOwnershipSection } from './VehicleOwnershipSection'

const customer: CustomerProfileState = {
  address: '12 Main Street',
  email: 'sam@example.com',
  id: 44,
  mobileNumber: '+1 555 0100',
  name: 'Sam Driver',
}

it('renders customer ownership details and handles the assignment action', () => {
  const onNotice = jest.fn()
  render(<VehicleOwnershipSection customer={customer} onNotice={onNotice} />)

  expect(
    screen.getByRole('heading', {
      name: '1. Customer Ownership & Assignment',
    }),
  ).toBeInTheDocument()
  expect(screen.getByText('SD')).toBeInTheDocument()
  expect(screen.getByText('#CUST-44')).toBeInTheDocument()
  expect(screen.getByText(/sam@example.com/)).toBeInTheDocument()
  expect(screen.getByText(/12 Main Street/)).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Change / Unlink' }))
  expect(onNotice).toHaveBeenCalledWith(
    'Customer assignment controls will be available soon.',
  )
})

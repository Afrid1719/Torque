import { render, screen } from '@testing-library/react'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'
import { VehicleRegistryBanner } from './VehicleRegistryBanner'

const customer: CustomerProfileState = {
  address: '12 Main Street',
  email: 'sam@example.com',
  id: 44,
  mobileNumber: '+1 555 0100',
  name: 'Sam Driver',
}

it('shows linked status and the customer identifier', () => {
  render(<VehicleRegistryBanner customer={customer} />)

  expect(screen.getByText('Registry mode')).toBeInTheDocument()
  expect(screen.getByText('Customer linked')).toBeInTheDocument()
  expect(
    screen.getByText(
      'Pre-assigned entry triggered from Customer Master Profile #CUST-44.',
    ),
  ).toBeInTheDocument()
})

it('uses the route customer ID when customer data has no ID', () => {
  render(
    <VehicleRegistryBanner
      customer={{ ...customer, id: undefined }}
      customerId="72"
    />,
  )

  expect(
    screen.getByText(/Customer Master Profile #CUST-72/),
  ).toBeInTheDocument()
})

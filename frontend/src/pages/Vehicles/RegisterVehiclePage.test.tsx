import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'
import { RegisterVehiclePage } from './RegisterVehiclePage'

it('renders the vehicle registration sections and static customer details', () => {
  render(
    <MemoryRouter>
      <RegisterVehiclePage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: 'Register Vehicle' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('heading', {
      name: '2. Identification & Vehicle Specifications',
    }),
  ).toBeInTheDocument()
  expect(screen.getAllByText('Robert Harrison')).toHaveLength(2)
  expect(screen.getByDisplayValue('WBA3N5C51FK289410')).toBeInTheDocument()
})

it('uses customer details supplied by the profile route', () => {
  const customer: CustomerProfileState = {
    email: 'sam@example.com',
    id: 44,
    mobileNumber: '+1 555 0100',
    name: 'Sam Driver',
  }
  render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/customers/44/vehicles/new', state: { customer } },
      ]}
    >
      <RegisterVehiclePage />
    </MemoryRouter>,
  )

  expect(screen.getAllByText('Sam Driver')).toHaveLength(2)
  expect(screen.getByText('#CUST-44')).toBeInTheDocument()
  expect(screen.getByText(/☎ \+1 555 0100/)).toBeInTheDocument()
})

it('shows local feedback when saving a draft', () => {
  render(
    <MemoryRouter>
      <RegisterVehiclePage />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getAllByRole('button', { name: 'Save as Draft' })[0])

  expect(screen.getByText('Draft saved locally.')).toBeInTheDocument()
})

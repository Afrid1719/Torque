import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleDetailsHeader } from './VehicleDetailsHeader'

const vehicle: Vehicle = {
  color: 'White',
  customer: {
    email: 'john@example.com',
    id: 1,
    mobile_number: '+919876543210',
    name: 'John Doe',
  },
  engine_capacity: 1998,
  fuel_type: 'petrol',
  id: 91,
  is_active: true,
  make: 'BMW',
  manufacture_year: 2022,
  model: '330i',
  odometer: 18450,
  registration_number: 'DL02DS2213',
  transmission: 'automatic',
  variant: 'M Sport LCI',
  vehicle_type: 'private',
  vin: 'WBA3N5C51FK289410',
}

it('shows vehicle details and links to the full edit page', () => {
  render(
    <MemoryRouter>
      <VehicleDetailsHeader vehicle={vehicle} />
    </MemoryRouter>,
  )

  expect(screen.getByText('IND')).toBeInTheDocument()
  expect(screen.getAllByText('DL02DS2213')).toHaveLength(2)
  expect(screen.getByText('VEHICLE TYPE · PRIVATE')).toBeInTheDocument()
  expect(screen.getByText('IN SERVICE')).toBeInTheDocument()
  expect(screen.getByText(/VIN: WBA3N5C51FK289410/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Edit Vehicle' })).toHaveAttribute(
    'href',
    '/vehicles/91/edit',
  )
})

it('uses customer-context breadcrumbs when supplied', () => {
  render(
    <MemoryRouter>
      <VehicleDetailsHeader
        customer={{ id: 1, name: 'John Doe' }}
        vehicle={vehicle}
      />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'Customers' })).toHaveAttribute(
    'href',
    '/customers',
  )
  expect(screen.getByRole('link', { name: 'John Doe' })).toHaveAttribute(
    'href',
    '/customers/1',
  )
})

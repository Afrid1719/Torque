import { render, screen } from '@testing-library/react'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleSpecifications } from './VehicleSpecifications'

const vehicle: Vehicle = {
  color: 'Portimao Blue Metallic',
  customer: null,
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

it('renders vehicle specifications with distinct body and vehicle types', () => {
  render(<VehicleSpecifications vehicle={vehicle} />)

  expect(
    screen.getByRole('heading', {
      name: 'Vehicle Specifications & Master Record',
    }),
  ).toBeInTheDocument()
  expect(screen.getByText('DL02DS2213')).toBeInTheDocument()
  expect(screen.getByText('Portimao Blue Metallic')).toBeInTheDocument()
  expect(screen.getByText('Not recorded')).toBeInTheDocument()
  expect(screen.getByText('private')).toBeInTheDocument()
  expect(screen.getByText('Petrol')).toBeInTheDocument()
})

it('displays missing optional specifications as not recorded', () => {
  render(
    <VehicleSpecifications
      vehicle={{ ...vehicle, engine_capacity: null, manufacture_year: null }}
    />,
  )

  expect(screen.getAllByText('Not recorded')).toHaveLength(3)
  expect(screen.getByText('Engine Displacement')).toBeInTheDocument()
  expect(screen.getByText('Manufacture Year')).toBeInTheDocument()
})

import { fireEvent, render, screen } from '@testing-library/react'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleDetailsStats } from './VehicleDetailsStats'

const vehicle: Vehicle = {
  color: 'White',
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

it('renders the four vehicle summary cards', () => {
  render(<VehicleDetailsStats vehicle={vehicle} />)

  expect(screen.getByText('WORKSHOP LOCATION')).toBeInTheDocument()
  expect(screen.getByText('ASSIGNED TECH')).toBeInTheDocument()
  expect(screen.getByText('CURRENT ODOMETER')).toBeInTheDocument()
  expect(screen.getByText('NEXT SERVICE TARGET')).toBeInTheDocument()
  expect(screen.getByText('18,450 km')).toBeInTheDocument()
})

it('shows the full summary value in a tooltip on hover', async () => {
  render(<VehicleDetailsStats vehicle={vehicle} />)

  fireEvent.mouseOver(screen.getByText('Bay 02 (Hydraulic 2-Post)'))

  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Bay 02 (Hydraulic 2-Post)',
  )
})

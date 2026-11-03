import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleGrid } from '@app/pages/Vehicles/components/VehicleGrid'

const vehicle: Vehicle = {
  color: 'White',
  engine_capacity: 1998,
  fuel_type: 'petrol',
  id: 91,
  is_active: true,
  make: 'BMW',
  manufacture_year: 2022,
  model: 'M4',
  odometer: 12400,
  registration_number: 'BIM-4202',
  transmission: 'automatic',
  variant: 'Competition',
  vehicle_type: 'private',
  vin: '1HGCM82633A004352',
}

it('renders vehicle cards and the register tile', () => {
  render(
    <MemoryRouter>
      <VehicleGrid vehicles={[vehicle]} />
    </MemoryRouter>,
  )

  expect(screen.getByText('BMW M4')).toBeInTheDocument()
  expect(screen.getByText('BIM-4202')).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Register a new vehicle' }),
  ).toHaveAttribute('href', '/vehicles/new')
})

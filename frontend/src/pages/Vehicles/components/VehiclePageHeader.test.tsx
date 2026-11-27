import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehiclePageHeader } from '@app/pages/Vehicles/components/VehiclePageHeader'

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

it('offers export and registration actions when vehicles exist', () => {
  const onExport = jest.fn()
  render(
    <MemoryRouter>
      <VehiclePageHeader onExport={onExport} vehicles={[vehicle]} />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))

  expect(onExport).toHaveBeenCalledTimes(1)
  expect(
    screen.getByRole('link', { name: 'Register Vehicle' }),
  ).toHaveAttribute('href', '/vehicles/new')
})

it('disables export when no vehicles exist', () => {
  render(
    <MemoryRouter>
      <VehiclePageHeader onExport={jest.fn()} vehicles={[]} />
    </MemoryRouter>,
  )

  expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
})

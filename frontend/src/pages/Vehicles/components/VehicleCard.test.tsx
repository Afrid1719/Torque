import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleCard } from '@app/pages/Vehicles/components/VehicleCard'
import { vehicleStatuses } from '@app/pages/Vehicles/components/vehicleListConfig'

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

it('renders vehicle and service details with its customer link', () => {
  render(
    <MemoryRouter>
      <VehicleCard status={vehicleStatuses[0]} vehicle={vehicle} />
    </MemoryRouter>,
  )

  expect(screen.getByText('BMW M4')).toBeInTheDocument()
  expect(screen.getByText('BIM-4202')).toBeInTheDocument()
  expect(screen.getByText('2022 · Competition · Petrol')).toBeInTheDocument()
  expect(screen.getByText('IN SERVICE')).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Open customers for Robert Harrison' }),
  ).toHaveAttribute('href', '/customers')
})

it('opens and closes vehicle details', async () => {
  render(
    <MemoryRouter>
      <VehicleCard status={vehicleStatuses[0]} vehicle={vehicle} />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Details' }))

  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByText('BMW M4')).toBeInTheDocument()
  expect(within(dialog).getByText('1HGCM82633A004352')).toBeInTheDocument()
  const removedDialog = waitForElementToBeRemoved(dialog)
  fireEvent.keyDown(dialog, { key: 'Escape' })
  await removedDialog
})

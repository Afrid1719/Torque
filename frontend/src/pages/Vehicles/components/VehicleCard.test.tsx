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
  customer: {
    id: 44,
    mobile_number: '+919876543210',
    name: 'Asha Rao',
  },
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

it('renders vehicle details and the associated customer profile link', () => {
  render(
    <MemoryRouter>
      <VehicleCard status={vehicleStatuses[0]} vehicle={vehicle} />
    </MemoryRouter>,
  )

  expect(screen.getByText('BMW M4')).toBeInTheDocument()
  expect(screen.getByText('BIM-4202')).toBeInTheDocument()
  expect(screen.getByText('2022 · Competition · Petrol')).toBeInTheDocument()
  expect(screen.getByText('IN SERVICE')).toBeInTheDocument()
  expect(screen.getByText('Asha Rao')).toHaveAttribute('href', '/customers/44')
  expect(screen.getByText('+919876543210')).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Open customer profile for Asha Rao' }),
  ).toHaveAttribute('href', '/customers/44')
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
  expect(within(dialog).getByText('Asha Rao')).toBeInTheDocument()
  expect(within(dialog).getByText('1HGCM82633A004352')).toBeInTheDocument()
  const removedDialog = waitForElementToBeRemoved(dialog)
  fireEvent.keyDown(dialog, { key: 'Escape' })
  await removedDialog
})

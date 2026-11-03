import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleListTable } from '@app/pages/Vehicles/components/VehicleListTable'

const vehicles: Vehicle[] = Array.from({ length: 7 }, (_, index) => ({
  color: 'White',
  engine_capacity: 1998,
  fuel_type: 'petrol',
  id: index + 1,
  is_active: true,
  make: `Make ${index + 1}`,
  manufacture_year: 2022,
  model: 'Model',
  odometer: 12400,
  registration_number: `TEST-${index + 1}`,
  transmission: 'automatic',
  variant: 'Variant',
  vehicle_type: 'private',
  vin: `VIN-${index + 1}`,
}))

it('renders vehicle details and paginates through rows', () => {
  render(
    <MemoryRouter>
      <VehicleListTable vehicles={vehicles} />
    </MemoryRouter>,
  )

  const table = screen.getByRole('table', { name: 'Vehicles' })
  expect(within(table).getByText('TEST-1')).toBeInTheDocument()
  expect(within(table).getByText('TEST-5')).toBeInTheDocument()
  expect(within(table).queryByText('TEST-6')).not.toBeInTheDocument()
  expect(screen.getByText('1–5 of 7')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))

  expect(within(table).queryByText('TEST-1')).not.toBeInTheDocument()
  expect(within(table).getByText('TEST-6')).toBeInTheDocument()
  expect(screen.getByText('6–7 of 7')).toBeInTheDocument()
})

it('shows vehicle specifications from the table details action', () => {
  render(
    <MemoryRouter>
      <VehicleListTable vehicles={vehicles.slice(0, 1)} />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Details' }))

  expect(screen.getByRole('dialog')).toHaveTextContent('VIN-1')
})

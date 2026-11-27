import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { CustomerActivity } from './CustomerActivity'

function VehicleStateRoute() {
  const location = useLocation()
  const customer = (
    location.state as { customer?: { id: number; name: string } }
  )?.customer

  return (
    <div>{customer ? `${customer.name} (${customer.id})` : 'No customer'}</div>
  )
}

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

it('renders empty activity and customer notes', () => {
  render(<CustomerActivity notes="Morning appointments" />)
  expect(screen.getByText('No vehicles registered')).toBeInTheDocument()
  expect(screen.getByText('Morning appointments')).toBeInTheDocument()
  expect(screen.getByText('No service history yet')).toBeInTheDocument()
})

it('calls the add vehicle action', () => {
  const onAddVehicle = jest.fn()
  render(<CustomerActivity notes="" onAddVehicle={onAddVehicle} />)

  fireEvent.click(screen.getByRole('button', { name: 'Add New' }))

  expect(onAddVehicle).toHaveBeenCalledTimes(1)
})

it('shows vehicle loading and error states', () => {
  const { rerender } = render(<CustomerActivity notes="" vehiclesLoading />)
  expect(screen.getByText('Loading registered vehicles...')).toBeInTheDocument()
  expect(screen.queryByText('No vehicles registered')).not.toBeInTheDocument()

  rerender(
    <CustomerActivity
      notes=""
      vehiclesError="Unable to load registered vehicles."
    />,
  )
  expect(
    screen.getByText('Unable to load registered vehicles.'),
  ).toBeInTheDocument()
  expect(screen.queryByText('No vehicles registered')).not.toBeInTheDocument()
})

it('renders registered vehicle details', () => {
  render(
    <MemoryRouter>
      <CustomerActivity
        customerId={44}
        customerName="Asha Rao"
        notes=""
        vehicles={[vehicle]}
      />
    </MemoryRouter>,
  )

  expect(screen.getByText('BMW M4 Competition')).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: /BMW M4 Competition/ }),
  ).toHaveAttribute('href', '/vehicles/91')
  expect(screen.getByText('BIM-4202')).toBeInTheDocument()
  expect(screen.getByText('2022 • 12,400 km')).toBeInTheDocument()
  expect(screen.getByText('READY')).toBeInTheDocument()
  expect(screen.queryByText('No vehicles registered')).not.toBeInTheDocument()
})

it('preserves customer context when opening one of their vehicles', () => {
  render(
    <MemoryRouter initialEntries={['/customers/44']}>
      <Routes>
        <Route
          element={
            <CustomerActivity
              customerId={44}
              customerName="Asha Rao"
              notes=""
              vehicles={[vehicle]}
            />
          }
          path="/customers/44"
        />
        <Route element={<VehicleStateRoute />} path="/vehicles/:vehicleId" />
      </Routes>
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('link', { name: /BMW M4 Competition/ }))

  expect(screen.getByText('Asha Rao (44)')).toBeInTheDocument()
})

it('shows a link to more vehicles only when there are more than three', () => {
  const vehicles = Array.from({ length: 4 }, (_, index) => ({
    ...vehicle,
    id: index + 1,
  }))
  const { rerender } = render(
    <MemoryRouter>
      <CustomerActivity customerId={44} notes="" vehicles={vehicles} />
    </MemoryRouter>,
  )

  expect(screen.getAllByText('BMW M4 Competition')).toHaveLength(3)
  expect(screen.getByRole('link', { name: 'More' })).toHaveAttribute(
    'href',
    '/vehicles?customerId=44',
  )

  rerender(
    <MemoryRouter>
      <CustomerActivity notes="" vehicles={vehicles.slice(0, 3)} />
    </MemoryRouter>,
  )
  expect(screen.queryByRole('link', { name: 'More' })).not.toBeInTheDocument()
})

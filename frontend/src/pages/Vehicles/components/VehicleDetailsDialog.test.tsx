import { render, screen } from '@testing-library/react'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleDetailsDialog } from '@app/pages/Vehicles/components/VehicleDetailsDialog'

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

it('does not render a dialog without a selected vehicle', () => {
  render(<VehicleDetailsDialog onClose={jest.fn()} vehicle={null} />)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('shows vehicle specifications when a vehicle is selected', () => {
  render(<VehicleDetailsDialog onClose={jest.fn()} vehicle={vehicle} />)

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('BMW M4')
  expect(dialog).toHaveTextContent('Asha Rao')
  expect(dialog).toHaveTextContent('+919876543210')
  expect(dialog).toHaveTextContent('BIM-4202')
  expect(dialog).toHaveTextContent('12,400 km')
  expect(dialog).toHaveTextContent('Petrol')
  expect(dialog).toHaveTextContent('1HGCM82633A004352')
})

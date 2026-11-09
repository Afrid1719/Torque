import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { updateVehicle, type Vehicle } from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import { VehicleDetailsHeader } from './VehicleDetailsHeader'

jest.mock('@app/api/vehicles', () => ({
  customerVehiclesQueryKey: (id: string | number) => [
    'customer',
    String(id),
    'vehicles',
  ],
  updateVehicle: jest.fn(),
  vehicleQueryKey: (id: string | number) => ['vehicle', String(id)],
  vehiclesQueryKey: ['vehicles'],
}))
jest.mock('@app/hooks/useAuth', () => ({ useAuth: jest.fn() }))

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

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <VehicleDetailsHeader vehicle={vehicle} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
})

it('renders the Indian registration, vehicle details, and in-service status', () => {
  renderHeader()

  expect(screen.getByText('IND')).toBeInTheDocument()
  expect(screen.getAllByText('DL02DS2213')).toHaveLength(2)
  expect(screen.getByText('VEHICLE TYPE · PRIVATE')).toBeInTheDocument()
  expect(screen.getByText('IN SERVICE')).toBeInTheDocument()
  expect(screen.getByText(/VIN: WBA3N5C51FK289410/)).toBeInTheDocument()
})

it('opens and saves the prefilled vehicle edit form', async () => {
  jest.mocked(updateVehicle).mockResolvedValue(vehicle)
  renderHeader()

  fireEvent.click(screen.getByRole('button', { name: 'Edit Vehicle' }))
  expect(
    screen.getByRole('textbox', { name: 'Registration number' }),
  ).toHaveValue('DL02DS2213')

  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  await waitFor(() => {
    expect(updateVehicle).toHaveBeenCalledWith(
      'test-token',
      91,
      expect.objectContaining({
        registration_number: 'DL02DS2213',
        odometer: 18450,
        vehicle_type: 'private',
      }),
    )
  })
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
})

it('validates odometer before sending an update', () => {
  renderHeader()

  fireEvent.click(screen.getByRole('button', { name: 'Edit Vehicle' }))
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Odometer (km)' }), {
    target: { value: '0' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  expect(
    screen.getByText('Enter an odometer reading greater than zero.'),
  ).toBeInTheDocument()
  expect(updateVehicle).not.toHaveBeenCalled()
})

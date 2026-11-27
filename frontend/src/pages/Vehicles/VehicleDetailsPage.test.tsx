import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ApiError } from '@app/api/client'
import { getVehicle, type Vehicle } from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import { VehicleDetailsPage } from './VehicleDetailsPage'

jest.mock('@app/api/vehicles', () => ({
  getVehicle: jest.fn(),
  vehicleQueryKey: (id: string | number) => ['vehicle', String(id)],
}))
jest.mock('@app/hooks/useAuth', () => ({ useAuth: jest.fn() }))

const vehicle: Vehicle = {
  color: 'Portimao Blue Metallic',
  customer: {
    email: 'john@example.com',
    id: 44,
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

function renderDetails(initialEntry: string | object = '/vehicles/91') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<VehicleDetailsPage />} path="/vehicles/:vehicleId" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
})

it('loads and renders vehicle details with customer-context breadcrumbs', async () => {
  jest.mocked(getVehicle).mockResolvedValue(vehicle)
  renderDetails({
    pathname: '/vehicles/91',
    state: { customer: { id: 44, name: 'John Doe' } },
  })

  expect(
    await screen.findByRole('heading', { name: /BMW 330i M Sport LCI/ }),
  ).toBeInTheDocument()
  expect(getVehicle).toHaveBeenCalledWith('test-token', 91)
  expect(screen.getByRole('link', { name: 'Customers' })).toHaveAttribute(
    'href',
    '/customers',
  )
  expect(screen.getByRole('link', { name: 'John Doe' })).toHaveAttribute(
    'href',
    '/customers/44',
  )
  expect(
    screen.getByRole('heading', { name: 'Active Job Card' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { name: 'Registered Owner' }),
  ).toBeInTheDocument()
  expect(screen.getByText('john@example.com')).toBeInTheDocument()
})

it('shows validation feedback and avoids a request for an invalid vehicle id', () => {
  renderDetails('/vehicles/not-a-number')

  expect(screen.getByText('The vehicle ID is invalid.')).toBeInTheDocument()
  expect(getVehicle).not.toHaveBeenCalled()
})

it('shows API errors when the vehicle cannot be loaded', async () => {
  jest
    .mocked(getVehicle)
    .mockRejectedValue(new ApiError('Vehicle unavailable', 404, 'not_found'))
  renderDetails()

  expect(await screen.findByText('Vehicle unavailable')).toBeInTheDocument()
  expect(screen.getByText('Back to vehicles')).toHaveAttribute(
    'href',
    '/vehicles',
  )
})

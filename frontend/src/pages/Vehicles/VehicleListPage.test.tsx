import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ApiError } from '@app/api/client'
import {
  getCustomerVehicles,
  getVehicles,
  type Vehicle,
} from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import { VehicleListPage } from './VehicleListPage'

jest.mock('@app/api/vehicles', () => ({
  customerVehiclesQueryKey: (customerId: string | number) => [
    'customer',
    String(customerId),
    'vehicles',
  ],
  getCustomerVehicles: jest.fn(),
  getVehicles: jest.fn(),
  vehiclesQueryKey: ['vehicles'],
}))
jest.mock('@app/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

const customerVehicle: Vehicle = {
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

function renderVehicleList(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<VehicleListPage />} path="/vehicles" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

it('loads only the selected customer’s vehicles', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getCustomerVehicles).mockResolvedValue([customerVehicle])
  renderVehicleList('/vehicles?customerId=44')

  await waitFor(() => {
    expect(getCustomerVehicles).toHaveBeenCalledWith('test-token', '44')
  })
  expect(getVehicles).not.toHaveBeenCalled()
  expect(await screen.findByText('BIM-4202')).toBeInTheDocument()
  expect(screen.getByText('Asha Rao')).toHaveAttribute('href', '/customers/44')
})

it('shows a paginated table in list view', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  const vehicles = Array.from({ length: 7 }, (_, index) => ({
    ...customerVehicle,
    id: index + 1,
    make: `Make ${index + 1}`,
    registration_number: `TEST-${index + 1}`,
  }))
  jest.mocked(getVehicles).mockResolvedValue(vehicles)
  renderVehicleList('/vehicles')

  fireEvent.click(await screen.findByRole('button', { name: 'List view' }))

  const table = screen.getByRole('table', { name: 'Vehicles' })
  expect(within(table).getByText('TEST-1')).toBeInTheDocument()
  expect(within(table).getByText('TEST-5')).toBeInTheDocument()
  expect(within(table).queryByText('TEST-6')).not.toBeInTheDocument()
  expect(screen.getByText('1–5 of 7')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))

  expect(within(table).queryByText('TEST-1')).not.toBeInTheDocument()
  expect(within(table).getByText('TEST-6')).toBeInTheDocument()
  expect(within(table).getByText('TEST-7')).toBeInTheDocument()
  expect(screen.getByText('6–7 of 7')).toBeInTheDocument()
})

it('allows changing the number of rows shown per page', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getVehicles).mockResolvedValue(
    Array.from({ length: 7 }, (_, index) => ({
      ...customerVehicle,
      id: index + 1,
      registration_number: `PAGE-${index + 1}`,
    })),
  )
  renderVehicleList('/vehicles')
  fireEvent.click(await screen.findByRole('button', { name: 'List view' }))
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /rows per page/i }))
  fireEvent.click(await screen.findByRole('option', { name: '10' }))

  const table = screen.getByRole('table', { name: 'Vehicles' })
  expect(within(table).getByText('PAGE-7')).toBeInTheDocument()
  expect(screen.getByText('1–7 of 7')).toBeInTheDocument()
})

it('renders vehicle cards and opens vehicle details in grid view', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getVehicles).mockResolvedValue([customerVehicle])
  renderVehicleList('/vehicles')

  expect(await screen.findByText('BIM-4202')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Details' }))

  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText('BMW M4')).toBeInTheDocument()
  expect(within(dialog).getByText('1HGCM82633A004352')).toBeInTheDocument()
  expect(within(dialog).getByText('12,400 km')).toBeInTheDocument()
})

it('links the register vehicle tile to vehicle registration', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getVehicles).mockResolvedValue([customerVehicle])
  renderVehicleList('/vehicles')

  const registerLink = await screen.findByRole('link', {
    name: 'Register a new vehicle',
  })

  expect(registerLink).toHaveAttribute('href', '/vehicles/new')
  expect(
    screen.getByText('Register a new vehicle in the vehicle registry.'),
  ).toBeInTheDocument()
})

it('filters vehicles by the search field', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getVehicles).mockResolvedValue([
    customerVehicle,
    {
      ...customerVehicle,
      id: 92,
      make: 'Honda',
      model: 'City',
      registration_number: 'CITY-2468',
    },
  ])
  renderVehicleList('/vehicles')

  await screen.findByText('BIM-4202')
  fireEvent.change(screen.getByPlaceholderText('Search plate, VIN, make...'), {
    target: { value: 'CITY' },
  })

  expect(screen.getByText('CITY-2468')).toBeInTheDocument()
  expect(screen.queryByText('BIM-4202')).not.toBeInTheDocument()
})

it('shows an empty result message when search filters out all vehicles', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getVehicles).mockResolvedValue([customerVehicle])
  renderVehicleList('/vehicles')
  await screen.findByText('BIM-4202')
  fireEvent.change(screen.getByPlaceholderText('Search plate, VIN, make...'), {
    target: { value: 'no matching vehicle' },
  })

  expect(
    screen.getByText('No vehicles match these filters'),
  ).toBeInTheDocument()
})

it('exports the currently filtered vehicles as a CSV file', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getVehicles).mockResolvedValue([customerVehicle])
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL
  const createObjectURL = jest.fn().mockReturnValue('blob:vehicles')
  const revokeObjectURL = jest.fn()
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectURL,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectURL,
  })
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined)
  renderVehicleList('/vehicles')
  await screen.findByText('BIM-4202')

  fireEvent.click(await screen.findByRole('button', { name: 'Export CSV' }))

  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
  expect(click).toHaveBeenCalledTimes(1)
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:vehicles')
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: originalCreateObjectURL,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: originalRevokeObjectURL,
  })
})

it('shows the empty registry state and register action', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getVehicles).mockResolvedValue([])
  renderVehicleList('/vehicles')

  expect(await screen.findByText('No vehicles registered')).toBeInTheDocument()
  const registerLinks = screen.getAllByRole('link', {
    name: 'Register Vehicle',
  })
  expect(registerLinks).toHaveLength(2)
  registerLinks.forEach((link) =>
    expect(link).toHaveAttribute('href', '/vehicles/new'),
  )
})

it('shows API errors when vehicles fail to load', async () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest
    .mocked(getVehicles)
    .mockRejectedValue(
      new ApiError('Vehicle service unavailable.', 503, 'server_error'),
    )
  renderVehicleList('/vehicles')

  expect(
    await screen.findByText('Vehicle service unavailable.'),
  ).toBeInTheDocument()
})

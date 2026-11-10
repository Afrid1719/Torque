import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { getVehicle, updateVehicle, type Vehicle } from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import { VehicleEditPage } from './VehicleEditPage'

jest.mock('@app/api/vehicles', () => ({
  customerVehiclesQueryKey: (id: string | number) => [
    'customer',
    String(id),
    'vehicles',
  ],
  getVehicle: jest.fn(),
  updateVehicle: jest.fn(),
  vehicleQueryKey: (id: string | number) => ['vehicle', String(id)],
  vehiclesQueryKey: ['vehicles'],
}))
jest.mock('@app/hooks/useAuth', () => ({ useAuth: jest.fn() }))

const vehicle: Vehicle = {
  color: 'Portimao Blue Metallic',
  customer: {
    address: 'Bay Area Depot #4',
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

function renderPage(path = '/vehicles/91/edit') {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            element={<VehicleEditPage />}
            path="/vehicles/:vehicleId/edit"
          />
          <Route
            element={<div>Vehicle Details Page</div>}
            path="/vehicles/:vehicleId"
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'test-token' } as never)
  jest.mocked(getVehicle).mockResolvedValue(vehicle)
  jest.mocked(updateVehicle).mockResolvedValue(vehicle)
})

it('loads an edit page with customer breadcrumbs and prefilled record fields', async () => {
  renderPage()

  expect(
    await screen.findByRole('heading', {
      name: 'Edit Vehicle — 2022 BMW 330i M Sport LCI',
    }),
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
    screen.getByRole('textbox', { name: 'License Plate / Registration No.' }),
  ).toHaveValue('DL02DS2213')
  expect(
    screen.getByRole('textbox', { name: 'VIN / Chassis Identifier' }),
  ).toHaveValue('WBA3N5C51FK289410')
  expect(
    screen.getByRole('heading', {
      name: 'Customer Ownership & Assignment',
    }),
  ).toBeInTheDocument()
  expect(screen.getByText('MANDATORY FOR BILLING')).toBeInTheDocument()
  expect(
    screen.getByRole('img', {
      name: 'Generic workshop image, not this vehicle',
    }),
  ).toBeInTheDocument()
  expect(screen.getByText('Bay Area Depot #4')).toBeInTheDocument()
  expect(screen.getByText('In Service (Bay 02)')).toBeInTheDocument()
  expect(screen.getByText('ISO 3')).toBeInTheDocument()
  expect(screen.getByText('Not available')).toBeInTheDocument()
})

it('normalizes saved enum values so the corresponding options are selected', async () => {
  const savedVehicle = { ...vehicle }
  Object.defineProperty(savedVehicle, 'vehicle_type', {
    value: 'PRIVATE',
  })
  Object.defineProperty(savedVehicle, 'fuel_type', { value: 'PETROL' })
  Object.defineProperty(savedVehicle, 'transmission', {
    value: 'SEMI-AUTOMATIC',
  })
  jest.mocked(getVehicle).mockResolvedValue(savedVehicle)
  renderPage()

  await screen.findByRole('heading', { name: /Edit Vehicle/ })

  expect(
    screen.getByRole('combobox', { name: 'Vehicle Type' }),
  ).toHaveTextContent('Private')
  expect(
    screen.getByRole('combobox', { name: 'Transmission Type' }),
  ).toHaveTextContent('Semi-automatic')
})

it('updates the active fleet status from the summary switch', async () => {
  renderPage()
  await screen.findByRole('heading', { name: /Edit Vehicle/ })

  fireEvent.click(
    screen.getByRole('switch', { name: 'Active in Workshop Fleet' }),
  )

  expect(
    screen.getByText('Not eligible for scheduling & billing'),
  ).toBeInTheDocument()
  expect(screen.getByText('Changes not yet saved')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  await waitFor(() => {
    expect(updateVehicle).toHaveBeenCalledWith(
      'test-token',
      91,
      expect.objectContaining({ is_active: false }),
    )
  })
})

it('shows why customer reassignment cannot be completed yet', async () => {
  renderPage()
  await screen.findByRole('heading', { name: /Edit Vehicle/ })

  fireEvent.click(screen.getByRole('button', { name: 'Change / Reassign' }))

  expect(
    await screen.findByText(
      'Customer reassignment is not supported yet. The current owner has not been changed.',
    ),
  ).toBeInTheDocument()
  expect(updateVehicle).not.toHaveBeenCalled()
})

it('saves edited vehicle data and returns to the details page when requested', async () => {
  renderPage()
  await screen.findByRole('heading', { name: /Edit Vehicle/ })

  fireEvent.change(
    screen.getByRole('textbox', { name: 'Exterior Paint & Finish' }),
    { target: { value: 'Alpine White' } },
  )
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes & Exit' }))

  await waitFor(() => {
    expect(updateVehicle).toHaveBeenCalledWith(
      'test-token',
      91,
      expect.objectContaining({
        color: 'Alpine White',
        odometer: 18450,
        registration_number: 'DL02DS2213',
      }),
    )
  })
  expect(await screen.findByText('Vehicle Details Page')).toBeInTheDocument()
})

it('validates odometer before sending an update', async () => {
  renderPage()
  await screen.findByRole('heading', { name: /Edit Vehicle/ })

  fireEvent.change(
    screen.getByRole('spinbutton', { name: 'Current Odometer (km)' }),
    {
      target: { value: '0' },
    },
  )
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

  expect(
    await screen.findByText('Enter an odometer reading greater than zero.'),
  ).toBeInTheDocument()
  expect(updateVehicle).not.toHaveBeenCalled()
})

it('validates required fields before using the save-and-exit action', async () => {
  renderPage()
  await screen.findByRole('heading', { name: /Edit Vehicle/ })

  fireEvent.change(
    screen.getByRole('textbox', { name: 'License Plate / Registration No.' }),
    { target: { value: ' ' } },
  )
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes & Exit' }))

  expect(
    await screen.findByText(
      'Complete all required vehicle details before saving.',
    ),
  ).toBeInTheDocument()
  expect(updateVehicle).not.toHaveBeenCalled()
})

it('requires confirmation before marking a vehicle inactive', async () => {
  renderPage()
  await screen.findByRole('heading', { name: /Edit Vehicle/ })

  fireEvent.click(screen.getByRole('button', { name: 'Deactivate Vehicle' }))
  expect(
    screen.getByRole('heading', { name: 'Deactivate this vehicle?' }),
  ).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Mark Inactive' }))

  expect(screen.getByText('Changes not yet saved')).toBeInTheDocument()
  expect(updateVehicle).not.toHaveBeenCalled()
})

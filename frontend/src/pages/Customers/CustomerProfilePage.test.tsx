import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@app/api/client'
import { useAuth } from '../../hooks/useAuth'
import { CustomerProfilePage } from './CustomerProfilePage'

jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }))
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }))

const customer = {
  address: null,
  email: 'john@mail.com',
  id: 44,
  mobile_number: '123',
  name: 'John',
  notes: null,
}

function VehicleStateRoute() {
  const location = useLocation()
  const navigationCustomer = (
    location.state as { customer?: { id?: number; name?: string } } | null
  )?.customer

  return <div>{navigationCustomer?.name ?? 'Missing customer context'}</div>
}

function renderProfile(initialEntry: string | object = '/customers/44') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/customers/:customerId"
          element={<CustomerProfilePage />}
        />
        <Route
          path="/customers/:customerId/vehicles/new"
          element={<h1>Register customer vehicle</h1>}
        />
        <Route
          path="/customers/:customerId/edit"
          element={<h1>Edit customer profile</h1>}
        />
        <Route path="/vehicles/:vehicleId" element={<VehicleStateRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

it('renders fetched customer details', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: customer,
    error: null,
    isPending: false,
  } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: Array.from({ length: 4 }, (_, index) => ({
      color: 'White',
      engine_capacity: 1998,
      fuel_type: 'petrol',
      id: index + 1,
      is_active: true,
      make: 'BMW',
      manufacture_year: 2022,
      model: 'M4',
      odometer: 12400,
      registration_number: `BIM-420${index + 2}`,
      transmission: 'automatic',
      variant: 'Competition',
      vehicle_type: 'private',
      vin: `1HGCM82633A00435${index}`,
    })),
    error: null,
    isPending: false,
  } as never)
  renderProfile()
  expect(screen.getByRole('heading', { name: 'John' })).toBeInTheDocument()
  expect(screen.getByText('john@mail.com')).toBeInTheDocument()
  expect(screen.getByText('4 vehicles registered')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'More' })).toHaveAttribute(
    'href',
    '/vehicles?customerId=44',
  )
})

it('navigates to add a vehicle for the current customer', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: customer,
    error: null,
    isPending: false,
  } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: [],
    error: null,
    isPending: false,
  } as never)

  renderProfile()

  fireEvent.click(screen.getByRole('button', { name: 'Add New' }))

  expect(
    screen.getByRole('heading', { name: 'Register customer vehicle' }),
  ).toBeInTheDocument()
})

it('passes the fetched customer name when opening a registered vehicle', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: customer,
    error: null,
    isPending: false,
  } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: [
      {
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
      },
    ],
    error: null,
    isPending: false,
  } as never)

  renderProfile()
  fireEvent.click(screen.getByRole('link', { name: /BMW M4 Competition/ }))

  expect(screen.getByText('John')).toBeInTheDocument()
})

it('navigates to edit notes from the customer profile', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: customer,
    error: null,
    isPending: false,
  } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: [],
    error: null,
    isPending: false,
  } as never)
  renderProfile()

  fireEvent.click(screen.getByRole('button', { name: 'Edit workshop notes' }))

  expect(
    screen.getByRole('heading', { name: 'Edit customer profile' }),
  ).toBeInTheDocument()
})

it('shows the loading state before customer data arrives', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: undefined,
    error: null,
    isPending: true,
  } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: [],
    error: null,
    isPending: true,
  } as never)
  renderProfile()
  expect(screen.getByText('Loading customer profile...')).toBeInTheDocument()
})

it('shows a customer API error when no fallback customer is available', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: undefined,
    error: new ApiError('Customer is unavailable.', 404, 'request_failed'),
    isPending: false,
  } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: [],
    error: null,
    isPending: false,
  } as never)

  renderProfile()

  expect(screen.getByText('Customer is unavailable.')).toBeInTheDocument()
})

it('renders navigation fallback and vehicle errors while showing update success', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: undefined,
    error: new Error('Customer request failed'),
    isPending: false,
  } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: undefined,
    error: new Error('Vehicle request failed'),
    isPending: false,
  } as never)

  renderProfile({
    pathname: '/customers/44',
    state: { customer: { ...customer, mobileNumber: '123' }, updated: true },
  })

  expect(
    screen.getByText('Customer details updated successfully.'),
  ).toBeInTheDocument()
  expect(
    screen.getByText('Unable to load the customer profile.'),
  ).toBeInTheDocument()
  expect(
    screen.getByText('Unable to load registered vehicles.'),
  ).toBeInTheDocument()
})

it('shows a vehicle API error message', () => {
  jest.mocked(useAuth).mockReturnValue({ accessToken: 'token' } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: customer,
    error: null,
    isPending: false,
  } as never)
  jest.mocked(useQuery).mockReturnValueOnce({
    data: undefined,
    error: new ApiError(
      'Vehicle records are unavailable.',
      503,
      'server_error',
    ),
    isPending: false,
  } as never)

  renderProfile()

  expect(
    screen.getByText('Vehicle records are unavailable.'),
  ).toBeInTheDocument()
})

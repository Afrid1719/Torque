import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleOwnerCard } from './VehicleOwnerCard'

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

it('renders owner contact details and profile actions', () => {
  render(
    <MemoryRouter>
      <VehicleOwnerCard vehicle={vehicle} />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: 'Registered Owner' }),
  ).toBeInTheDocument()
  expect(screen.getByText('John Doe')).toBeInTheDocument()
  expect(screen.getByText('CUST-1')).toBeInTheDocument()

  const phone = screen.getByText('+919876543210')
  const email = screen.getByText('john@example.com')
  expect(phone).toBeInTheDocument()
  expect(email).toBeInTheDocument()
  expect(
    phone.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  expect(screen.getByRole('link', { name: /Profile/ })).toHaveAttribute(
    'href',
    '/customers/1',
  )
  expect(screen.getByRole('link', { name: /Call \/ SMS/ })).toHaveAttribute(
    'href',
    'tel:+919876543210',
  )
})

it('shows a clear fallback when the owner has no email', () => {
  render(
    <MemoryRouter>
      <VehicleOwnerCard
        vehicle={{
          ...vehicle,
          customer: { ...vehicle.customer!, email: null },
        }}
      />
    </MemoryRouter>,
  )

  const ownerSection = screen
    .getByRole('heading', { name: 'Registered Owner' })
    .closest('.MuiCard-root')
  expect(ownerSection).not.toBeNull()
  expect(
    within(ownerSection as HTMLElement).getByText('Email not provided'),
  ).toBeInTheDocument()
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ApiError } from '@app/api/client'
import { createCustomerVehicle } from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'
import { RegisterVehiclePage } from './RegisterVehiclePage'

jest.mock('@app/api/vehicles', () => ({
  createCustomerVehicle: jest.fn(),
}))
jest.mock('@app/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

const customer: CustomerProfileState = {
  address: '12 Main Street',
  email: 'sam@example.com',
  id: 44,
  mobileNumber: '+1 555 0100',
  name: 'Sam Driver',
}

const createdVehicle = {
  color: 'Portimao Blue Metallic',
  engine_capacity: 1998,
  fuel_type: 'petrol' as const,
  id: 91,
  is_active: true,
  make: 'BMW',
  manufacture_year: 2022,
  model: '330i',
  odometer: 18450,
  registration_number: 'MH12AB1234',
  transmission: 'automatic' as const,
  variant: 'M Sport LCI',
  vehicle_type: 'private' as const,
  vin: 'WBA3N5C51FK289410',
}

function renderPage({
  accessToken = 'test-token',
  customerState = customer,
}: {
  accessToken?: string | null
  customerState?: CustomerProfileState | null
} = {}) {
  jest.mocked(useAuth).mockReturnValue({ accessToken } as never)
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={
          customerState
            ? [
                {
                  pathname: `/customers/${customerState.id}/vehicles/new`,
                  state: { customer: customerState },
                },
              ]
            : ['/vehicles']
        }
      >
        <Routes>
          <Route
            element={<RegisterVehiclePage />}
            path="/customers/:customerId/vehicles/new"
          />
          <Route element={<RegisterVehiclePage />} path="/vehicles" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function clickRegisterButton(name = 'Save & Register') {
  fireEvent.click(screen.getAllByRole('button', { name })[0])
}

describe('RegisterVehiclePage', () => {
  beforeEach(() => {
    jest.mocked(createCustomerVehicle).mockResolvedValue(createdVehicle)
  })

  it('renders registration sections and static customer details', () => {
    renderPage({ customerState: null })

    expect(
      screen.getByRole('heading', { name: 'Register Vehicle' }),
    ).toBeInTheDocument()
    expect(screen.getByText('New Vehicle')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Customers' })).toHaveAttribute(
      'href',
      '/customers',
    )
    expect(
      screen.getByRole('link', { name: 'Robert Harrison' }),
    ).toHaveAttribute('href', '/customers/9842')
    expect(
      screen.getByRole('heading', {
        name: '2. Identification & Vehicle Specifications',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Robert Harrison')).toHaveLength(2)
    expect(screen.getByDisplayValue('WBA3N5C51FK289410')).toBeInTheDocument()
  })

  it('uses customer details supplied by the profile route', () => {
    renderPage()

    expect(screen.getAllByText('Sam Driver')).toHaveLength(2)
    expect(screen.getByText('#CUST-44')).toBeInTheDocument()
    expect(screen.getByText(/☎ \+1 555 0100/)).toBeInTheDocument()
  })

  it('shows local feedback when saving a draft', () => {
    renderPage()

    fireEvent.click(screen.getAllByRole('button', { name: 'Save as Draft' })[0])

    expect(screen.getByText('Draft saved locally.')).toBeInTheDocument()
    expect(createCustomerVehicle).not.toHaveBeenCalled()
  })

  it('keeps the VIN scan action available inside its field', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Scan' }))

    expect(
      screen.getByText('VIN decoder has no live connection in this preview.'),
    ).toBeInTheDocument()
  })

  it('allows selecting each fuel or powertrain option', () => {
    renderPage()

    const dieselOption = screen.getByRole('button', { name: 'Diesel' })
    fireEvent.click(dieselOption)

    expect(dieselOption).toHaveAttribute('aria-pressed', 'true')
  })

  it.each(['Save & Register', 'Register & Open Job Card'])(
    'opens a confirmation preview from the %s header action without submitting',
    (buttonName) => {
      renderPage()

      clickRegisterButton(buttonName)

      expect(
        screen.getByRole('heading', { name: 'Confirm Vehicle Registration' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('MH12AB1234', { exact: false }),
      ).toBeInTheDocument()
      expect(createCustomerVehicle).not.toHaveBeenCalled()
    },
  )

  it('opens the confirmation preview from the footer job-card action', () => {
    renderPage()

    fireEvent.click(
      screen.getByRole('button', { name: 'Register & Create Job Card' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Confirm Vehicle Registration' }),
    ).toBeInTheDocument()
    expect(createCustomerVehicle).not.toHaveBeenCalled()
  })

  it('returns to the form without submitting when Back to Edit is clicked', () => {
    renderPage()
    clickRegisterButton()

    fireEvent.click(screen.getByRole('button', { name: 'Back to Edit' }))

    expect(
      screen.queryByRole('heading', { name: 'Confirm Vehicle Registration' }),
    ).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('WBA3N5C51FK289410')).toBeInTheDocument()
    expect(createCustomerVehicle).not.toHaveBeenCalled()
  })

  it('sends the entered vehicle fields only after confirmation', async () => {
    renderPage()
    clickRegisterButton()

    expect(createCustomerVehicle).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Register' }))

    await waitFor(() => {
      expect(createCustomerVehicle).toHaveBeenCalledWith('test-token', '44', {
        color: 'Portimao Blue Metallic',
        engine_capacity: 1998,
        fuel_type: 'petrol',
        is_active: true,
        make: 'BMW',
        manufacture_year: 2022,
        model: '330i',
        odometer: 18450,
        registration_number: 'MH12AB1234',
        transmission: 'automatic',
        variant: 'M Sport LCI',
        vehicle_type: 'private',
        vin: 'WBA3N5C51FK289410',
      })
    })
    expect(
      await screen.findByText('Vehicle MH12AB1234 registered successfully.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Confirm Vehicle Registration' }),
    ).not.toBeInTheDocument()
  })

  it('previews custom make, intake, insurance, and checklist values', () => {
    renderPage()

    fireEvent.change(screen.getByRole('combobox', { name: 'Vehicle Make' }), {
      target: { value: 'Rivian' },
    })
    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Reported Symptoms & Cosmetic Inspection Notes',
      }),
      { target: { value: 'Customer reports a steering vibration.' } },
    )
    fireEvent.change(screen.getByLabelText('Insurance Policy'), {
      target: { value: 'POLICY-42' },
    })
    fireEvent.change(screen.getByLabelText('Expiry'), {
      target: { value: '2027-05-01' },
    })
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Owner Manual & Service Booklet',
      }),
    )
    clickRegisterButton()

    expect(
      screen.getByText('Rivian 330i M Sport LCI (2022)'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Customer reports a steering vibration.'),
    ).toBeInTheDocument()
    expect(screen.getByText('POLICY-42 · Exp: 2027-05-01')).toBeInTheDocument()
    expect(
      screen.getByText('Handover checklist: 4 of 4 items checked'),
    ).toBeInTheDocument()
  })

  it('maps electric fuel selection to the backend ev value', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Electric' }))
    clickRegisterButton()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Register' }))

    await waitFor(() => {
      expect(createCustomerVehicle).toHaveBeenCalledWith(
        'test-token',
        '44',
        expect.objectContaining({ fuel_type: 'ev' }),
      )
    })
  })

  it('keeps API errors visible in the confirmation preview', async () => {
    jest
      .mocked(createCustomerVehicle)
      .mockRejectedValue(
        new ApiError('Registration already exists.', 409, 'request_failed'),
      )
    renderPage()
    clickRegisterButton()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Register' }))

    expect(
      await screen.findByText('Registration already exists.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Confirm Vehicle Registration' }),
    ).toBeInTheDocument()
  })

  it('prevents submission when the customer context is missing', () => {
    renderPage({ customerState: null })
    clickRegisterButton()

    expect(
      screen.getByText('Open vehicle registration from a customer profile.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Confirm Vehicle Registration' }),
    ).not.toBeInTheDocument()
    expect(createCustomerVehicle).not.toHaveBeenCalled()
  })

  it('prevents submission when the session token is missing', () => {
    renderPage({ accessToken: null })
    clickRegisterButton()

    expect(
      screen.getByText('Your session has expired. Sign in again.'),
    ).toBeInTheDocument()
    expect(createCustomerVehicle).not.toHaveBeenCalled()
  })

  it('rejects invalid odometer values before opening the preview', () => {
    renderPage()
    fireEvent.change(screen.getByDisplayValue('18450'), {
      target: { value: '0' },
    })
    clickRegisterButton()

    expect(
      screen.getByText('Enter an odometer reading greater than zero.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Confirm Vehicle Registration' }),
    ).not.toBeInTheDocument()
    expect(createCustomerVehicle).not.toHaveBeenCalled()
  })
})

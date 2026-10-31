import { Alert, Box, Snackbar } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { ApiError } from '@app/api/client'
import {
  createCustomerVehicle,
  type CreateVehicleRequest,
} from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'
import { AppBreadcrumbs } from '@app/components/navigation/AppBreadcrumbs'
import { VehicleIdentificationSection } from '@app/pages/Vehicles/components/VehicleIdentificationSection'
import { VehicleIntakeSection } from '@app/pages/Vehicles/components/VehicleIntakeSection'
import { VehicleOwnershipSection } from '@app/pages/Vehicles/components/VehicleOwnershipSection'
import { VehicleRegistrationActions } from '@app/pages/Vehicles/components/VehicleRegistrationActions'
import { VehicleRegistrationHeader } from '@app/pages/Vehicles/components/VehicleRegistrationHeader'
import {
  VehicleRegistrationPreviewDialog,
  type VehicleRegistrationPreview,
} from '@app/pages/Vehicles/components/VehicleRegistrationPreviewDialog'
import { VehicleRegistryBanner } from '@app/pages/Vehicles/components/VehicleRegistryBanner'
import { VehicleTechnicalSection } from '@app/pages/Vehicles/components/VehicleTechnicalSection'

const sampleCustomer: CustomerProfileState = {
  address: 'Bay Area Depot #4',
  email: 'r.harrison@business.com',
  id: 9842,
  mobileNumber: '+1 (555) 234-8902',
  name: 'Robert Harrison',
}

const vehicleTypeValues = ['private', 'commercial'] as const
const fuelTypeValues = ['petrol', 'diesel', 'ev', 'cng', 'hybrid'] as const
const transmissionValues = ['manual', 'semi_automatic', 'automatic'] as const

function isOneOf<T extends string>(
  value: string,
  options: readonly T[],
): value is T {
  return options.some((option) => option === value)
}

export function RegisterVehiclePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { customerId } = useParams()
  const { accessToken } = useAuth()
  const navigationCustomer = (
    location.state as { customer?: CustomerProfileState } | null
  )?.customer
  const customer = navigationCustomer ?? sampleCustomer
  const requestCustomerId = customerId ?? navigationCustomer?.id?.toString()
  const [fuelType, setFuelType] =
    useState<CreateVehicleRequest['fuel_type']>('petrol')
  const [notice, setNotice] = useState('')
  const [noticeSeverity, setNoticeSeverity] = useState<'success' | 'info'>(
    'info',
  )
  const [requestError, setRequestError] = useState<string | null>(null)
  const [preview, setPreview] = useState<VehicleRegistrationPreview | null>(
    null,
  )
  const mutation = useMutation({
    mutationFn: (payload: CreateVehicleRequest) => {
      if (!accessToken)
        throw new Error('Your session has expired. Sign in again.')
      if (!requestCustomerId) {
        throw new Error('Open vehicle registration from a customer profile.')
      }
      return createCustomerVehicle(accessToken, requestCustomerId, payload)
    },
  })

  const showNotice = (message: string) => {
    setNoticeSeverity('info')
    setNotice(message)
  }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRequestError(null)
    if (!requestCustomerId) {
      setRequestError('Open vehicle registration from a customer profile.')
      return
    }
    if (
      !Number.isInteger(Number(requestCustomerId)) ||
      Number(requestCustomerId) < 1
    ) {
      setRequestError('The customer profile identifier is invalid.')
      return
    }
    if (!accessToken) {
      setRequestError('Your session has expired. Sign in again.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const getValue = (name: string) => String(formData.get(name) ?? '').trim()
    const odometer = Number(getValue('odometer'))
    const manufactureYearText = getValue('manufacture_year')
    const engineCapacityText = getValue('engine_capacity')
    const manufactureYear = manufactureYearText
      ? Number(manufactureYearText)
      : null
    const engineCapacity = engineCapacityText
      ? Number(engineCapacityText)
      : null
    const vehicleType = getValue('vehicle_type')
    const selectedFuelType = getValue('fuel_type')
    const transmission = getValue('transmission')

    if (!Number.isInteger(odometer) || odometer <= 0) {
      setRequestError('Enter an odometer reading greater than zero.')
      return
    }
    if (!isOneOf(vehicleType, vehicleTypeValues)) {
      setRequestError('Select a valid vehicle type.')
      return
    }
    if (!isOneOf(selectedFuelType, fuelTypeValues)) {
      setRequestError('Select a valid fuel type.')
      return
    }
    if (!isOneOf(transmission, transmissionValues)) {
      setRequestError('Select a valid transmission type.')
      return
    }
    if (
      (manufactureYear !== null && !Number.isInteger(manufactureYear)) ||
      (engineCapacity !== null && !Number.isInteger(engineCapacity))
    ) {
      setRequestError(
        'Manufacture year and engine capacity must be whole numbers.',
      )
      return
    }
    if (
      (manufactureYear !== null &&
        (manufactureYear < 1970 ||
          manufactureYear > new Date().getFullYear())) ||
      (engineCapacity !== null && engineCapacity < 998)
    ) {
      setRequestError(
        'Manufacture year must be current or earlier, and engine capacity must be at least 998 cc.',
      )
      return
    }

    const payload: CreateVehicleRequest = {
      registration_number: getValue('registration_number'),
      make: getValue('make'),
      model: getValue('model'),
      variant: getValue('variant'),
      vehicle_type: vehicleType,
      fuel_type: selectedFuelType,
      transmission,
      color: getValue('color'),
      vin: getValue('vin'),
      odometer,
      is_active: true,
      manufacture_year: manufactureYear,
      engine_capacity: engineCapacity,
    }

    setPreview({
      payload,
      intakeNotes: getValue('intake_notes'),
      handoverItems: formData
        .getAll('handover_checklist')
        .map((value) => String(value)),
      fuelTankLevel: getValue('fuel_tank_level') || '75',
      insurancePolicy: getValue('insurance_policy'),
      insuranceExpiry: getValue('insurance_expiry'),
    })
  }

  const handleConfirm = async () => {
    if (!preview) return
    setRequestError(null)
    try {
      const vehicle = await mutation.mutateAsync(preview.payload)
      setPreview(null)
      setNoticeSeverity('success')
      setNotice(
        `Vehicle ${vehicle.registration_number} registered successfully.`,
      )
    } catch (error) {
      setRequestError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to register the vehicle. Please try again.',
      )
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        pb: 4,
        px: { xs: 1.5, sm: 2.5, lg: 4 },
        pt: { xs: 2, sm: 2.5 },
      }}
    >
      <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
        <AppBreadcrumbs
          aria-label="Customer navigation"
          items={[
            { label: 'Customers', to: '/customers' },
            {
              label: customer.name,
              to: `/customers/${customer.id ?? customerId ?? ''}`,
            },
            { label: 'New Vehicle' },
          ]}
          sx={{ mb: 3 }}
        />
        <VehicleRegistrationHeader
          customer={customer}
          customerId={customerId}
          isSubmitting={mutation.isPending}
          onNotice={showNotice}
        />
        <VehicleRegistryBanner customer={customer} customerId={customerId} />
        <Box
          component="form"
          id="register-vehicle-form"
          onSubmit={handleSubmit}
          sx={{ display: 'grid', gap: 2 }}
        >
          <input name="fuel_type" type="hidden" value={fuelType} />
          {requestError && !preview && (
            <Alert severity="error">{requestError}</Alert>
          )}
          <VehicleOwnershipSection
            customer={customer}
            customerId={customerId}
            onNotice={showNotice}
          />
          <VehicleIdentificationSection onNotice={showNotice} />
          <VehicleTechnicalSection
            fuelType={fuelType}
            onFuelTypeChange={setFuelType}
          />
          <VehicleIntakeSection />
          <VehicleRegistrationActions
            isSubmitting={mutation.isPending}
            onCancel={() =>
              navigate(`/customers/${customer.id ?? customerId ?? ''}`)
            }
            onNotice={showNotice}
          />
        </Box>
      </Box>
      <Snackbar
        autoHideDuration={3500}
        onClose={() => setNotice('')}
        open={Boolean(notice)}
      >
        <Alert
          onClose={() => setNotice('')}
          severity={noticeSeverity}
          sx={{ width: '100%' }}
        >
          {notice}
        </Alert>
      </Snackbar>
      <VehicleRegistrationPreviewDialog
        customer={customer}
        error={requestError}
        isSubmitting={mutation.isPending}
        onClose={() => {
          if (!mutation.isPending) {
            setPreview(null)
            setRequestError(null)
          }
        }}
        onConfirm={handleConfirm}
        open={Boolean(preview)}
        preview={preview}
      />
    </Box>
  )
}

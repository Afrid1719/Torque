import { Alert, Box, Snackbar } from '@mui/material'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'
import { AppBreadcrumbs } from '@app/components/navigation/AppBreadcrumbs'
import { VehicleIdentificationSection } from '@app/pages/Vehicles/components/VehicleIdentificationSection'
import { VehicleIntakeSection } from '@app/pages/Vehicles/components/VehicleIntakeSection'
import { VehicleOwnershipSection } from '@app/pages/Vehicles/components/VehicleOwnershipSection'
import { VehicleRegistrationActions } from '@app/pages/Vehicles/components/VehicleRegistrationActions'
import { VehicleRegistrationHeader } from '@app/pages/Vehicles/components/VehicleRegistrationHeader'
import { VehicleRegistryBanner } from '@app/pages/Vehicles/components/VehicleRegistryBanner'
import { VehicleTechnicalSection } from '@app/pages/Vehicles/components/VehicleTechnicalSection'

const sampleCustomer: CustomerProfileState = {
  address: 'Bay Area Depot #4',
  email: 'r.harrison@business.com',
  id: 9842,
  mobileNumber: '+1 (555) 234-8902',
  name: 'Robert Harrison',
}

export function RegisterVehiclePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { customerId } = useParams()
  const customer =
    (location.state as { customer?: CustomerProfileState } | null)?.customer ??
    sampleCustomer
  const [fuelType, setFuelType] = useState('petrol')
  const [notice, setNotice] = useState('')

  const showNotice = (message: string) => setNotice(message)
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    showNotice('Vehicle details are ready to register.')
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
          onNotice={showNotice}
        />
        <VehicleRegistryBanner customer={customer} customerId={customerId} />
        <Box
          component="form"
          id="register-vehicle-form"
          onSubmit={handleSubmit}
          sx={{ display: 'grid', gap: 2 }}
        >
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
          severity="info"
          sx={{ width: '100%' }}
        >
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  )
}

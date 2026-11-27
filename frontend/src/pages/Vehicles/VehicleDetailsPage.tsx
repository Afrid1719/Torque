import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useLocation, useParams } from 'react-router'
import { ApiError } from '@app/api/client'
import { getVehicle, vehicleQueryKey } from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import { VehicleDetailsHeader } from '@app/pages/Vehicles/components/VehicleDetailsHeader'
import { VehicleDetailsStats } from '@app/pages/Vehicles/components/VehicleDetailsStats'
import { VehicleOwnerCard } from '@app/pages/Vehicles/components/VehicleOwnerCard'
import { VehicleQuickActions } from '@app/pages/Vehicles/components/VehicleQuickActions'
import { VehicleSpecifications } from '@app/pages/Vehicles/components/VehicleSpecifications'
import {
  VehicleActiveJobCard,
  VehicleServiceBayStaff,
  VehicleServiceHistory,
} from '@app/pages/Vehicles/components/VehicleWorkshopStatus'

export function VehicleDetailsPage() {
  const { vehicleId } = useParams()
  const location = useLocation()
  const { accessToken } = useAuth()
  const navigationCustomer = (
    location.state as
      { customer?: { id?: unknown; name?: unknown } } | null | undefined
  )?.customer
  const customerContext =
    navigationCustomer &&
    (typeof navigationCustomer.id === 'number' ||
      typeof navigationCustomer.id === 'string') &&
    typeof navigationCustomer.name === 'string'
      ? {
          id: navigationCustomer.id,
          name: navigationCustomer.name,
        }
      : undefined
  const parsedVehicleId = Number(vehicleId)
  const hasValidVehicleId =
    Number.isSafeInteger(parsedVehicleId) && parsedVehicleId > 0
  const vehicleQuery = useQuery({
    enabled: Boolean(accessToken && hasValidVehicleId),
    queryFn: () => getVehicle(accessToken!, parsedVehicleId),
    queryKey: vehicleQueryKey(vehicleId ?? ''),
  })

  if (!hasValidVehicleId) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Alert
          action={
            <Typography
              component={RouterLink}
              sx={{ color: 'primary.main', fontWeight: 600 }}
              to="/vehicles"
            >
              Back to vehicles
            </Typography>
          }
          severity="error"
        >
          The vehicle ID is invalid.
        </Alert>
      </Box>
    )
  }

  if (vehicleQuery.isPending) {
    return (
      <Box sx={{ display: 'grid', minHeight: 400, placeItems: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading vehicle details...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (vehicleQuery.error) {
    const message =
      vehicleQuery.error instanceof ApiError
        ? vehicleQuery.error.message
        : 'Unable to load vehicle details.'
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Stack spacing={2}>
          <Alert severity="error">{message}</Alert>
          <Typography
            component={RouterLink}
            sx={{ color: 'primary.main', fontWeight: 600 }}
            to="/vehicles"
          >
            Back to vehicles
          </Typography>
        </Stack>
      </Box>
    )
  }

  const vehicle = vehicleQuery.data
  return (
    <Box
      sx={{
        maxWidth: 1440,
        mx: 'auto',
        p: { xs: 2, sm: 2.5, lg: 3 },
        width: '100%',
      }}
    >
      <VehicleDetailsHeader customer={customerContext} vehicle={vehicle} />
      <VehicleDetailsStats vehicle={vehicle} />
      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1.65fr) minmax(280px, 0.9fr)',
          },
        }}
      >
        <Stack spacing={2}>
          <VehicleSpecifications vehicle={vehicle} />
          <VehicleActiveJobCard />
          <VehicleServiceHistory />
        </Stack>
        <Stack spacing={2}>
          <VehicleOwnerCard vehicle={vehicle} />
          <VehicleServiceBayStaff />
          <VehicleQuickActions />
        </Stack>
      </Box>
    </Box>
  )
}

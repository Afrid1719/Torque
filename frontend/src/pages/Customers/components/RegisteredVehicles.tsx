import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'

export function RegisteredVehicles({
  customerId,
  error,
  isLoading,
  onAddVehicle,
  vehicles,
}: {
  customerId?: number | string
  error?: string | null
  isLoading?: boolean
  onAddVehicle?: () => void
  vehicles: Vehicle[]
}) {
  return (
    <Card variant="outlined">
      <CardHeader
        action={
          <Button
            onClick={onAddVehicle}
            size="small"
            startIcon={<AddCircleOutlineIcon />}
          >
            Add New
          </Button>
        }
        slotProps={{ title: { variant: 'overline' } }}
        title="Registered Vehicles"
      />
      <Divider />
      {error ? (
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      ) : isLoading ? (
        <CardContent sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
          <CircularProgress size={20} />
          <Typography color="text.secondary" variant="body2">
            Loading registered vehicles...
          </Typography>
        </CardContent>
      ) : vehicles.length === 0 ? (
        <CardContent sx={{ py: 5, textAlign: 'center' }}>
          <DirectionsCarOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
          <Typography sx={{ mt: 1 }} variant="h6">
            No vehicles registered
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Add the customer’s first vehicle to begin creating job cards.
          </Typography>
        </CardContent>
      ) : (
        <CardContent sx={{ py: 1 }}>
          <Stack divider={<Divider flexItem />} spacing={0}>
            {vehicles.slice(0, 3).map((vehicle) => (
              <Box
                key={vehicle.id}
                sx={{
                  alignItems: 'center',
                  display: 'grid',
                  gap: { xs: 1.5, sm: 2 },
                  gridTemplateColumns: { xs: '64px 1fr', sm: '78px 1fr auto' },
                  py: 2,
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    color: 'text.secondary',
                    display: 'flex',
                    height: 52,
                    justifyContent: 'center',
                    width: 78,
                    maxWidth: '100%',
                  }}
                >
                  <DirectionsCarOutlinedIcon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
                    {[vehicle.make, vehicle.model, vehicle.variant]
                      .filter(Boolean)
                      .join(' ')}
                  </Typography>
                  <Stack
                    sx={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Chip
                      label={vehicle.registration_number}
                      size="small"
                      sx={{ borderRadius: 0.5, height: 20 }}
                    />
                    <Typography color="text.secondary" variant="caption">
                      {vehicle.manufacture_year ?? 'Year unavailable'} •{' '}
                      {vehicle.odometer.toLocaleString()} km
                    </Typography>
                  </Stack>
                </Box>
                <Chip
                  color={vehicle.is_active ? 'success' : 'default'}
                  label={vehicle.is_active ? 'READY' : 'INACTIVE'}
                  size="small"
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    gridColumn: { xs: '2', sm: 'auto' },
                    justifySelf: 'start',
                  }}
                  variant="filled"
                />
              </Box>
            ))}
          </Stack>
          {vehicles.length > 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Button
                component={RouterLink}
                size="small"
                to={
                  customerId
                    ? `/vehicles?customerId=${encodeURIComponent(String(customerId))}`
                    : '/vehicles'
                }
              >
                More
              </Button>
            </Box>
          )}
        </CardContent>
      )}
    </Card>
  )
}

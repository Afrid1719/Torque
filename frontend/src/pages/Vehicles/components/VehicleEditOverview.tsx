import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { VehicleDetailsSection } from '@app/pages/Vehicles/components/VehicleDetailsSection'
import type { VehicleEditValues } from '@app/pages/Vehicles/components/vehicleEditForm'
import workshopImage from '@app/assets/workshop-login.webp'

export function VehicleEditOverview({ values }: { values: VehicleEditValues }) {
  const isActive = values.is_active === 'true'

  return (
    <Stack spacing={2}>
      <VehicleDetailsSection
        icon={<DirectionsCarOutlinedIcon fontSize="small" />}
        title="Vehicle Snapshot"
      >
        <Box
          aria-label="Generic workshop image, not this vehicle"
          role="img"
          sx={{
            backgroundColor: '#dce5ef',
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.18)), url(${workshopImage})`,
            backgroundPosition: 'center 55%',
            backgroundSize: 'cover',
            borderRadius: 1.5,
            height: 150,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Chip
            label="GENERIC WORKSHOP IMAGE"
            size="small"
            sx={{
              bgcolor: 'rgba(25, 32, 40, 0.82)',
              borderRadius: 0.5,
              color: '#fff',
              fontSize: 8,
              fontWeight: 700,
              left: 8,
              position: 'absolute',
              top: 8,
            }}
          />
          <Chip
            label={values.registration_number}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.94)',
              bottom: 8,
              fontFamily: 'monospace',
              fontSize: 9,
              fontWeight: 700,
              position: 'absolute',
              right: 8,
            }}
          />
        </Box>
        <Stack spacing={0.75}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontWeight: 700 }} variant="body2">
              {values.make} {values.model} {values.variant}
            </Typography>
            <Chip
              color={isActive ? 'success' : 'default'}
              label={isActive ? 'In service' : 'Inactive'}
              size="small"
              sx={{ fontSize: 10 }}
            />
          </Stack>
          <Typography color="text.secondary" variant="caption">
            {values.manufacture_year || 'Year not recorded'} ·{' '}
            {values.vehicle_type}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {values.fuel_type.toUpperCase()} ·{' '}
            {values.transmission.replaceAll('_', ' ').toUpperCase()}
          </Typography>
        </Stack>
      </VehicleDetailsSection>
      <VehicleDetailsSection
        icon={<VerifiedOutlinedIcon fontSize="small" />}
        title="Record Information"
      >
        <Stack spacing={1.25}>
          <Box>
            <Typography color="text.secondary" variant="caption">
              VEHICLE IDENTIFICATION NUMBER
            </Typography>
            <Typography
              sx={{ fontSize: 12, fontWeight: 600, overflowWrap: 'anywhere' }}
            >
              {values.vin}
            </Typography>
          </Box>
          <Box>
            <Typography color="text.secondary" variant="caption">
              CURRENT ODOMETER
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
              {Number(values.odometer).toLocaleString()} km
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ fontSize: 11 }}>
            Vehicle details are saved to the workshop record when you submit
            your changes.
          </Typography>
        </Stack>
      </VehicleDetailsSection>
    </Stack>
  )
}

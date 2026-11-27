import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { Box, Card, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleCard } from '@app/pages/Vehicles/components/VehicleCard'
import { vehicleStatuses } from '@app/pages/Vehicles/components/vehicleListConfig'

export function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: 'repeat(1, minmax(0, 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
          xl: 'repeat(4, minmax(0, 1fr))',
        },
      }}
    >
      {vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          status={vehicleStatuses[index % vehicleStatuses.length]}
          vehicle={vehicle}
        />
      ))}
      <Card
        variant="outlined"
        sx={{
          alignItems: 'center',
          bgcolor: 'transparent',
          border: '1px dashed #b9c3cf',
          display: 'flex',
          justifyContent: 'center',
          minHeight: 230,
          p: 2,
        }}
      >
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
          <Box
            aria-label="Register a new vehicle"
            component={RouterLink}
            sx={{
              alignItems: 'center',
              bgcolor: '#e5efff',
              borderRadius: 1,
              color: 'primary.main',
              display: 'flex',
              height: 36,
              justifyContent: 'center',
              textDecoration: 'none',
              width: 36,
            }}
            to="/vehicles/new"
          >
            <AddCircleOutlineIcon />
          </Box>
          <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
            Register New Vehicle
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 210, textAlign: 'center' }}
            variant="caption"
          >
            Register a new vehicle in the vehicle registry.
          </Typography>
        </Stack>
      </Card>
    </Box>
  )
}

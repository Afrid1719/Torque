import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import { Box, Typography } from '@mui/material'
import type { Vehicle } from '@app/api/vehicles'
import { fuelTypeLabels } from '@app/pages/Vehicles/components/vehicleListConfig'
import { VehicleDetailsSection } from '@app/pages/Vehicles/components/VehicleDetailsSection'

function formatValue(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === ''
    ? 'Not recorded'
    : String(value)
}

export function VehicleSpecifications({ vehicle }: { vehicle: Vehicle }) {
  const specifications = [
    ['Registration No.', vehicle.registration_number],
    ['VIN / Chassis Number', vehicle.vin],
    ['Make & Model', `${vehicle.make} ${vehicle.model}`],
    ['Trim / Variant', vehicle.variant],
    ['Manufacture Year', vehicle.manufacture_year],
    ['Body Type', 'Not recorded'],
    ['Vehicle Type', vehicle.vehicle_type],
    [
      'Fuel Type',
      fuelTypeLabels[vehicle.fuel_type.toLowerCase()] ?? vehicle.fuel_type,
    ],
    [
      'Engine Displacement',
      vehicle.engine_capacity
        ? `${vehicle.engine_capacity.toLocaleString()} cc`
        : null,
    ],
    ['Transmission', vehicle.transmission.replaceAll('_', ' ')],
    ['Exterior Paint', vehicle.color],
    ['Logged Odometer', `${vehicle.odometer.toLocaleString()} km`],
  ] as const

  return (
    <VehicleDetailsSection
      icon={<DirectionsCarOutlinedIcon fontSize="small" />}
      title="Vehicle Specifications & Master Record"
    >
      <Box
        sx={{
          bgcolor: '#f4f6f8',
          borderRadius: 1,
          display: 'grid',
          gap: { xs: 1, sm: 1.5 },
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, max-content)',
            lg: 'repeat(3, max-content)',
          },
          justifyContent: 'space-between',
          p: { xs: 1.25, sm: 1.5 },
          width: '100%',
        }}
      >
        {specifications.map(([label, value]) => (
          <Box key={label} sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ fontSize: 10, mb: 0.2 }}>
              {label}
            </Typography>
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: 12,
                fontWeight: 600,
                textTransform:
                  label === 'Body Type' || label === 'Vehicle Type'
                    ? 'capitalize'
                    : 'none',
                overflowWrap: 'anywhere',
              }}
            >
              {formatValue(value)}
            </Typography>
          </Box>
        ))}
      </Box>
    </VehicleDetailsSection>
  )
}

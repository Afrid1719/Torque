import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import { Box, Card, Stack, Tooltip, Typography } from '@mui/material'
import type { Vehicle } from '@app/api/vehicles'
import {
  nextServiceTarget,
  serviceBayStaff,
} from '@app/pages/Vehicles/vehicleDetailsDemoData'

export function VehicleDetailsStats({ vehicle }: { vehicle: Vehicle }) {
  const stats = [
    {
      label: 'WORKSHOP LOCATION',
      value: serviceBayStaff.bay,
      icon: HomeWorkOutlinedIcon,
      color: '#0058be',
    },
    {
      label: 'ASSIGNED TECH',
      value: serviceBayStaff.technician,
      icon: EngineeringOutlinedIcon,
      color: '#087443',
    },
    {
      label: 'CURRENT ODOMETER',
      value: `${vehicle.odometer.toLocaleString()} km`,
      icon: SpeedOutlinedIcon,
      color: '#0058be',
    },
    {
      label: 'NEXT SERVICE TARGET',
      value: nextServiceTarget,
      icon: EventOutlinedIcon,
      color: '#59616d',
    },
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: 'repeat(1, minmax(0, 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        mb: 2,
      }}
    >
      {stats.map(({ color, icon: Icon, label, value }) => (
        <Card
          key={label}
          variant="outlined"
          sx={{
            borderColor: '#e1e6ed',
            borderRadius: 1.5,
            boxShadow: '0 2px 6px rgba(25, 38, 58, 0.04)',
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: 'center', minHeight: 64, px: 1.5, py: 1 }}
          >
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: `${color}14`,
                borderRadius: 1,
                color,
                display: 'flex',
                height: 36,
                justifyContent: 'center',
                width: 40,
              }}
            >
              <Icon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                color="text.secondary"
                sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.35 }}
              >
                {label}
              </Typography>
              <Tooltip title={value} placement="top">
                <Typography noWrap sx={{ fontWeight: 700 }} variant="body2">
                  {value}
                </Typography>
              </Tooltip>
            </Box>
          </Stack>
        </Card>
      ))}
    </Box>
  )
}

import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import { keyframes } from '@emotion/react'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { AppBreadcrumbs } from '@app/components/navigation/AppBreadcrumbs'

const statusDotPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.35);
  }
`

type VehicleDetailsHeaderProps = {
  customer?: { id: number | string; name: string }
  vehicle: Vehicle
}

function VehicleStatusChip({ isActive }: { isActive: boolean }) {
  return (
    <Chip
      icon={
        isActive ? (
          <Box
            aria-hidden="true"
            sx={{
              animation: `${statusDotPulse} 1.6s ease-in-out infinite`,
              bgcolor: '#087443',
              borderRadius: '50%',
              height: 6,
              width: 6,
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          />
        ) : undefined
      }
      label={isActive ? 'IN SERVICE' : 'INACTIVE'}
      size="small"
      sx={{
        bgcolor: isActive ? '#dff4e9' : '#f1f2f4',
        color: isActive ? '#087443' : '#59616d',
        fontSize: 9,
        fontWeight: 700,
        height: 20,
        '& .MuiChip-icon': {
          ml: 0.75,
          mr: -0.5,
        },
      }}
    />
  )
}

export function VehicleDetailsHeader({
  customer,
  vehicle,
}: VehicleDetailsHeaderProps) {
  const breadcrumbItems = customer
    ? [
        { label: 'Customers', to: '/customers' },
        { label: customer.name, to: `/customers/${customer.id}` },
        { label: vehicle.registration_number },
      ]
    : [
        { label: 'Vehicles', to: '/vehicles' },
        { label: vehicle.registration_number },
      ]

  return (
    <Box sx={{ mb: 2.5 }}>
      <AppBreadcrumbs
        ariaLabel="Vehicle navigation"
        items={breadcrumbItems}
        sx={{ mb: 1.5 }}
      />
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { md: 'center' } }}
        >
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: '#e8eaed',
              borderRadius: 1,
              display: 'flex',
              flexShrink: 0,
              gap: 1,
              px: 1.25,
              py: 0.75,
            }}
          >
            <Typography
              color="text.secondary"
              sx={{ fontSize: 9, fontWeight: 600 }}
            >
              IND
            </Typography>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              {vehicle.registration_number}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography
              component="h1"
              sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 750 }}
            >
              {vehicle.manufacture_year ? `${vehicle.manufacture_year} ` : ''}
              {vehicle.make} {vehicle.model} {vehicle.variant}
            </Typography>
            <Chip
              label={`VEHICLE TYPE · ${vehicle.vehicle_type.toUpperCase()}`}
              size="small"
              sx={{
                bgcolor: '#dce8f8',
                color: '#315b93',
                fontSize: 9,
                fontWeight: 700,
                height: 20,
              }}
            />
            <VehicleStatusChip isActive={vehicle.is_active} />
          </Stack>
        </Stack>
        <Typography color="text.secondary" sx={{ fontSize: 11 }}>
          VIN: {vehicle.vin} · {vehicle.fuel_type.toUpperCase()} ·{' '}
          {vehicle.transmission.replaceAll('_', ' ').toUpperCase()}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Button
            onClick={() => window.print()}
            startIcon={<PrintOutlinedIcon />}
            sx={{ bgcolor: '#fff', borderColor: '#d5dce6' }}
            variant="outlined"
          >
            Print Summary
          </Button>
          <Button
            component={RouterLink}
            startIcon={<EditOutlinedIcon />}
            to={`/vehicles/${vehicle.id}/edit`}
            variant="outlined"
          >
            Edit Vehicle
          </Button>
          <Button
            component={RouterLink}
            startIcon={<AddOutlinedIcon />}
            to="/job-cards"
            variant="contained"
          >
            New Job Card
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

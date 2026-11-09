import { keyframes } from '@emotion/react'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import {
  fuelTypeLabels,
  vehicleStatuses,
} from '@app/pages/Vehicles/components/vehicleListConfig'
import { VehicleDetailsDialog } from '@app/pages/Vehicles/components/VehicleDetailsDialog'
import workshopImage from '@app/assets/workshop-login.webp'

const statusDotPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.4);
  }
`

export function VehicleCard({
  vehicle,
  status,
}: {
  vehicle: Vehicle
  status: (typeof vehicleStatuses)[number]
}) {
  const normalizedFuelType = vehicle.fuel_type.toLowerCase()
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderColor: '#cbd3df',
        borderRadius: 1.5,
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(25, 28, 30, 0.1)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: '#dce5ef',
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.06), rgba(15, 23, 42, 0.12)), url(${workshopImage})`,
          backgroundPosition: 'center 55%',
          backgroundSize: 'cover',
          height: 126,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Chip
          icon={
            status.label === 'IN SERVICE' ? (
              <Box
                aria-hidden="true"
                sx={{
                  animation: `${statusDotPulse} 1.6s ease-in-out infinite`,
                  bgcolor: status.color,
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
          label={status.label}
          size="small"
          sx={{
            bgcolor: status.background,
            color: status.color,
            borderRadius: 0.75,
            fontSize: 9,
            fontWeight: 700,
            height: 22,
            position: 'absolute',
            right: 6,
            top: 6,
          }}
        />
        <Chip
          label={vehicle.registration_number}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.94)',
            borderRadius: 0.5,
            bottom: 6,
            color: '#191c1e',
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: 700,
            height: 20,
            left: 6,
            position: 'absolute',
          }}
        />
      </Box>
      <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Stack spacing={0.75}>
          <Stack
            spacing={0.5}
            sx={{ alignItems: 'flex-start', flexDirection: 'row' }}
          >
            <Typography
              noWrap
              sx={{
                flex: 1,
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.25,
                minWidth: 0,
              }}
              title={`${vehicle.make} ${vehicle.model} ${vehicle.variant}`}
              component={RouterLink}
              to={`/vehicles/${vehicle.id}`}
              color="inherit"
              style={{ textDecoration: 'none' }}
            >
              {vehicle.make} {vehicle.model}
            </Typography>
            <Chip
              label={status.bay}
              size="small"
              sx={{
                bgcolor: status.bayBackground,
                borderRadius: 0.5,
                color: status.color,
                flexShrink: 0,
                fontSize: 10,
                height: 22,
                '& .MuiChip-label': { px: 0.85 },
              }}
            />
          </Stack>
          <Typography color="text.secondary" noWrap variant="caption">
            {vehicle.manufacture_year ?? 'Year unavailable'} · {vehicle.variant}{' '}
            · {fuelTypeLabels[normalizedFuelType] ?? vehicle.fuel_type}
          </Typography>
          <Box
            sx={{
              bgcolor:
                status.label === 'CRITICAL ALERT'
                  ? '#fff1f0'
                  : status.label === 'IN SERVICE'
                    ? '#eef5ff'
                    : status.label === 'READY FOR PICKUP'
                      ? '#ecfbf3'
                      : '#f4f6f8',
              border: '1px solid',
              borderColor:
                status.label === 'CRITICAL ALERT'
                  ? '#ffc9c6'
                  : status.label === 'IN SERVICE'
                    ? '#c8ddff'
                    : status.label === 'READY FOR PICKUP'
                      ? '#bcebd2'
                      : '#e1e5ea',
              borderRadius: 0.75,
              mt: 0.25,
              p: 0.65,
            }}
          >
            <Stack
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                noWrap
                sx={{ color: status.color, fontSize: 9, fontWeight: 700 }}
              >
                {status.jobReference}
              </Typography>
              <Typography
                noWrap
                sx={{ color: status.color, fontSize: 8, fontWeight: 600 }}
              >
                {status.jobStatus}
              </Typography>
            </Stack>
            <Typography
              noWrap
              sx={{ fontSize: 10, lineHeight: 1.35 }}
              title={status.jobDescription}
            >
              {status.jobDescription}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: '1fr 1fr',
              py: 0.25,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 10, fontWeight: 600 }}>
                {vehicle.odometer.toLocaleString()} km
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0, textAlign: 'right' }}>
              <Typography
                noWrap
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                Vehicle Type: {vehicle.vehicle_type}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              alignItems: 'center',
              columnGap: 0.75,
              display: 'grid',
              gridTemplateColumns: '24px minmax(0, 1fr) 20px',
              minHeight: 30,
              py: 0.25,
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#dce8f2',
                color: '#38566d',
                fontSize: 10,
                fontWeight: 700,
                height: 24,
                width: 24,
              }}
            >
              {vehicle.customer?.name
                .split(' ')
                .map((part) => part[0])
                .join('') ?? '—'}
            </Avatar>
            <Stack spacing={0.1} sx={{ minWidth: 0 }}>
              {vehicle.customer ? (
                <Link
                  component={RouterLink}
                  noWrap
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    lineHeight: '16px',
                  }}
                  to={`/customers/${vehicle.customer.id}`}
                  underline="hover"
                >
                  {vehicle.customer.name}
                </Link>
              ) : (
                <Typography
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: 10, fontWeight: 600, lineHeight: '16px' }}
                >
                  No customer assigned
                </Typography>
              )}
              {vehicle.customer?.mobile_number && (
                <Typography
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: 9, lineHeight: '12px' }}
                >
                  {vehicle.customer.mobile_number}
                </Typography>
              )}
            </Stack>
            {vehicle.customer ? (
              <IconButton
                aria-label={`Open customer profile for ${vehicle.customer.name}`}
                component={RouterLink}
                size="small"
                sx={{ p: 0.25 }}
                to={`/customers/${vehicle.customer.id}`}
              >
                <OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            ) : (
              <Box sx={{ width: 20 }} />
            )}
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 0.5,
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              pt: 0.35,
            }}
          >
            <Button
              fullWidth
              onClick={() => setDetailsOpen(true)}
              size="small"
              sx={{
                borderRadius: 0.75,
                borderColor: '#cbd3df',
                color: '#334155',
                height: 40,
                minWidth: 0,
                px: 0.75,
              }}
              variant="outlined"
            >
              Details
            </Button>
            <Button
              component={RouterLink}
              fullWidth
              size="small"
              sx={{
                bgcolor: status.actionColor,
                borderRadius: 0.75,
                color: '#fff',
                height: 40,
                lineHeight: 1.2,
                minWidth: 0,
                px: 0.75,
                whiteSpace: 'normal',
                '&:hover': {
                  bgcolor: status.actionColor,
                  filter: 'brightness(0.9)',
                },
              }}
              to="/job-cards"
              variant="contained"
            >
              {status.actionLabel}
            </Button>
          </Box>
        </Stack>
      </CardContent>
      <VehicleDetailsDialog
        onClose={() => setDetailsOpen(false)}
        vehicle={detailsOpen ? vehicle : null}
      />
    </Card>
  )
}

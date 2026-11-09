import CallOutlinedIcon from '@mui/icons-material/CallOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import { Avatar, Box, Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleDetailsSection } from '@app/pages/Vehicles/components/VehicleDetailsSection'

export function VehicleOwnerCard({ vehicle }: { vehicle: Vehicle }) {
  const owner = vehicle.customer
  const initials =
    owner?.name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? '—'

  return (
    <VehicleDetailsSection
      action={
        owner && (
          <Box
            sx={{
              bgcolor: '#e8eaed',
              borderRadius: 0.5,
              color: '#424754',
              fontSize: 9,
              fontWeight: 700,
              lineHeight: 1.2,
              px: 0.75,
              py: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            CUST-{owner.id}
          </Box>
        )
      }
      icon={<PersonOutlineOutlinedIcon fontSize="small" />}
      title="Registered Owner"
    >
      {owner ? (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: '#53657f',
                fontSize: 13,
                fontWeight: 700,
                height: 42,
                width: 42,
              }}
            >
              {initials}
            </Avatar>
            <Stack spacing={0.25}>
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                {owner.name}
              </Typography>
              <Typography
                sx={{
                  color: '#087443',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 0.35,
                }}
              >
                REGISTERED CUSTOMER
              </Typography>
            </Stack>
          </Stack>
          <Stack
            spacing={0.75}
            sx={{ bgcolor: '#f4f6f8', borderRadius: 1, p: 1.25 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CallOutlinedIcon
                sx={{ color: 'text.secondary', fontSize: 15 }}
              />
              <Typography variant="caption">{owner.mobile_number}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <EmailOutlinedIcon
                sx={{ color: 'text.secondary', fontSize: 15 }}
              />
              <Typography
                color={owner.email ? 'text.primary' : 'text.secondary'}
                noWrap
                title={owner.email ?? 'Email not provided'}
                variant="caption"
              >
                {owner.email ?? 'Email not provided'}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              component="a"
              href={`tel:${owner.mobile_number.replace(/[^\d+]/g, '')}`}
              startIcon={<CallOutlinedIcon />}
              size="small"
              sx={{
                bgcolor: '#f1f3f5',
                color: 'text.primary',
                flex: 1,
                height: 30,
                minHeight: 30,
                minWidth: 0,
                px: 1,
                py: 0,
                whiteSpace: 'nowrap',
              }}
              variant="contained"
            >
              Call / SMS
            </Button>
            <Button
              component={RouterLink}
              endIcon={<OpenInNewOutlinedIcon />}
              size="small"
              sx={{
                flex: 1,
                height: 30,
                minHeight: 30,
                minWidth: 0,
                px: 1,
                py: 0,
                whiteSpace: 'nowrap',
              }}
              to={`/customers/${owner.id}`}
              variant="contained"
            >
              Profile
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Typography color="text.secondary" variant="body2">
          No customer is currently assigned to this vehicle.
        </Typography>
      )}
    </VehicleDetailsSection>
  )
}

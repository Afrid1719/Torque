import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined'
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import { VehicleFormSection } from '@app/pages/Vehicles/components/VehicleFormSection'

export function VehicleEditOwnershipSection({
  onNotice,
  vehicle,
}: {
  onNotice: (message: string) => void
  vehicle: Vehicle
}) {
  const owner = vehicle.customer
  const initials =
    owner?.name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '—'

  return (
    <VehicleFormSection
      detail={
        <Chip
          label="MANDATORY FOR BILLING"
          size="small"
          sx={{
            bgcolor: '#ffe1df',
            borderRadius: 0.5,
            color: '#b4232f',
            fontSize: 9,
            fontWeight: 800,
            height: 22,
            letterSpacing: 0.2,
          }}
        />
      }
      icon={<PersonOutlineOutlinedIcon fontSize="small" />}
      title="Customer Ownership & Assignment"
    >
      {owner ? (
        <Stack spacing={1.5}>
          <Box
            sx={{
              alignItems: { xs: 'flex-start', lg: 'center' },
              bgcolor: '#f1f3f5',
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 1.5,
              justifyContent: 'space-between',
              p: 1.5,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', minWidth: 0 }}
            >
              <Avatar
                sx={{
                  bgcolor: '#53657f',
                  fontSize: 13,
                  fontWeight: 700,
                  height: 48,
                  width: 48,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                    {owner.name}
                  </Typography>
                  <Chip
                    label={`#CUST-${owner.id}`}
                    size="small"
                    sx={{
                      bgcolor: '#dce8f8',
                      color: '#315b93',
                      fontSize: 9,
                      fontWeight: 700,
                      height: 19,
                    }}
                  />
                  <Chip
                    label="REGISTERED CUSTOMER"
                    size="small"
                    sx={{
                      bgcolor: '#d8f3e5',
                      color: '#087443',
                      fontSize: 8,
                      fontWeight: 700,
                      height: 19,
                    }}
                  />
                </Stack>
                <Stack
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    color: 'text.secondary',
                    flexWrap: 'wrap',
                    columnGap: 1.5,
                    rowGap: 0.5,
                    mt: 0.75,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontSize: 11 }}>
                      {owner.mobile_number}
                    </Typography>
                  </Stack>
                  {owner.email && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: 'center' }}
                    >
                      <MailOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                      <Typography sx={{ fontSize: 11 }}>
                        {owner.email}
                      </Typography>
                    </Stack>
                  )}
                  {owner.address && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: 'center' }}
                    >
                      <PlaceOutlinedIcon sx={{ fontSize: 14 }} />
                      <Typography sx={{ fontSize: 11 }}>
                        {owner.address}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center', flexShrink: 0 }}
            >
              <Tooltip
                describeChild
                title="Customer reassignment is not supported yet."
              >
                <Button
                  onClick={() =>
                    onNotice(
                      'Customer reassignment is not supported yet. The current owner has not been changed.',
                    )
                  }
                  size="small"
                  startIcon={<PersonAddAltOutlinedIcon />}
                  sx={{
                    bgcolor: '#e1e4e8',
                    color: 'text.primary',
                    minWidth: 0,
                    px: 1,
                  }}
                  variant="contained"
                >
                  Change / Reassign
                </Button>
              </Tooltip>
              <Tooltip
                describeChild
                title="Owner unlinking is not supported yet."
              >
                <Button
                  aria-label="Unlink customer"
                  onClick={() =>
                    onNotice(
                      'Customer unlinking is not supported yet. The current owner has not been changed.',
                    )
                  }
                  sx={{ color: 'text.secondary', minWidth: 34, px: 0.5 }}
                >
                  <LinkOffOutlinedIcon fontSize="small" />
                </Button>
              </Tooltip>
            </Stack>
          </Box>
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: '#f1f3f5',
              borderRadius: 1,
              color: '#315b93',
              display: 'flex',
              gap: 1,
              px: 1.25,
              py: 1,
            }}
          >
            <PersonOutlineOutlinedIcon fontSize="small" />
            <Typography sx={{ fontSize: 11 }}>
              Customer reassignment is unavailable here. The current owner
              remains assigned until that workflow is supported.
            </Typography>
            <Button
              component={RouterLink}
              size="small"
              sx={{ flexShrink: 0, ml: 'auto' }}
              to={`/customers/${owner.id}`}
            >
              Profile
            </Button>
          </Box>
        </Stack>
      ) : (
        <Typography color="text.secondary" variant="body2">
          No customer is currently assigned to this vehicle.
        </Typography>
      )}
    </VehicleFormSection>
  )
}

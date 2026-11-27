import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'
import { VehicleFormSection } from '@app/pages/Vehicles/components/VehicleFormSection'

export function VehicleOwnershipSection({
  customer,
  customerId,
  onNotice,
}: {
  customer: CustomerProfileState
  customerId?: string
  onNotice: (message: string) => void
}) {
  const identifier = customer.id ?? customerId ?? '9842'
  const initials = customer.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <VehicleFormSection
      detail="Mandatory for billing"
      icon={<PersonOutlineOutlinedIcon fontSize="small" />}
      title="1. Customer Ownership & Assignment"
    >
      <Box
        sx={{
          alignItems: { xs: 'flex-start', md: 'center' },
          bgcolor: '#f3f5f8',
          borderRadius: 1.5,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
          justifyContent: 'space-between',
          p: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: '#dce8ff',
              borderRadius: 1.5,
              color: 'primary.dark',
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                {customer.name}
              </Typography>
              <Chip
                color="primary"
                label={`#CUST-${identifier}`}
                size="small"
                sx={{ height: 18, fontSize: 9 }}
              />
              <Chip
                color="success"
                label="Customer Since 2019"
                size="small"
                sx={{ height: 18, fontSize: 9 }}
              />
            </Stack>
            <Typography color="text.secondary" sx={{ fontSize: 11, mt: 0.5 }}>
              ☎ {customer.mobileNumber}
              {customer.email && <> &nbsp;&nbsp; · &nbsp; {customer.email}</>}
              {customer.address && (
                <> &nbsp;&nbsp; · &nbsp; {customer.address}</>
              )}
            </Typography>
          </Box>
        </Stack>
        <Button
          onClick={() =>
            onNotice('Customer assignment controls will be available soon.')
          }
          size="small"
          startIcon={<TuneOutlinedIcon />}
          sx={{ bgcolor: '#fff', flexShrink: 0 }}
          variant="outlined"
        >
          Change / Unlink
        </Button>
      </Box>
      <Typography
        color="text.secondary"
        sx={{ fontSize: 11, lineHeight: 1.5, mt: 1 }}
      >
        If registering unassigned workshop inventory, insurance salvage, or a
        quick drive-in inspection without customer record, ownership can be
        attached prior to billing closure.
      </Typography>
    </VehicleFormSection>
  )
}

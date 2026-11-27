import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'

export function VehicleRegistryBanner({
  customer,
  customerId,
}: {
  customer: CustomerProfileState
  customerId?: string
}) {
  return (
    <Box
      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        bgcolor: '#fff',
        border: '1px solid #e8edf3',
        borderRadius: 2,
        display: 'flex',
        gap: 1.5,
        justifyContent: 'space-between',
        mb: 2,
        p: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: '#dce8ff',
            color: 'primary.dark',
            height: 40,
            width: 40,
          }}
        >
          <DirectionsCarOutlinedIcon />
        </Avatar>
        <Box>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.7,
                textTransform: 'uppercase',
              }}
            >
              Registry mode
            </Typography>
            <Chip
              color="success"
              label="Customer linked"
              size="small"
              sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
            />
          </Stack>
          <Typography color="text.secondary" sx={{ fontSize: 12, mt: 0.25 }}>
            Pre-assigned entry triggered from Customer Master Profile
            {` #CUST-${customer.id ?? customerId ?? '9842'}`}.
          </Typography>
        </Box>
      </Stack>
      <Typography
        color="text.secondary"
        sx={{
          display: { xs: 'none', sm: 'block' },
          fontSize: 10,
          whiteSpace: 'nowrap',
        }}
      >
        TORQUE Spec Engine v0.1&nbsp; ●
      </Typography>
    </Box>
  )
}

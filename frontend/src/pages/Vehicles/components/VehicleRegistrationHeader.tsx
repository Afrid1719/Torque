import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'

import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'

export function VehicleRegistrationHeader({
  isSubmitting,
  onNotice,
}: {
  customer: CustomerProfileState
  customerId?: string
  isSubmitting: boolean
  onNotice: (message: string) => void
}) {
  return (
    <Box
      sx={{
        alignItems: { xs: 'flex-start', lg: 'center' },
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2,
        justifyContent: 'space-between',
        mb: 2.5,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="h1" variant="h5">
          Register Vehicle
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
          Enter vehicle specifications, technical parameters, and owner
          assignment for workshop service tracking.
        </Typography>
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'flex-end',
          flexShrink: { lg: 0 },
          width: { xs: '100%', lg: 'auto' },
        }}
      >
        <Button
          disabled={isSubmitting}
          onClick={() => onNotice('Draft saved locally.')}
          size="small"
          sx={{ px: 2 }}
          variant="outlined"
        >
          Save as Draft
        </Button>
        <Button
          disabled={isSubmitting}
          form="register-vehicle-form"
          size="small"
          startIcon={<SaveOutlinedIcon />}
          type="submit"
          variant="contained"
        >
          Save &amp; Register
        </Button>
        <Button
          disabled={isSubmitting}
          form="register-vehicle-form"
          size="small"
          startIcon={<AssignmentTurnedInOutlinedIcon />}
          type="submit"
          variant="contained"
        >
          Register &amp; Open Job Card
        </Button>
      </Stack>
    </Box>
  )
}

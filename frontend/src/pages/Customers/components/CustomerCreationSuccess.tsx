import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import { Box, Card, Typography } from '@mui/material'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'

export function CustomerCreationSuccess({
  customer,
}: {
  customer: CustomerProfileState | null
}) {
  return (
    <Card
      aria-live="polite"
      role="status"
      variant="outlined"
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 500,
        overflow: 'hidden',
        p: { xs: 3, sm: 5 },
        position: 'relative',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'success.main',
          borderRadius: '50%',
          color: 'success.contrastText',
          display: 'flex',
          height: 96,
          justifyContent: 'center',
          mb: 4,
          width: 96,
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 54 }} />
      </Box>
      <Typography component="h2" variant="h4">
        Customer Profile Created Successfully
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 560, mb: 4, mt: 1 }}>
        The customer details have been validated and are ready for the next step
        in the workshop workflow.
      </Typography>
      <Box
        sx={{
          bgcolor: '#f2f4f6',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          maxWidth: 576,
          p: 3,
          textAlign: 'left',
          width: '100%',
        }}
      >
        <Box>
          <Typography color="text.secondary" variant="caption">
            CUSTOMER NAME
          </Typography>
          <Typography sx={{ mt: 0.5 }} variant="h6">
            {customer?.name}
          </Typography>
        </Box>
        <Box>
          <Typography color="text.secondary" variant="caption">
            MOBILE NUMBER
          </Typography>
          <Typography sx={{ mt: 0.5 }} variant="h6">
            {customer?.mobileNumber}
          </Typography>
        </Box>
      </Box>
      <Box
        aria-hidden
        sx={{
          color: 'primary.main',
          opacity: 0.04,
          position: 'absolute',
          right: 24,
          top: 24,
        }}
      >
        <PersonAddOutlinedIcon sx={{ fontSize: 220 }} />
      </Box>
    </Card>
  )
}

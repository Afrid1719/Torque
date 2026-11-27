import {
  Card,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'

export function CustomerCreationLoading() {
  return (
    <Card
      aria-live="polite"
      role="status"
      variant="outlined"
      sx={{ mb: 3, p: 3 }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', color: 'primary.main' }}
          >
            <CircularProgress aria-hidden size={18} thickness={5} />
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}
            >
              REGISTERING CUSTOMER...
            </Typography>
          </Stack>
          <Typography color="text.secondary" variant="caption">
            Processing
          </Typography>
        </Stack>
        <LinearProgress aria-label="Customer registration in progress" />
      </Stack>
    </Card>
  )
}

import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'

export function VehicleRegistrationActions({
  isSubmitting,
  onCancel,
  onNotice,
}: {
  isSubmitting: boolean
  onCancel: () => void
  onNotice: (message: string) => void
}) {
  return (
    <Box
      sx={{
        alignItems: { xs: 'stretch', sm: 'center' },
        bgcolor: '#fff',
        border: '1px solid #e8edf3',
        borderRadius: 2,
        boxShadow: '0 8px 24px rgba(25, 40, 60, 0.1)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.25,
        justifyContent: 'space-between',
        p: 1.5,
        position: 'sticky',
        bottom: 12,
        zIndex: 1,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1.5,
          justifyContent: 'space-between',
        }}
      >
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          size="small"
          startIcon={<CloseOutlinedIcon />}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Typography color="text.secondary" sx={{ fontSize: 10 }}>
          Draft auto-saved 2 mins ago
        </Typography>
      </Stack>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 1, width: { xs: '100%', sm: 'auto' } }}
      >
        <Button
          disabled={isSubmitting}
          onClick={() => onNotice('Draft saved locally.')}
          size="small"
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
          startIcon={<AssignmentTurnedInOutlinedIcon />}
          size="small"
          type="submit"
          variant="contained"
        >
          Register &amp; Create Job Card
        </Button>
      </Stack>
    </Box>
  )
}

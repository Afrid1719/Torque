import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { VehicleFormSection } from '@app/pages/Vehicles/components/VehicleFormSection'

export function VehicleEditDangerZone({
  isActive,
  onDeactivate,
}: {
  isActive: boolean
  onDeactivate: () => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <VehicleFormSection
        detail="Irreversible status change"
        icon={<WarningAmberOutlinedIcon fontSize="small" />}
        title="Danger Zone & Archival Management"
      >
        <Stack spacing={2}>
          <Alert severity="warning">
            Deactivating this vehicle removes it from the active workshop fleet.
            The vehicle record remains available for reference.
          </Alert>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
              {isActive
                ? 'Vehicle is active in the fleet'
                : 'Vehicle is inactive'}
            </Typography>
            <Button
              color="error"
              disabled={!isActive}
              onClick={() => setConfirmOpen(true)}
              variant="outlined"
            >
              Deactivate Vehicle
            </Button>
          </Stack>
        </Stack>
      </VehicleFormSection>
      <Dialog onClose={() => setConfirmOpen(false)} open={confirmOpen}>
        <DialogTitle>Deactivate this vehicle?</DialogTitle>
        <DialogContent>
          <Typography>
            This will mark the vehicle inactive when you save your changes. The
            record will not be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Keep Active</Button>
          <Button
            color="error"
            onClick={() => {
              onDeactivate()
              setConfirmOpen(false)
            }}
            variant="contained"
          >
            Mark Inactive
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

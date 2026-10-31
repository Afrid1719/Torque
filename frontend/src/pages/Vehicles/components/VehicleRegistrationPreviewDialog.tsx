import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import type { CreateVehicleRequest } from '@app/api/vehicles'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'

export type VehicleRegistrationPreview = {
  payload: CreateVehicleRequest
  intakeNotes: string
  handoverItems: string[]
  fuelTankLevel: string
  insurancePolicy: string
  insuranceExpiry: string
}

const fuelLabels: Record<CreateVehicleRequest['fuel_type'], string> = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  ev: 'Electric',
  cng: 'CNG',
  hybrid: 'Hybrid',
}

const transmissionLabels: Record<CreateVehicleRequest['transmission'], string> =
  {
    manual: 'Manual',
    semi_automatic: 'Semi-automatic',
    automatic: 'Automatic',
  }

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e6eaf0',
        borderRadius: 1,
        minWidth: 0,
        p: 1,
      }}
    >
      <Typography
        color="text.secondary"
        sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 12, mt: 0.25, overflowWrap: 'anywhere' }}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

export function VehicleRegistrationPreviewDialog({
  customer,
  error,
  isSubmitting,
  onClose,
  onConfirm,
  open,
  preview,
}: {
  customer: CustomerProfileState
  error: string | null
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
  open: boolean
  preview: VehicleRegistrationPreview | null
}) {
  if (!preview) return null

  const { payload } = preview
  const initials = customer.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const vehicleModel = [payload.make, payload.model, payload.variant]
    .filter(Boolean)
    .join(' ')
  const modelAndYear = payload.manufacture_year
    ? `${vehicleModel} (${payload.manufacture_year})`
    : vehicleModel
  const engineCapacity =
    payload.engine_capacity === null
      ? 'Not provided'
      : `${payload.engine_capacity.toLocaleString()} cc`
  const odometer = `${payload.odometer.toLocaleString()} KM`
  const insurance = [
    preview.insurancePolicy || 'Not provided',
    preview.insuranceExpiry ? `Exp: ${preview.insuranceExpiry}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Dialog
      aria-labelledby="vehicle-registration-preview-title"
      fullWidth
      maxWidth="md"
      onClose={() => {
        if (!isSubmitting) onClose()
      }}
      open={open}
      slotProps={{ paper: { sx: { borderRadius: 1.5, maxWidth: 760 } } }}
    >
      <DialogTitle
        sx={{
          alignItems: 'center',
          borderBottom: '1px solid #e8edf3',
          display: 'flex',
          gap: 1.25,
          py: 1.5,
          pr: 1.5,
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'primary.main',
            borderRadius: 1,
            color: '#fff',
            display: 'flex',
            height: 36,
            justifyContent: 'center',
            width: 36,
          }}
        >
          <VerifiedUserOutlinedIcon fontSize="small" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography
              component="h2"
              id="vehicle-registration-preview-title"
              sx={{ fontSize: 15, fontWeight: 700 }}
            >
              Confirm Vehicle Registration
            </Typography>
            <Chip
              color="success"
              label="Ready"
              size="small"
              sx={{ height: 18, fontSize: 9 }}
            />
          </Stack>
          <Typography color="text.secondary" sx={{ fontSize: 10, mt: 0.25 }}>
            Review vehicle details and customer assignment before creating the
            record.
          </Typography>
        </Box>
        <IconButton
          aria-label="Close preview"
          disabled={isSubmitting}
          onClick={onClose}
          size="small"
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: '#f8f9fb',
          p: { xs: 1.5, sm: 2 },
          pt: { xs: 1.5, sm: 2 },
          '&:first-of-type': {
            pt: { xs: 1.5, sm: 2 },
          },
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              bgcolor: '#edf3ff',
              borderRadius: 1.25,
              p: 1.25,
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#dce8ff',
                color: 'primary.dark',
                fontSize: 12,
                fontWeight: 700,
                height: 34,
                width: 34,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                {customer.name}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 10 }}>
                {customer.mobileNumber}
                {customer.email ? ` · ${customer.email}` : ''}
              </Typography>
            </Box>
            <Chip
              label={`Customer #${customer.id ?? '—'}`}
              size="small"
              sx={{ ml: 'auto', fontSize: 9 }}
            />
          </Stack>

          <Box>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.35,
                mb: 0.75,
                textTransform: 'uppercase',
              }}
            >
              Vehicle specifications
            </Typography>
            <Box
              sx={{
                bgcolor: '#f0f2f5',
                border: '1px solid #e1e5eb',
                borderRadius: 1.25,
                display: 'grid',
                gap: 0.75,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                p: 1,
              }}
            >
              <PreviewField
                label="License plate"
                value={`IND ${payload.registration_number}`}
              />
              <PreviewField label="VIN / Chassis number" value={payload.vin} />
              <PreviewField label="Make, model & year" value={modelAndYear} />
              <PreviewField label="Vehicle type" value={payload.vehicle_type} />
              <PreviewField label="Color" value={payload.color} />
              <PreviewField
                label="Fuel & transmission"
                value={`${fuelLabels[payload.fuel_type]} · ${transmissionLabels[payload.transmission]}`}
              />
              <PreviewField label="Current odometer" value={odometer} />
              <PreviewField
                label="Displacement / engine"
                value={engineCapacity}
              />
              <PreviewField
                label="Insurance policy & expiry"
                value={insurance}
              />
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e1e5eb',
              borderRadius: 1.25,
              p: 1.25,
            }}
          >
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: 'center' }}
              >
                <FactCheckOutlinedIcon color="primary" sx={{ fontSize: 15 }} />
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Workshop intake
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ fontSize: 10 }}>
                Fuel: {preview.fuelTankLevel}% full
              </Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ fontSize: 10, mt: 0.75 }}>
              Handover checklist: {preview.handoverItems.length} of 4 items
              checked
            </Typography>
            <Typography
              sx={{
                bgcolor: '#f7f8fa',
                borderRadius: 0.75,
                fontSize: 10,
                lineHeight: 1.5,
                mt: 0.75,
                p: 1,
                overflowWrap: 'anywhere',
              }}
            >
              <strong>Intake notes: </strong>
              {preview.intakeNotes || 'None'}
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          <Alert
            icon={<InfoOutlinedIcon fontSize="small" />}
            severity="info"
            sx={{ fontSize: 10, py: 0 }}
          >
            Confirming creates the vehicle record. Insurance and workshop intake
            details are preview-only and are not saved yet.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: '1px solid #e8edf3',
          justifyContent: 'space-between',
          p: 1.5,
        }}
      >
        <Button
          disabled={isSubmitting}
          onClick={onClose}
          size="small"
          variant="outlined"
        >
          Back to Edit
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={onConfirm}
          size="small"
          variant="contained"
        >
          {isSubmitting ? 'Registering…' : 'Confirm & Register'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

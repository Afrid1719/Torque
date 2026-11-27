import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import type { Vehicle } from '@app/api/vehicles'
import { RegisteredVehicles } from '@app/pages/Customers/components/RegisteredVehicles'

export function CustomerActivity({
  customerId,
  customerName,
  notes,
  onAddVehicle,
  onEditNotes,
  vehicles = [],
  vehiclesError,
  vehiclesLoading,
}: {
  customerId?: number | string
  customerName?: string
  notes: string
  onAddVehicle?: () => void
  onEditNotes?: () => void
  vehicles?: Vehicle[]
  vehiclesError?: string | null
  vehiclesLoading?: boolean
}) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
      }}
    >
      <Stack spacing={3}>
        <RegisteredVehicles
          customerId={customerId}
          customerName={customerName}
          error={vehiclesError}
          isLoading={vehiclesLoading}
          onAddVehicle={onAddVehicle}
          vehicles={vehicles}
        />
        <Card variant="outlined">
          <CardHeader
            avatar={<NotesOutlinedIcon color="primary" />}
            action={
              <IconButton
                aria-label="Edit workshop notes"
                onClick={onEditNotes}
                size="small"
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            }
            slotProps={{ title: { variant: 'overline' } }}
            title="Workshop Notes"
          />
          <Divider />
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              {notes || 'No internal notes have been added.'}
            </Typography>
          </CardContent>
        </Card>
      </Stack>
      <Card variant="outlined">
        <CardHeader
          action={<Button variant="contained">New Job Card</Button>}
          slotProps={{ title: { variant: 'overline' } }}
          title="Service History"
        />
        <Divider />
        <CardContent
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 310,
            textAlign: 'center',
          }}
        >
          <EventRepeatOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
          <Typography sx={{ mt: 1 }} variant="h6">
            No service history yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Completed and active job cards will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

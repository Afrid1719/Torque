import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import type { Vehicle } from '@app/api/vehicles'
import { fuelTypeLabels } from '@app/pages/Vehicles/components/vehicleListConfig'

export function VehicleDetailsDialog({
  onClose,
  vehicle,
}: {
  onClose: () => void
  vehicle: Vehicle | null
}) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={vehicle !== null}>
      {vehicle && (
        <>
          <DialogTitle>
            {vehicle.make} {vehicle.model}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              {[
                ['Registration', vehicle.registration_number],
                ['Customer', vehicle.customer?.name ?? 'Unassigned'],
                [
                  'Customer phone',
                  vehicle.customer?.mobile_number ?? 'Unavailable',
                ],
                ['Variant', vehicle.variant],
                ['Year', vehicle.manufacture_year ?? 'Unavailable'],
                ['Odometer', `${vehicle.odometer.toLocaleString()} km`],
                [
                  'Fuel type',
                  fuelTypeLabels[vehicle.fuel_type.toLowerCase()] ??
                    vehicle.fuel_type,
                ],
                ['Vehicle type', vehicle.vehicle_type],
                ['Transmission', vehicle.transmission],
                ['Color', vehicle.color],
                ['VIN', vehicle.vin],
              ].map(([label, value]) => (
                <Stack
                  key={label}
                  sx={{ flexDirection: 'row', justifyContent: 'space-between' }}
                >
                  <Typography color="text.secondary" variant="body2">
                    {label}
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }} variant="body2">
                    {value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  )
}

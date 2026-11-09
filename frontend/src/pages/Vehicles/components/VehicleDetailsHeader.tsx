import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { keyframes } from '@emotion/react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router'
import { ApiError } from '@app/api/client'
import {
  customerVehiclesQueryKey,
  updateVehicle,
  vehicleQueryKey,
  vehiclesQueryKey,
  type CreateVehicleRequest,
  type Vehicle,
} from '@app/api/vehicles'
import { AppBreadcrumbs } from '@app/components/navigation/AppBreadcrumbs'
import { useAuth } from '@app/hooks/useAuth'

const statusDotPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.35);
  }
`

const vehicleTypes = ['private', 'commercial'] as const
const fuelTypes = ['petrol', 'diesel', 'ev', 'cng', 'hybrid'] as const
const transmissionTypes = ['manual', 'semi_automatic', 'automatic'] as const

function isOneOf<T extends string>(
  value: string,
  choices: readonly T[],
): value is T {
  return choices.some((choice) => choice === value)
}

type VehicleEditForm = Record<keyof CreateVehicleRequest, string>

export function VehicleDetailsHeader({
  customer,
  vehicle,
}: {
  customer?: { id: number | string; name: string }
  vehicle: Vehicle
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<VehicleEditForm>(() => ({
    registration_number: vehicle.registration_number,
    make: vehicle.make,
    model: vehicle.model,
    variant: vehicle.variant,
    vehicle_type: vehicle.vehicle_type,
    fuel_type: vehicle.fuel_type,
    transmission: vehicle.transmission,
    color: vehicle.color,
    vin: vehicle.vin,
    odometer: String(vehicle.odometer),
    is_active: String(vehicle.is_active),
    manufacture_year: vehicle.manufacture_year
      ? String(vehicle.manufacture_year)
      : '',
    engine_capacity: vehicle.engine_capacity
      ? String(vehicle.engine_capacity)
      : '',
  }))
  const editMutation = useMutation({
    mutationFn: (payload: CreateVehicleRequest) => {
      if (!accessToken) throw new Error('Your session has expired.')
      return updateVehicle(accessToken, vehicle.id, payload)
    },
    onSuccess: async (updatedVehicle) => {
      const vehicleWithCustomer = {
        ...updatedVehicle,
        customer: updatedVehicle.customer ?? vehicle.customer,
      }
      await Promise.all([
        queryClient.setQueryData(
          vehicleQueryKey(vehicle.id),
          vehicleWithCustomer,
        ),
        queryClient.invalidateQueries({ queryKey: vehiclesQueryKey }),
        ...(vehicle.customer
          ? [
              queryClient.invalidateQueries({
                queryKey: customerVehiclesQueryKey(vehicle.customer.id),
              }),
            ]
          : []),
      ])
      setForm({
        registration_number: updatedVehicle.registration_number,
        make: updatedVehicle.make,
        model: updatedVehicle.model,
        variant: updatedVehicle.variant,
        vehicle_type: updatedVehicle.vehicle_type,
        fuel_type: updatedVehicle.fuel_type,
        transmission: updatedVehicle.transmission,
        color: updatedVehicle.color,
        vin: updatedVehicle.vin,
        odometer: String(updatedVehicle.odometer),
        is_active: String(updatedVehicle.is_active),
        manufacture_year: updatedVehicle.manufacture_year
          ? String(updatedVehicle.manufacture_year)
          : '',
        engine_capacity: updatedVehicle.engine_capacity
          ? String(updatedVehicle.engine_capacity)
          : '',
      })
      setEditOpen(false)
      setEditError(null)
    },
  })

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEditError(null)
    const odometer = Number(form.odometer)
    const manufactureYear = form.manufacture_year
      ? Number(form.manufacture_year)
      : null
    const engineCapacity = form.engine_capacity
      ? Number(form.engine_capacity)
      : null
    const vehicleType = form.vehicle_type
    const fuelType = form.fuel_type
    const transmission = form.transmission
    if (!Number.isInteger(odometer) || odometer <= 0) {
      setEditError('Enter an odometer reading greater than zero.')
      return
    }
    if (
      (manufactureYear !== null && !Number.isInteger(manufactureYear)) ||
      (engineCapacity !== null && !Number.isInteger(engineCapacity))
    ) {
      setEditError('Year and engine capacity must be whole numbers.')
      return
    }
    if (
      !isOneOf(vehicleType, vehicleTypes) ||
      !isOneOf(fuelType, fuelTypes) ||
      !isOneOf(transmission, transmissionTypes)
    ) {
      setEditError('Select valid vehicle, fuel, and transmission types.')
      return
    }
    editMutation.mutate({
      registration_number: form.registration_number,
      make: form.make,
      model: form.model,
      variant: form.variant,
      vehicle_type: vehicleType,
      fuel_type: fuelType,
      transmission,
      color: form.color,
      vin: form.vin,
      odometer,
      is_active: form.is_active === 'true',
      manufacture_year: manufactureYear,
      engine_capacity: engineCapacity,
    })
  }

  const handleEditError = editMutation.error
    ? editMutation.error instanceof ApiError
      ? editMutation.error.message
      : editMutation.error instanceof Error
        ? editMutation.error.message
        : 'Unable to update vehicle details.'
    : null

  return (
    <Box sx={{ mb: 2.5 }}>
      <AppBreadcrumbs
        ariaLabel="Vehicle navigation"
        items={
          customer
            ? [
                { label: 'Customers', to: '/customers' },
                {
                  label: customer.name,
                  to: `/customers/${customer.id}`,
                },
                { label: vehicle.registration_number },
              ]
            : [
                { label: 'Vehicles', to: '/vehicles' },
                { label: vehicle.registration_number },
              ]
        }
        sx={{ mb: 1.5 }}
      />
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { md: 'center' } }}
        >
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: '#e8eaed',
              borderRadius: 1,
              display: 'flex',
              flexShrink: 0,
              gap: 1,
              px: 1.25,
              py: 0.75,
            }}
          >
            <Typography
              color="text.secondary"
              sx={{ fontSize: 9, fontWeight: 600 }}
            >
              IND
            </Typography>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              {vehicle.registration_number}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography
              component="h1"
              sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 750 }}
            >
              {vehicle.manufacture_year ? `${vehicle.manufacture_year} ` : ''}
              {vehicle.make} {vehicle.model} {vehicle.variant}
            </Typography>
            <Chip
              label={`VEHICLE TYPE · ${vehicle.vehicle_type.toUpperCase()}`}
              size="small"
              sx={{
                bgcolor: '#dce8f8',
                color: '#315b93',
                fontSize: 9,
                fontWeight: 700,
                height: 20,
              }}
            />
            <Chip
              icon={
                vehicle.is_active ? (
                  <Box
                    aria-hidden="true"
                    sx={{
                      animation: `${statusDotPulse} 1.6s ease-in-out infinite`,
                      bgcolor: '#087443',
                      borderRadius: '50%',
                      height: 6,
                      width: 6,
                      '@media (prefers-reduced-motion: reduce)': {
                        animation: 'none',
                      },
                    }}
                  />
                ) : undefined
              }
              label={vehicle.is_active ? 'IN SERVICE' : 'INACTIVE'}
              size="small"
              sx={{
                bgcolor: vehicle.is_active ? '#dff4e9' : '#f1f2f4',
                color: vehicle.is_active ? '#087443' : '#59616d',
                fontSize: 9,
                fontWeight: 700,
                height: 20,
                '& .MuiChip-icon': {
                  ml: 0.75,
                  mr: -0.5,
                },
              }}
            />
          </Stack>
        </Stack>
        <Typography color="text.secondary" sx={{ fontSize: 11 }}>
          VIN: {vehicle.vin} · {vehicle.fuel_type.toUpperCase()} ·{' '}
          {vehicle.transmission.replaceAll('_', ' ').toUpperCase()}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Button
            onClick={() => window.print()}
            startIcon={<PrintOutlinedIcon />}
            sx={{ bgcolor: '#fff', borderColor: '#d5dce6' }}
            variant="outlined"
          >
            Print Summary
          </Button>
          <Button
            onClick={() => {
              setEditError(null)
              setEditOpen(true)
            }}
            startIcon={<EditOutlinedIcon />}
            variant="outlined"
          >
            Edit Vehicle
          </Button>
          <Button
            component={RouterLink}
            startIcon={<AddOutlinedIcon />}
            to="/job-cards"
            variant="contained"
          >
            New Job Card
          </Button>
        </Stack>
      </Stack>
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setEditOpen(false)}
        open={editOpen}
      >
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogContent>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              {handleEditError && (
                <Alert severity="error">{handleEditError}</Alert>
              )}
              {editError && <Alert severity="error">{editError}</Alert>}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  label="Registration number"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      registration_number: event.target.value,
                    })
                  }
                  required
                  value={form.registration_number}
                />
                <TextField
                  fullWidth
                  label="VIN"
                  onChange={(event) =>
                    setForm({ ...form, vin: event.target.value })
                  }
                  required
                  value={form.vin}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  label="Make"
                  onChange={(event) =>
                    setForm({ ...form, make: event.target.value })
                  }
                  required
                  value={form.make}
                />
                <TextField
                  fullWidth
                  label="Model"
                  onChange={(event) =>
                    setForm({ ...form, model: event.target.value })
                  }
                  required
                  value={form.model}
                />
                <TextField
                  fullWidth
                  label="Variant"
                  onChange={(event) =>
                    setForm({ ...form, variant: event.target.value })
                  }
                  required
                  value={form.variant}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  label="Vehicle type"
                  onChange={(event) =>
                    setForm({ ...form, vehicle_type: event.target.value })
                  }
                  select
                  value={form.vehicle_type}
                >
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Fuel type"
                  onChange={(event) =>
                    setForm({ ...form, fuel_type: event.target.value })
                  }
                  select
                  value={form.fuel_type}
                >
                  {['petrol', 'diesel', 'ev', 'cng', 'hybrid'].map((fuel) => (
                    <MenuItem key={fuel} value={fuel}>
                      {fuel.toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Transmission"
                  onChange={(event) =>
                    setForm({ ...form, transmission: event.target.value })
                  }
                  select
                  value={form.transmission}
                >
                  {['manual', 'semi_automatic', 'automatic'].map((item) => (
                    <MenuItem key={item} value={item}>
                      {item.replaceAll('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  label="Color"
                  onChange={(event) =>
                    setForm({ ...form, color: event.target.value })
                  }
                  required
                  value={form.color}
                />
                <TextField
                  fullWidth
                  label="Odometer (km)"
                  onChange={(event) =>
                    setForm({ ...form, odometer: event.target.value })
                  }
                  required
                  type="number"
                  value={form.odometer}
                />
                <TextField
                  fullWidth
                  label="Status"
                  onChange={(event) =>
                    setForm({ ...form, is_active: event.target.value })
                  }
                  select
                  value={form.is_active}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  label="Manufacture year"
                  onChange={(event) =>
                    setForm({ ...form, manufacture_year: event.target.value })
                  }
                  type="number"
                  value={form.manufacture_year}
                />
                <TextField
                  fullWidth
                  label="Engine capacity (cc)"
                  onChange={(event) =>
                    setForm({ ...form, engine_capacity: event.target.value })
                  }
                  type="number"
                  value={form.engine_capacity}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditOpen(false)} variant="text">
              Cancel
            </Button>
            <Button
              disabled={editMutation.isPending}
              type="submit"
              variant="contained"
            >
              {editMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}

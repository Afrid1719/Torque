import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router'
import { ApiError } from '@app/api/client'
import {
  customerVehiclesQueryKey,
  getVehicle,
  updateVehicle,
  vehicleQueryKey,
  vehiclesQueryKey,
  type CreateVehicleRequest,
  type Vehicle,
} from '@app/api/vehicles'
import { AppBreadcrumbs } from '@app/components/navigation/AppBreadcrumbs'
import { useAuth } from '@app/hooks/useAuth'
import { VehicleEditDangerZone } from '@app/pages/Vehicles/components/VehicleEditDangerZone'
import { VehicleIdentificationSection } from '@app/pages/Vehicles/components/VehicleIdentificationSection'
import { VehicleEditOverview } from '@app/pages/Vehicles/components/VehicleEditOverview'
import { VehicleEditOwnershipSection } from '@app/pages/Vehicles/components/VehicleEditOwnershipSection'
import { VehicleEditStatusStrip } from '@app/pages/Vehicles/components/VehicleEditStatusStrip'
import { VehicleTechnicalSection } from '@app/pages/Vehicles/components/VehicleTechnicalSection'
import {
  vehicleToEditValues,
  type VehicleEditField,
  type VehicleEditValues,
} from '@app/pages/Vehicles/components/vehicleEditForm'

const vehicleTypes = ['private', 'commercial'] as const
const fuelTypes = ['petrol', 'diesel', 'ev', 'cng', 'hybrid'] as const
const transmissionTypes = ['manual', 'semi_automatic', 'automatic'] as const

function isOneOf<T extends string>(
  value: string,
  choices: readonly T[],
): value is T {
  return choices.some((choice) => choice === value)
}

function customerContext(
  vehicle: Vehicle,
  locationState: unknown,
): { id: number | string; name: string } | undefined {
  const customer = (
    locationState as
      { customer?: { id?: unknown; name?: unknown } } | null | undefined
  )?.customer
  if (
    customer &&
    (typeof customer.id === 'number' || typeof customer.id === 'string') &&
    typeof customer.name === 'string'
  ) {
    return { id: customer.id, name: customer.name }
  }
  if (vehicle.customer) {
    return { id: vehicle.customer.id, name: vehicle.customer.name }
  }
  return undefined
}

export function VehicleEditPage() {
  const { vehicleId } = useParams()
  const location = useLocation()
  const { accessToken } = useAuth()
  const parsedVehicleId = Number(vehicleId)
  const isValidVehicleId =
    Number.isSafeInteger(parsedVehicleId) && parsedVehicleId > 0
  const vehicleQuery = useQuery({
    enabled: Boolean(accessToken && isValidVehicleId),
    queryFn: () => getVehicle(accessToken!, parsedVehicleId),
    queryKey: vehicleQueryKey(vehicleId ?? ''),
  })

  if (!isValidVehicleId) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert
          action={
            <Button component={RouterLink} to="/vehicles">
              Back to vehicles
            </Button>
          }
          severity="error"
        >
          The vehicle ID is invalid.
        </Alert>
      </Box>
    )
  }

  if (vehicleQuery.isPending) {
    return (
      <Box sx={{ display: 'grid', minHeight: 400, placeItems: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading vehicle record...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (vehicleQuery.error) {
    const message =
      vehicleQuery.error instanceof ApiError
        ? vehicleQuery.error.message
        : 'Unable to load vehicle record.'
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Stack spacing={2}>
          <Alert severity="error">{message}</Alert>
          <Button
            component={RouterLink}
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{ alignSelf: 'flex-start' }}
            to="/vehicles"
          >
            Back to vehicles
          </Button>
        </Stack>
      </Box>
    )
  }

  return (
    <VehicleEditForm
      key={vehicleQuery.data.id}
      customer={customerContext(vehicleQuery.data, location.state)}
      vehicle={vehicleQuery.data}
    />
  )
}

function VehicleEditForm({
  customer,
  vehicle,
}: {
  customer?: { id: number | string; name: string }
  vehicle: Vehicle
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<VehicleEditValues>(() =>
    vehicleToEditValues(vehicle),
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const initialValues = vehicleToEditValues(vehicle)
  const hasUnsavedChanges =
    JSON.stringify(values) !== JSON.stringify(initialValues)
  const detailsPath = `/vehicles/${vehicle.id}`
  const detailsState = customer ? { customer } : location.state

  const mutation = useMutation({
    mutationFn: ({
      payload,
    }: {
      exit: boolean
      payload: CreateVehicleRequest
    }) => {
      if (!accessToken) throw new Error('Your session has expired.')
      return updateVehicle(accessToken, vehicle.id, payload)
    },
    onSuccess: async (updatedVehicle, variables) => {
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
      setValues(vehicleToEditValues(vehicleWithCustomer))
      setFormError(null)
      setSavedMessage('Vehicle changes saved.')
      if (variables.exit) {
        navigate(detailsPath, { replace: true, state: detailsState })
      }
    },
    onError: (error: unknown) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to update the vehicle. Please try again.',
      )
    },
  })

  const setField = (field: VehicleEditField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFormError(null)
    setSavedMessage(null)
  }

  const buildPayload = (): CreateVehicleRequest | null => {
    const requiredFields = [
      values.registration_number,
      values.make,
      values.model,
      values.variant,
      values.color,
      values.vin,
    ]
    if (requiredFields.some((value) => !value.trim())) {
      setFormError('Complete all required vehicle details before saving.')
      return null
    }

    const odometer = Number(values.odometer)
    const manufactureYear = values.manufacture_year
      ? Number(values.manufacture_year)
      : null
    const engineCapacity = values.engine_capacity
      ? Number(values.engine_capacity)
      : null

    if (!Number.isInteger(odometer) || odometer <= 0) {
      setFormError('Enter an odometer reading greater than zero.')
      return null
    }
    if (
      (manufactureYear !== null && !Number.isInteger(manufactureYear)) ||
      (engineCapacity !== null && !Number.isInteger(engineCapacity))
    ) {
      setFormError('Year and engine capacity must be whole numbers.')
      return null
    }
    if (
      (manufactureYear !== null &&
        (manufactureYear < 1970 ||
          manufactureYear > new Date().getFullYear())) ||
      (engineCapacity !== null && engineCapacity < 998)
    ) {
      setFormError(
        'Manufacture year must be current or earlier, and engine capacity must be at least 998 cc.',
      )
      return null
    }
    if (
      !isOneOf(values.vehicle_type, vehicleTypes) ||
      !isOneOf(values.fuel_type, fuelTypes) ||
      !isOneOf(values.transmission, transmissionTypes)
    ) {
      setFormError('Select valid vehicle, fuel, and transmission types.')
      return null
    }

    return {
      color: values.color.trim(),
      engine_capacity: engineCapacity,
      fuel_type: values.fuel_type,
      is_active: values.is_active === 'true',
      make: values.make.trim(),
      manufacture_year: manufactureYear,
      model: values.model.trim(),
      odometer,
      registration_number: values.registration_number.trim(),
      transmission: values.transmission,
      variant: values.variant.trim(),
      vehicle_type: values.vehicle_type,
      vin: values.vin.trim(),
    }
  }

  const save = (exit: boolean) => {
    setFormError(null)
    setSavedMessage(null)
    const payload = buildPayload()
    if (payload) mutation.mutate({ exit, payload })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    save(false)
  }

  const title = `${values.manufacture_year ? `${values.manufacture_year} ` : ''}${values.make} ${values.model} ${values.variant}`
  const breadcrumbItems = customer
    ? [
        { label: 'Customers', to: '/customers' },
        { label: customer.name, to: `/customers/${customer.id}` },
        { label: vehicle.registration_number, to: detailsPath },
        { label: 'Edit Vehicle' },
      ]
    : [
        { label: 'Vehicles', to: '/vehicles' },
        { label: vehicle.registration_number, to: detailsPath },
        { label: 'Edit Vehicle' },
      ]

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        pb: 4,
        px: { xs: 1.5, sm: 2.5, lg: 3 },
        pt: { xs: 2, sm: 2.5 },
      }}
    >
      <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
        <AppBreadcrumbs
          ariaLabel="Vehicle edit navigation"
          items={breadcrumbItems}
          sx={{ mb: 1.25 }}
        />
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{
            alignItems: { lg: 'center' },
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" sx={{ fontSize: 22, fontWeight: 750 }}>
              Edit Vehicle — {title}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 12, mt: 0.5 }}>
              Update vehicle specifications and operational status.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              state={detailsState}
              to={detailsPath}
              variant="outlined"
            >
              Discard Changes
            </Button>
            <Button
              disabled={mutation.isPending}
              form="vehicle-edit-form"
              startIcon={<SaveOutlinedIcon />}
              type="submit"
              variant="contained"
            >
              {mutation.isPending ? 'Saving...' : 'Save & Update Record'}
            </Button>
          </Stack>
        </Stack>
        <VehicleEditStatusStrip
          onActiveChange={(isActive) => setField('is_active', String(isActive))}
          values={values}
        />
        <Box
          component="form"
          id="vehicle-edit-form"
          onSubmit={handleSubmit}
          sx={{
            alignItems: 'start',
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              lg: 'minmax(0, 1.7fr) minmax(270px, 0.8fr)',
            },
          }}
        >
          <Stack spacing={2}>
            {formError && <Alert severity="error">{formError}</Alert>}
            {savedMessage && <Alert severity="success">{savedMessage}</Alert>}
            <VehicleEditOwnershipSection
              onNotice={setNotice}
              vehicle={vehicle}
            />
            <VehicleIdentificationSection
              editMode
              onChange={setField}
              onNotice={setNotice}
              values={values}
            />
            <VehicleTechnicalSection
              editMode
              fuelType={
                isOneOf(values.fuel_type, fuelTypes)
                  ? values.fuel_type
                  : 'petrol'
              }
              onChange={setField}
              onFuelTypeChange={(fuelType) => setField('fuel_type', fuelType)}
              values={values}
            />
            <VehicleEditDangerZone
              isActive={values.is_active === 'true'}
              onDeactivate={() => setField('is_active', 'false')}
            />
          </Stack>
          <VehicleEditOverview values={values} />
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          sx={{
            alignItems: { sm: 'center' },
            bgcolor: '#fff',
            border: '1px solid #e8edf3',
            borderRadius: 2,
            bottom: 12,
            boxShadow: '0 8px 24px rgba(25, 40, 60, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            p: 1.5,
            position: 'sticky',
            zIndex: 1,
          }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Button
              component={RouterLink}
              startIcon={<ArrowBackOutlinedIcon />}
              state={detailsState}
              size="small"
              to={detailsPath}
            >
              Cancel
            </Button>
            <Typography
              color={hasUnsavedChanges ? 'warning.dark' : 'success.dark'}
              sx={{ fontSize: 11 }}
            >
              {hasUnsavedChanges
                ? 'Changes not yet saved'
                : 'All changes saved'}
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'flex-end',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Button
              disabled={mutation.isPending || !hasUnsavedChanges}
              onClick={() => {
                setValues(initialValues)
                setFormError(null)
                setSavedMessage(null)
              }}
              size="small"
              variant="outlined"
            >
              Reset to Saved
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => save(true)}
              size="small"
              startIcon={<SaveOutlinedIcon />}
              variant="contained"
            >
              Save Changes &amp; Exit
            </Button>
            <Button
              disabled={mutation.isPending}
              form="vehicle-edit-form"
              size="small"
              type="submit"
              variant="contained"
            >
              Save Changes
            </Button>
          </Stack>
        </Stack>
        <Typography
          aria-live="polite"
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'right', fontSize: 10 }}
        >
          {mutation.isPending ? 'Saving vehicle changes...' : ''}
        </Typography>
      </Box>
      <Snackbar
        autoHideDuration={4000}
        message={notice}
        onClose={() => setNotice('')}
        open={Boolean(notice)}
      />
    </Box>
  )
}

import { keyframes } from '@emotion/react'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router'
import { ApiError } from '@app/api/client'
import type { Vehicle } from '@app/api/vehicles'
import {
  customerVehiclesQueryKey,
  getCustomerVehicles,
  getVehicles,
  vehiclesQueryKey,
} from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import workshopImage from '@app/assets/workshop-login.webp'

type VehicleFilter = 'all' | 'in-service' | 'ready-for-pickup'
type VehicleSort = 'make' | 'year' | 'odometer'

const emptyVehicles: Vehicle[] = []

const statusDotPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.4);
  }
`

const vehicleStatuses = [
  {
    label: 'IN SERVICE',
    background: '#e1efff',
    color: '#0058be',
    indicator: '#0058be',
    bay: 'Bay 2',
    bayBackground: '#e1efff',
    jobReference: '#JC-9842',
    jobStatus: 'In Diagnostic',
    jobDescription: 'Electrical Diagnostics & Suspension...',
    ownerTier: 'GOLD',
    ownerName: 'Robert Harrison',
    actionLabel: 'View Job Card',
    actionColor: '#0058be',
  },
  {
    label: 'READY FOR PICKUP',
    background: '#d9f4e7',
    color: '#006947',
    bay: 'Bay 3 Handover',
    bayBackground: '#d9f4e7',
    jobReference: '#JC-9721',
    jobStatus: 'Completed',
    jobDescription: 'Brake Pad Replacement & 30k Service...',
    ownerTier: 'PLATINUM',
    ownerName: 'Marcus Sterling',
    actionLabel: 'Handover / Invoice',
    actionColor: '#006947',
  },
  {
    label: 'REGISTERED',
    background: '#e8ebef',
    color: '#424754',
    bay: 'Fleet Bay A',
    bayBackground: '#e8ebef',
    jobReference: 'Routine Fleet Status',
    jobStatus: 'Scheduled',
    jobDescription: 'Next due in 2,500 km · Last svc Scheduled',
    ownerTier: 'COMMERCIAL',
    ownerName: 'David Miller',
    actionLabel: 'Create Job Card',
    actionColor: '#0058be',
  },
  {
    label: 'CRITICAL ALERT',
    background: '#fce4e4',
    color: '#ba1a1a',
    bay: 'Diag Bay 1',
    bayBackground: '#fce4e4',
    jobReference: 'DTC: P0300',
    jobStatus: 'Urgent',
    jobDescription: 'Random Misfire Detected (Bank 1 & ...)',
    ownerTier: 'PREMIER VIP',
    ownerName: 'Elena Vance',
    actionLabel: 'View Job Card',
    actionColor: '#0058be',
  },
] as const

const fuelTypeLabels: Record<string, string> = {
  cng: 'CNG',
  diesel: 'Diesel',
  ev: 'Electric',
  hybrid: 'Hybrid',
  petrol: 'Petrol',
}

function downloadVehicleCsv(vehicles: Vehicle[]) {
  const columns: Array<keyof Vehicle> = [
    'registration_number',
    'make',
    'model',
    'variant',
    'manufacture_year',
    'odometer',
    'fuel_type',
    'is_active',
    'vin',
  ]
  const escapeCsv = (value: unknown) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`
  const rows = [
    columns.map(escapeCsv).join(','),
    ...vehicles.map((vehicle) =>
      columns.map((column) => escapeCsv(vehicle[column])).join(','),
    ),
  ]
  const file = new Blob([rows.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = 'torque-vehicles.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function VehicleCard({
  vehicle,
  status,
}: {
  vehicle: Vehicle
  status: (typeof vehicleStatuses)[number]
}) {
  const normalizedFuelType = vehicle.fuel_type.toLowerCase()
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderColor: '#cbd3df',
        borderRadius: 1.5,
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(25, 28, 30, 0.1)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: '#dce5ef',
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.06), rgba(15, 23, 42, 0.12)), url(${workshopImage})`,
          backgroundPosition: 'center 55%',
          backgroundSize: 'cover',
          height: 126,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Chip
          icon={
            status.label === 'IN SERVICE' ? (
              <Box
                aria-hidden="true"
                sx={{
                  animation: `${statusDotPulse} 1.6s ease-in-out infinite`,
                  bgcolor: status.color,
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
          label={status.label}
          size="small"
          sx={{
            bgcolor: status.background,
            color: status.color,
            borderRadius: 0.75,
            fontSize: 9,
            fontWeight: 700,
            height: 22,
            position: 'absolute',
            right: 6,
            top: 6,
          }}
        />
        <Chip
          label={vehicle.registration_number}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.94)',
            borderRadius: 0.5,
            bottom: 6,
            color: '#191c1e',
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: 700,
            height: 20,
            left: 6,
            position: 'absolute',
          }}
        />
      </Box>
      <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Stack spacing={0.75}>
          <Stack
            spacing={0.5}
            sx={{ alignItems: 'flex-start', flexDirection: 'row' }}
          >
            <Typography
              noWrap
              sx={{
                flex: 1,
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.25,
                minWidth: 0,
              }}
              title={`${vehicle.make} ${vehicle.model} ${vehicle.variant}`}
            >
              {vehicle.make} {vehicle.model}
            </Typography>
            <Chip
              label={status.bay}
              size="small"
              sx={{
                bgcolor: status.bayBackground,
                borderRadius: 0.5,
                color: status.color,
                flexShrink: 0,
                fontSize: 10,
                height: 22,
                '& .MuiChip-label': { px: 0.85 },
              }}
            />
          </Stack>
          <Typography color="text.secondary" noWrap variant="caption">
            {vehicle.manufacture_year ?? 'Year unavailable'} · {vehicle.variant}{' '}
            · {fuelTypeLabels[normalizedFuelType] ?? vehicle.fuel_type}
          </Typography>
          <Box
            sx={{
              bgcolor:
                status.label === 'CRITICAL ALERT'
                  ? '#fff1f0'
                  : status.label === 'IN SERVICE'
                    ? '#eef5ff'
                    : status.label === 'READY FOR PICKUP'
                      ? '#ecfbf3'
                      : '#f4f6f8',
              border: '1px solid',
              borderColor:
                status.label === 'CRITICAL ALERT'
                  ? '#ffc9c6'
                  : status.label === 'IN SERVICE'
                    ? '#c8ddff'
                    : status.label === 'READY FOR PICKUP'
                      ? '#bcebd2'
                      : '#e1e5ea',
              borderRadius: 0.75,
              mt: 0.25,
              p: 0.65,
            }}
          >
            <Stack
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                noWrap
                sx={{ color: status.color, fontSize: 9, fontWeight: 700 }}
              >
                {status.jobReference}
              </Typography>
              <Typography
                noWrap
                sx={{ color: status.color, fontSize: 8, fontWeight: 600 }}
              >
                {status.jobStatus}
              </Typography>
            </Stack>
            <Typography
              noWrap
              sx={{ fontSize: 10, lineHeight: 1.35 }}
              title={status.jobDescription}
            >
              {status.jobDescription}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: '1fr 1fr',
              py: 0.25,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 10, fontWeight: 600 }}>
                {vehicle.odometer.toLocaleString()} km
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0, textAlign: 'right' }}>
              <Typography
                noWrap
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {vehicle.vehicle_type}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              alignItems: 'center',
              columnGap: 0.75,
              display: 'grid',
              gridTemplateColumns: '24px minmax(0, 1fr) 20px',
              minHeight: 30,
              py: 0.25,
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#dce8f2',
                color: '#38566d',
                fontSize: 10,
                fontWeight: 700,
                height: 24,
                width: 24,
              }}
            >
              {status.ownerName
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </Avatar>
            <Typography
              noWrap
              sx={{ fontSize: 10, fontWeight: 600, lineHeight: '16px' }}
            >
              {status.ownerName}
            </Typography>
            <IconButton
              aria-label={`Open customers for ${status.ownerName}`}
              component={RouterLink}
              size="small"
              sx={{ p: 0.25 }}
              to="/customers"
            >
              <OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 0.5,
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              pt: 0.35,
            }}
          >
            <Button
              fullWidth
              onClick={() => setDetailsOpen(true)}
              size="small"
              sx={{
                borderRadius: 0.75,
                borderColor: '#cbd3df',
                color: '#334155',
                height: 40,
                minWidth: 0,
                px: 0.75,
              }}
              variant="outlined"
            >
              Details
            </Button>
            <Button
              component={RouterLink}
              fullWidth
              size="small"
              sx={{
                bgcolor: status.actionColor,
                borderRadius: 0.75,
                color: '#fff',
                height: 40,
                lineHeight: 1.2,
                minWidth: 0,
                px: 0.75,
                whiteSpace: 'normal',
                '&:hover': {
                  bgcolor: status.actionColor,
                  filter: 'brightness(0.9)',
                },
              }}
              to="/job-cards"
              variant="contained"
            >
              {status.actionLabel}
            </Button>
          </Box>
        </Stack>
      </CardContent>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDetailsOpen(false)}
        open={detailsOpen}
      >
        <DialogTitle>
          {vehicle.make} {vehicle.model}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            {[
              ['Registration', vehicle.registration_number],
              ['Variant', vehicle.variant],
              ['Year', vehicle.manufacture_year ?? 'Unavailable'],
              ['Odometer', `${vehicle.odometer.toLocaleString()} km`],
              [
                'Fuel type',
                fuelTypeLabels[normalizedFuelType] ?? vehicle.fuel_type,
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
      </Dialog>
    </Card>
  )
}

function VehicleListTable({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const pageCount = Math.ceil(vehicles.length / rowsPerPage)
  const currentPage = Math.min(page, pageCount - 1)
  const displayedVehicles = vehicles.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage,
  )

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: '#d5dce6',
        borderRadius: 2,
        boxShadow: '0 4px 18px rgba(25, 38, 58, 0.045)',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table
          aria-label="Vehicles"
          size="small"
          sx={{
            minWidth: 760,
            '& .MuiTableCell-root': {
              borderColor: '#edf0f4',
              px: { xs: 1.5, sm: 2 },
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              bgcolor: '#f5f7fa',
              color: '#667085',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.7,
              py: 1.5,
              textTransform: 'uppercase',
            },
            '& .MuiTableBody-root .MuiTableCell-root': {
              py: 1.25,
            },
            '& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root':
              {
                borderBottom: 0,
              },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Fuel</TableCell>
              <TableCell align="right">Odometer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedVehicles.map((vehicle, index) => {
              const status =
                vehicleStatuses[
                  (currentPage * rowsPerPage + index) % vehicleStatuses.length
                ]
              return (
                <TableRow
                  key={vehicle.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: '#f7faff' },
                    transition: 'background-color 120ms ease',
                  }}
                >
                  <TableCell>
                    <Stack
                      sx={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        sx={{
                          bgcolor: '#edf3fc',
                          border: '1px solid #e1e9f4',
                          color: '#315b93',
                          height: 38,
                          width: 42,
                          '& svg': { fontSize: 21 },
                        }}
                      >
                        <DirectionsCarOutlinedIcon />
                      </Avatar>
                      <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{ color: '#202b3c', fontWeight: 700 }}
                          variant="body2"
                        >
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Stack
                          sx={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            gap: 0.75,
                          }}
                        >
                          <Chip
                            label={vehicle.registration_number}
                            size="small"
                            variant="outlined"
                            sx={{
                              bgcolor: '#f8fafc',
                              borderColor: '#e1e6ed',
                              borderRadius: 0.75,
                              fontFamily: 'monospace',
                              fontSize: 9,
                              height: 19,
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                          <Typography
                            color="text.secondary"
                            noWrap
                            variant="caption"
                          >
                            {vehicle.variant}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: '#344054', fontWeight: 600 }}>
                    {vehicle.manufacture_year ?? '—'}
                  </TableCell>
                  <TableCell sx={{ color: '#475467' }}>
                    {fuelTypeLabels[vehicle.fuel_type.toLowerCase()] ??
                      vehicle.fuel_type}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Typography
                      component="span"
                      sx={{ color: '#202b3c', fontWeight: 600 }}
                      variant="body2"
                    >
                      {vehicle.odometer.toLocaleString()}
                    </Typography>
                    <Typography
                      component="span"
                      color="text.secondary"
                      variant="caption"
                    >
                      {' '}
                      km
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={status.label}
                      size="small"
                      sx={{
                        bgcolor: status.background,
                        border: `1px solid ${status.color}20`,
                        color: status.color,
                        fontSize: 9.5,
                        fontWeight: 700,
                        height: 24,
                        letterSpacing: 0.15,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ justifyContent: 'flex-end' }}
                    >
                      <Button
                        onClick={() => setSelectedVehicle(vehicle)}
                        size="small"
                        sx={{
                          borderColor: '#dce3ec',
                          color: '#475467',
                          minWidth: 0,
                          px: 1.1,
                          '&:hover': {
                            bgcolor: '#f2f6fc',
                            borderColor: '#b8c9df',
                          },
                        }}
                        variant="outlined"
                      >
                        Details
                      </Button>
                      <Button
                        component={RouterLink}
                        size="small"
                        sx={{
                          borderRadius: 1,
                          minWidth: 0,
                          px: 1.25,
                        }}
                        to="/job-cards"
                        variant="contained"
                      >
                        Job Card
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={vehicles.length}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value))
          setPage(0)
        }}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          bgcolor: '#fafbfd',
          borderTop: '1px solid #edf0f4',
          color: '#667085',
          '& .MuiTablePagination-toolbar': {
            minHeight: 52,
            px: { xs: 1, sm: 2 },
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
            {
              fontSize: 12,
            },
        }}
      />
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setSelectedVehicle(null)}
        open={selectedVehicle !== null}
      >
        {selectedVehicle && (
          <>
            <DialogTitle>
              {selectedVehicle.make} {selectedVehicle.model}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={1}>
                {[
                  ['Registration', selectedVehicle.registration_number],
                  ['Variant', selectedVehicle.variant],
                  ['Year', selectedVehicle.manufacture_year ?? 'Unavailable'],
                  [
                    'Odometer',
                    `${selectedVehicle.odometer.toLocaleString()} km`,
                  ],
                  [
                    'Fuel type',
                    fuelTypeLabels[selectedVehicle.fuel_type.toLowerCase()] ??
                      selectedVehicle.fuel_type,
                  ],
                  ['Vehicle type', selectedVehicle.vehicle_type],
                  ['Transmission', selectedVehicle.transmission],
                  ['Color', selectedVehicle.color],
                  ['VIN', selectedVehicle.vin],
                ].map(([label, value]) => (
                  <Stack
                    key={label}
                    sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
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
    </Card>
  )
}

export function VehicleListPage() {
  const { accessToken } = useAuth()
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get('customerId')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VehicleFilter>('all')
  const [fuelType, setFuelType] = useState('all')
  const [sort, setSort] = useState<VehicleSort>('make')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const vehiclesQuery = useQuery({
    enabled: Boolean(accessToken),
    queryFn: () =>
      customerId
        ? getCustomerVehicles(accessToken!, customerId)
        : getVehicles(accessToken!),
    queryKey: customerId
      ? customerVehiclesQueryKey(customerId)
      : vehiclesQueryKey,
  })
  const vehicles = vehiclesQuery.data ?? emptyVehicles
  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return vehicles
      .filter((vehicle) => {
        const matchesFuel =
          fuelType === 'all' || vehicle.fuel_type.toLowerCase() === fuelType
        const matchesSearch =
          !normalizedSearch ||
          [
            vehicle.registration_number,
            vehicle.vin,
            vehicle.make,
            vehicle.model,
            vehicle.variant,
          ].some((value) => value.toLowerCase().includes(normalizedSearch))
        return matchesFuel && matchesSearch
      })
      .sort((left, right) => {
        if (sort === 'year') {
          return (right.manufacture_year ?? 0) - (left.manufacture_year ?? 0)
        }
        if (sort === 'odometer') return right.odometer - left.odometer
        return `${left.make} ${left.model}`.localeCompare(
          `${right.make} ${right.model}`,
        )
      })
  }, [fuelType, search, sort, vehicles])
  const error = vehiclesQuery.error
    ? vehiclesQuery.error instanceof ApiError
      ? vehiclesQuery.error.message
      : 'Unable to load vehicles.'
    : null

  return (
    <Box
      sx={{
        bgcolor: '#f7f8fa',
        minHeight: '100%',
        mx: 'auto',
        maxWidth: 1440,
        p: { xs: 2, sm: 2.5, lg: 3 },
        width: '100%',
      }}
    >
      <Stack
        spacing={1.5}
        sx={{
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography component="h1" variant="h5">
            Vehicles
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Manage registered vehicles, review their details, and track service
            status.
          </Typography>
        </Box>
        <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
          <Button
            disabled={!vehicles.length}
            onClick={() => downloadVehicleCsv(filteredVehicles)}
            size="small"
            startIcon={<DownloadOutlinedIcon />}
            variant="outlined"
          >
            Export CSV
          </Button>
          <Button
            component={RouterLink}
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            to="/vehicles/new"
            variant="contained"
          >
            Register Vehicle
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : vehiclesQuery.isPending ? (
        <Box sx={{ display: 'grid', minHeight: 300, placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              mb: 2.5,
            }}
          >
            {[
              {
                label: 'TOTAL FLEET',
                value: '128',
                badge: '+12 this mo',
                detail: 'Active customer & fleet units',
                color: '#191c1e',
                badgeColor: '#006947',
                badgeBg: '#d9f4e7',
                iconColor: '#0058be',
                icon: <DirectionsCarOutlinedIcon />,
              },
              {
                label: 'IN SERVICE / BAYS',
                value: '18',
                badge: '85% Bay Cap',
                detail: 'Active job cards undergoing work',
                color: '#0058be',
                badgeColor: '#0058be',
                badgeBg: '#e1ecff',
                iconColor: '#0058be',
                icon: <BuildOutlinedIcon />,
              },
              {
                label: 'AWAITING INSPECTION',
                value: '7',
                badge: 'Action Req',
                detail: 'Checked-in & pending triage',
                color: '#a14f00',
                badgeColor: '#8a4300',
                badgeBg: '#fff0d6',
                iconColor: '#a14f00',
                icon: <ContentPasteSearchOutlinedIcon />,
              },
              {
                label: 'READY FOR PICKUP',
                value: '9',
                badge: 'QC Passed',
                detail: 'Pending customer handover',
                color: '#006947',
                badgeColor: '#006947',
                badgeBg: '#d9f4e7',
                iconColor: '#00855b',
                icon: <CheckCircleOutlineOutlinedIcon />,
              },
            ].map((stat) => (
              <Card key={stat.label} variant="outlined">
                <CardContent
                  sx={{
                    height: 122,
                    p: '14px',
                    '&:last-child': { pb: '14px' },
                  }}
                >
                  <Stack
                    sx={{
                      alignItems: 'flex-start',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      sx={{
                        color: '#334155',
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: 0.45,
                        lineHeight: '12px',
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Box
                      sx={{
                        alignItems: 'center',
                        bgcolor: `${stat.iconColor}18`,
                        borderRadius: 0.5,
                        color: stat.iconColor,
                        display: 'flex',
                        height: 26,
                        justifyContent: 'center',
                        width: 26,
                        '& svg': { fontSize: 20 },
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Stack>
                  <Stack
                    sx={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 0.75,
                      mt: 1.25,
                    }}
                  >
                    <Typography
                      sx={{
                        color: stat.color,
                        fontSize: 27,
                        fontWeight: 700,
                        lineHeight: '32px',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Chip
                      label={stat.badge}
                      size="small"
                      sx={{
                        bgcolor: stat.badgeBg,
                        borderRadius: 0.5,
                        color: stat.badgeColor,
                        fontSize: 9,
                        height: 20,
                        '& .MuiChip-label': { px: 0.75, lineHeight: '20px' },
                      }}
                    />
                  </Stack>
                  <Typography
                    color="text.secondary"
                    sx={{
                      color: '#334155',
                      display: 'block',
                      lineHeight: '14px',
                      mt: 0.75,
                      whiteSpace: 'nowrap',
                    }}
                    variant="caption"
                  >
                    {stat.detail}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <Box
              sx={{
                alignItems: { xs: 'stretch', lg: 'center' },
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 1.5,
                justifyContent: 'space-between',
                p: 1.25,
              }}
            >
              <Tabs
                onChange={(_, value: VehicleFilter) => setFilter(value)}
                scrollButtons="auto"
                sx={{
                  flex: '0 1 auto',
                  minWidth: 0,
                  minHeight: 38,
                  '& .MuiTab-root': {
                    borderRadius: 1,
                    minHeight: 36,
                    minWidth: 0,
                    px: 1.5,
                    py: 0.5,
                    textTransform: 'none',
                  },
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#fff !important',
                  },
                }}
                value={filter}
                variant="scrollable"
              >
                <Tab label={`All Vehicles (${vehicles.length})`} value="all" />
                <Tab label="In Service" value="in-service" />
                <Tab label="Ready for Pickup" value="ready-for-pickup" />
              </Tabs>
              <Stack
                sx={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  flex: '1 1 auto',
                  flexWrap: { xs: 'wrap', lg: 'nowrap' },
                  gap: 1,
                  justifyContent: 'flex-end',
                  minWidth: 0,
                }}
              >
                <TextField
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search plate, VIN, make..."
                  size="small"
                  value={search}
                  sx={{
                    flex: { xs: '1 1 100%', lg: '1 1 280px' },
                    minWidth: { xs: '100%', lg: 180 },
                    maxWidth: { lg: 340 },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <FormControl size="small" sx={{ flexShrink: 0, minWidth: 130 }}>
                  <Select
                    aria-label="Filter by fuel type"
                    onChange={(event) => setFuelType(event.target.value)}
                    value={fuelType}
                  >
                    <MenuItem value="all">All Fuel Types</MenuItem>
                    {Object.entries(fuelTypeLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ flexShrink: 0, minWidth: 150 }}>
                  <Select
                    aria-label="Sort vehicles"
                    onChange={(event) =>
                      setSort(event.target.value as VehicleSort)
                    }
                    value={sort}
                  >
                    <MenuItem value="make">Sort: Make A–Z</MenuItem>
                    <MenuItem value="year">Sort: Newest Year</MenuItem>
                    <MenuItem value="odometer">Sort: Highest Mileage</MenuItem>
                  </Select>
                </FormControl>
                <ToggleButtonGroup
                  aria-label="Vehicle display"
                  exclusive
                  onChange={(_, nextView: 'grid' | 'list' | null) => {
                    if (nextView) setView(nextView)
                  }}
                  size="small"
                  sx={{ flexShrink: 0 }}
                  value={view}
                >
                  <ToggleButton aria-label="Grid view" value="grid">
                    <GridViewOutlinedIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton aria-label="List view" value="list">
                    <TableRowsOutlinedIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Box>
          </Card>

          {filteredVehicles.length > 0 ? (
            view === 'list' ? (
              <VehicleListTable vehicles={filteredVehicles} />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                    xl: 'repeat(4, minmax(0, 1fr))',
                  },
                }}
              >
                {filteredVehicles.map((vehicle, index) => (
                  <VehicleCard
                    key={vehicle.id}
                    status={vehicleStatuses[index % vehicleStatuses.length]}
                    vehicle={vehicle}
                  />
                ))}
                <Card
                  variant="outlined"
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'transparent',
                    border: '1px dashed #b9c3cf',
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: 230,
                    p: 2,
                  }}
                >
                  <Stack spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      aria-label="Add a customer"
                      component={RouterLink}
                      sx={{
                        alignItems: 'center',
                        bgcolor: '#e5efff',
                        borderRadius: 1,
                        color: 'primary.main',
                        display: 'flex',
                        height: 36,
                        justifyContent: 'center',
                        textDecoration: 'none',
                        width: 36,
                      }}
                      to="/customers/new"
                    >
                      <AddCircleOutlineIcon />
                    </Box>
                    <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
                      Register New Vehicle
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ maxWidth: 210, textAlign: 'center' }}
                      variant="caption"
                    >
                      Add a customer or workshop vehicle to the registry.
                    </Typography>
                  </Stack>
                </Card>
              </Box>
            )
          ) : (
            <Card variant="outlined">
              <CardContent sx={{ py: 5, textAlign: 'center' }}>
                <DirectionsCarOutlinedIcon
                  color="disabled"
                  sx={{ fontSize: 42 }}
                />
                <Typography sx={{ mt: 1 }} variant="h6">
                  {vehicles.length
                    ? 'No vehicles match these filters'
                    : 'No vehicles registered'}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                  variant="body2"
                >
                  {vehicles.length
                    ? 'Try changing your search or filters.'
                    : 'Register a vehicle to add it to the fleet.'}
                </Typography>
                {!vehicles.length && (
                  <Button
                    component={RouterLink}
                    sx={{ mt: 2 }}
                    to="/vehicles/new"
                    variant="contained"
                  >
                    Register Vehicle
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  )
}

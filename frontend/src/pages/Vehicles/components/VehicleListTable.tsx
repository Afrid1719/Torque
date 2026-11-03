import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import {
  Avatar,
  Button,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'
import {
  fuelTypeLabels,
  vehicleStatuses,
} from '@app/pages/Vehicles/components/vehicleListConfig'
import { VehicleDetailsDialog } from '@app/pages/Vehicles/components/VehicleDetailsDialog'

export function VehicleListTable({ vehicles }: { vehicles: Vehicle[] }) {
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
      <VehicleDetailsDialog
        onClose={() => setSelectedVehicle(null)}
        vehicle={selectedVehicle}
      />
    </Card>
  )
}

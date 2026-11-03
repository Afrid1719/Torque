import { Alert, Box, CircularProgress } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError } from '@app/api/client'
import type { Vehicle } from '@app/api/vehicles'
import {
  customerVehiclesQueryKey,
  getCustomerVehicles,
  getVehicles,
  vehiclesQueryKey,
} from '@app/api/vehicles'
import { useAuth } from '@app/hooks/useAuth'
import { VehicleDashboardStats } from '@app/pages/Vehicles/components/VehicleDashboardStats'
import { VehicleEmptyState } from '@app/pages/Vehicles/components/VehicleEmptyState'
import { VehicleGrid } from '@app/pages/Vehicles/components/VehicleGrid'
import { VehicleListTable } from '@app/pages/Vehicles/components/VehicleListTable'
import type {
  VehicleFilter,
  VehicleSort,
  VehicleView,
} from '@app/pages/Vehicles/components/vehicleListConfig'
import { VehicleListToolbar } from '@app/pages/Vehicles/components/VehicleListToolbar'
import { VehiclePageHeader } from '@app/pages/Vehicles/components/VehiclePageHeader'
import { downloadVehicleCsv } from '@app/pages/Vehicles/components/vehicleListUtils'

const emptyVehicles: Vehicle[] = []

export function VehicleListPage() {
  const { accessToken } = useAuth()
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get('customerId')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VehicleFilter>('all')
  const [fuelType, setFuelType] = useState('all')
  const [sort, setSort] = useState<VehicleSort>('make')
  const [view, setView] = useState<VehicleView>('grid')
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
  const updateFilters = (
    updates: Partial<{
      search: string
      filter: VehicleFilter
      fuelType: string
      sort: VehicleSort
    }>,
  ) => {
    if (updates.search !== undefined) setSearch(updates.search)
    if (updates.filter !== undefined) setFilter(updates.filter)
    if (updates.fuelType !== undefined) setFuelType(updates.fuelType)
    if (updates.sort !== undefined) setSort(updates.sort)
  }
  const clearFilters = () => {
    setSearch('')
    setFilter('all')
    setFuelType('all')
    setSort('make')
  }

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
      <VehiclePageHeader
        onExport={() => downloadVehicleCsv(filteredVehicles)}
        vehicles={vehicles}
      />
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : vehiclesQuery.isPending ? (
        <Box sx={{ display: 'grid', minHeight: 300, placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <VehicleDashboardStats />
          <VehicleListToolbar
            filters={{ search, filter, fuelType, sort }}
            onClearFilters={clearFilters}
            onFiltersChange={updateFilters}
            onViewChange={setView}
            vehicleCount={vehicles.length}
            view={view}
          />
          {filteredVehicles.length === 0 ? (
            <VehicleEmptyState hasVehicles={vehicles.length > 0} />
          ) : view === 'list' ? (
            <VehicleListTable vehicles={filteredVehicles} />
          ) : (
            <VehicleGrid vehicles={filteredVehicles} />
          )}
        </>
      )}
    </Box>
  )
}

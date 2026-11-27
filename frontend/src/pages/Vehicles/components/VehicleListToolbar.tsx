import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined'
import {
  Box,
  Button,
  Card,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import type {
  VehicleFilter,
  VehicleSort,
  VehicleView,
} from '@app/pages/Vehicles/components/vehicleListConfig'
import { fuelTypeLabels } from '@app/pages/Vehicles/components/vehicleListConfig'

export type VehicleListFilters = {
  search: string
  filter: VehicleFilter
  fuelType: string
  sort: VehicleSort
}

export function VehicleListToolbar({
  filters,
  onClearFilters,
  onFiltersChange,
  onViewChange,
  vehicleCount,
  view,
}: {
  filters: VehicleListFilters
  onClearFilters: () => void
  onFiltersChange: (filters: Partial<VehicleListFilters>) => void
  onViewChange: (view: VehicleView) => void
  vehicleCount: number
  view: VehicleView
}) {
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.filter !== 'all' ||
    filters.fuelType !== 'all' ||
    filters.sort !== 'make'

  return (
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
          onChange={(_, filter: VehicleFilter) => onFiltersChange({ filter })}
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
          value={filters.filter}
          variant="scrollable"
        >
          <Tab label={`All Vehicles (${vehicleCount})`} value="all" />
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
            onChange={(event) =>
              onFiltersChange({ search: event.target.value })
            }
            placeholder="Search plate, VIN, make..."
            size="small"
            value={filters.search}
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
              onChange={(event) =>
                onFiltersChange({ fuelType: event.target.value })
              }
              value={filters.fuelType}
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
                onFiltersChange({ sort: event.target.value as VehicleSort })
              }
              value={filters.sort}
            >
              <MenuItem value="make">Sort: Make A–Z</MenuItem>
              <MenuItem value="year">Sort: Newest Year</MenuItem>
              <MenuItem value="odometer">Sort: Highest Mileage</MenuItem>
            </Select>
          </FormControl>
          <Button
            disabled={!hasActiveFilters}
            onClick={onClearFilters}
            size="small"
            startIcon={<RestartAltOutlinedIcon />}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            variant="text"
          >
            Clear filters
          </Button>
          <ToggleButtonGroup
            aria-label="Vehicle display"
            exclusive
            onChange={(_, nextView: VehicleView | null) => {
              if (nextView) onViewChange(nextView)
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
  )
}

import { fireEvent, render, screen } from '@testing-library/react'
import { VehicleListToolbar } from '@app/pages/Vehicles/components/VehicleListToolbar'

const clearFilters = jest.fn()
const filtersChange = jest.fn()
const viewChange = jest.fn()

const defaultFilters = {
  filter: 'all' as const,
  fuelType: 'all',
  search: '',
  sort: 'make' as const,
}

function renderToolbar(filters = defaultFilters) {
  return render(
    <VehicleListToolbar
      filters={filters}
      onClearFilters={clearFilters}
      onFiltersChange={filtersChange}
      onViewChange={viewChange}
      vehicleCount={12}
      view="grid"
    />,
  )
}

beforeEach(() => {
  clearFilters.mockClear()
  filtersChange.mockClear()
  viewChange.mockClear()
})

it('renders default filters and disables clear until a filter changes', () => {
  renderToolbar()

  expect(
    screen.getByRole('tab', { name: 'All Vehicles (12)' }),
  ).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
})

it('forwards search, status, view, and clear changes', () => {
  renderToolbar({ ...defaultFilters, search: 'BMW' })

  fireEvent.change(screen.getByPlaceholderText('Search plate, VIN, make...'), {
    target: { value: 'Honda' },
  })
  expect(filtersChange).toHaveBeenCalledWith({ search: 'Honda' })

  fireEvent.click(screen.getByRole('tab', { name: 'In Service' }))
  expect(filtersChange).toHaveBeenCalledWith({ filter: 'in-service' })

  fireEvent.click(screen.getByRole('button', { name: 'List view' }))
  expect(viewChange).toHaveBeenCalledWith('list')

  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
  expect(clearFilters).toHaveBeenCalledTimes(1)
})

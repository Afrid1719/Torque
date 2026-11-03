import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { VehicleEmptyState } from '@app/pages/Vehicles/components/VehicleEmptyState'

it('explains when filters have no matching results', () => {
  render(
    <MemoryRouter>
      <VehicleEmptyState hasVehicles />
    </MemoryRouter>,
  )

  expect(
    screen.getByText('No vehicles match these filters'),
  ).toBeInTheDocument()
  expect(
    screen.getByText('Try changing your search or filters.'),
  ).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Register Vehicle' })).toBeNull()
})

it('offers registration when the registry is empty', () => {
  render(
    <MemoryRouter>
      <VehicleEmptyState hasVehicles={false} />
    </MemoryRouter>,
  )

  expect(screen.getByText('No vehicles registered')).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Register Vehicle' }),
  ).toHaveAttribute('href', '/vehicles/new')
})

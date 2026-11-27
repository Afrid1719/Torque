import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { VehicleQuickActions } from './VehicleQuickActions'

it('renders quick actions and links job card creation', () => {
  render(
    <MemoryRouter>
      <VehicleQuickActions />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: 'Quick Actions' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: /Create New Job Card/ }),
  ).toHaveAttribute('href', '/job-cards')
  expect(
    screen.getByRole('button', { name: /Log Maintenance Reminder/ }),
  ).toBeDisabled()
  expect(
    screen.getByRole('button', { name: /Transfer Vehicle Ownership/ }),
  ).toBeDisabled()
})

it('keeps unsupported actions disabled', () => {
  render(
    <MemoryRouter>
      <VehicleQuickActions />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('button', { name: /Download Dossier \(PDF\)/ }),
  ).toBeDisabled()
})

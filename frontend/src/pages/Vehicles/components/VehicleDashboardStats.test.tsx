import { render, screen } from '@testing-library/react'
import { VehicleDashboardStats } from '@app/pages/Vehicles/components/VehicleDashboardStats'

it('renders the fleet summary cards', () => {
  render(<VehicleDashboardStats />)

  expect(screen.getByText('TOTAL FLEET')).toBeInTheDocument()
  expect(screen.getByText('IN SERVICE / BAYS')).toBeInTheDocument()
  expect(screen.getByText('AWAITING INSPECTION')).toBeInTheDocument()
  expect(screen.getByText('READY FOR PICKUP')).toBeInTheDocument()
  expect(screen.getByText('Active customer & fleet units')).toBeInTheDocument()
})

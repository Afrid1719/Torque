import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  VehicleActiveJobCard,
  VehicleServiceBayStaff,
  VehicleServiceHistory,
} from './VehicleWorkshopStatus'

it('renders the active job card with its reference and progress phases', () => {
  render(
    <MemoryRouter>
      <VehicleActiveJobCard />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: 'Active Job Card' }),
  ).toBeInTheDocument()
  expect(screen.getByText('JC-9842')).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Open Job Card Desk →' }),
  ).toHaveAttribute('href', '/job-cards')
  expect(screen.getByText(/30,000 km Scheduled Service/)).toBeInTheDocument()
  expect(screen.getByText('2. Mechanical Service')).toBeInTheDocument()
  const completedTask = screen.getByText('Oil & Microfilter Change')
  expect(completedTask).toHaveStyle({ textDecoration: 'line-through' })
  expect(screen.getByText('Front M-Brake Caliper Pads')).toBeInTheDocument()
})

it('renders the service bay staff and pulsing status indicator', () => {
  render(
    <MemoryRouter>
      <VehicleServiceBayStaff />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: 'Service Bay & Staff' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Alex Mercer')).toBeInTheDocument()
  expect(screen.getByText('Bay 02 (Hydraulic 2-Post)')).toBeInTheDocument()
  expect(screen.getByText('Active on Shift')).toBeInTheDocument()
  expect(
    screen.getByText(/Customer reported minor vibration/),
  ).toBeInTheDocument()
  expect(screen.getByLabelText('Staff on shift')).toBeInTheDocument()
})

it('renders service history with invoice, odometer, and cost details', () => {
  render(
    <MemoryRouter>
      <VehicleServiceHistory />
    </MemoryRouter>,
  )

  const table = screen.getByRole('table', { name: 'Workshop service history' })
  expect(
    screen.getByRole('heading', { name: 'Workshop Service History' }),
  ).toBeInTheDocument()
  expect(table).toHaveTextContent('Dec 12, 2024')
  expect(table).toHaveTextContent('INV-4029')
  expect(table).toHaveTextContent('15,102 km')
  expect(table).toHaveTextContent('$240.00')
  expect(table).toHaveTextContent('Warranty')
})

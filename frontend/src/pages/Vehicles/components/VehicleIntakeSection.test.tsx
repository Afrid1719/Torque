import { render, screen } from '@testing-library/react'
import { VehicleIntakeSection } from './VehicleIntakeSection'

it('renders intake notes, checklist state, and fuel level control', () => {
  render(<VehicleIntakeSection />)

  expect(
    screen.getByRole('heading', {
      name: '4. Workshop Initial Intake & Inventory Handover',
    }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('textbox', {
      name: 'Reported Symptoms & Cosmetic Inspection Notes',
    }),
  ).toHaveValue(
    'Customer reports slight intermittent squeak in front right suspension when traversing low-speed speed-bumps. Minor cosmetic scratch (~4cm) observed on rear passenger bumper lower valance prior to bay admission.',
  )
  expect(
    screen.getByRole('checkbox', {
      name: 'Original RC / Registration Card Verified',
    }),
  ).toBeChecked()
  expect(
    screen.getByRole('checkbox', { name: 'Owner Manual & Service Booklet' }),
  ).not.toBeChecked()
  expect(
    screen.getByRole('slider', { name: 'Fuel tank level' }),
  ).toHaveAttribute('aria-valuenow', '75')
  expect(screen.getByRole('slider', { name: 'Fuel tank level' })).toHaveValue(
    '75',
  )
})

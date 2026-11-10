import { fireEvent, render, screen } from '@testing-library/react'
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

it('uses the supplied section number', () => {
  render(<VehicleIntakeSection sectionNumber={3} />)

  expect(
    screen.getByRole('heading', {
      name: '3. Workshop Initial Intake & Inventory Handover',
    }),
  ).toBeInTheDocument()
})

it('renders restored intake values and reports changes for auto-save', () => {
  const onDraftChange = jest.fn()
  const draftValues = {
    fuelTankLevel: 42,
    handoverItems: ['Physical Spare Key Handed Over'],
    intakeNotes: 'Customer reports a vibration.',
  }
  render(
    <VehicleIntakeSection
      draftValues={draftValues}
      onDraftChange={onDraftChange}
    />,
  )

  const notes = screen.getByRole('textbox', {
    name: 'Reported Symptoms & Cosmetic Inspection Notes',
  })
  expect(notes).toHaveValue('Customer reports a vibration.')
  expect(
    screen.getByRole('checkbox', {
      name: 'Physical Spare Key Handed Over',
    }),
  ).toBeChecked()
  expect(
    screen.getByRole('checkbox', {
      name: 'Original RC / Registration Card Verified',
    }),
  ).not.toBeChecked()
  expect(screen.getByRole('slider', { name: 'Fuel tank level' })).toHaveValue(
    '42',
  )

  fireEvent.change(notes, {
    target: { value: 'Customer reports a steering vibration.' },
  })
  fireEvent.click(
    screen.getByRole('checkbox', {
      name: 'Original RC / Registration Card Verified',
    }),
  )

  expect(onDraftChange).toHaveBeenNthCalledWith(
    1,
    'intakeNotes',
    'Customer reports a steering vibration.',
  )
  expect(onDraftChange).toHaveBeenNthCalledWith(2, 'handoverItems', [
    'Physical Spare Key Handed Over',
    'Original RC / Registration Card Verified',
  ])
})

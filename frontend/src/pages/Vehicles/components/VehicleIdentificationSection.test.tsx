import { fireEvent, render, screen } from '@testing-library/react'
import { VehicleIdentificationSection } from './VehicleIdentificationSection'

it('renders identification defaults and routes the VIN scan notice', () => {
  const onNotice = jest.fn()
  render(<VehicleIdentificationSection onNotice={onNotice} />)

  expect(screen.getByDisplayValue('MH12AB1234')).toBeInTheDocument()
  expect(
    screen.getByRole('textbox', {
      name: 'VIN / Chassis Number (17-Digit Standard)',
    }),
  ).toHaveValue('WBA3N5C51FK289410')
  expect(screen.getByRole('combobox', { name: 'Vehicle Make' })).toHaveValue(
    'BMW',
  )
  expect(screen.getByRole('textbox', { name: 'Vehicle Model' })).toHaveValue(
    '330i',
  )
  expect(screen.getByRole('textbox', { name: 'Variant' })).toHaveValue(
    'M Sport LCI',
  )
  expect(screen.getByText('Private')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Scan' }))
  expect(onNotice).toHaveBeenCalledWith(
    'VIN decoder has no live connection in this preview.',
  )
})

it('exposes make suggestions in the combo select', () => {
  render(<VehicleIdentificationSection onNotice={jest.fn()} />)
  const make = screen.getByRole('combobox', { name: 'Vehicle Make' })

  fireEvent.mouseDown(make)

  for (const option of ['BMW', 'Audi', 'Mercedes-Benz', 'Toyota']) {
    expect(screen.getByRole('option', { name: option })).toBeInTheDocument()
  }
})

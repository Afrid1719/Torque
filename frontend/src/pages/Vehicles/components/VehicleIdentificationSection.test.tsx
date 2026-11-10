import { fireEvent, render, screen } from '@testing-library/react'
import type { VehicleEditValues } from './vehicleEditForm'
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

it('uses the supplied section number', () => {
  render(
    <VehicleIdentificationSection onNotice={jest.fn()} sectionNumber={1} />,
  )

  expect(
    screen.getByRole('heading', {
      name: '1. Identification & Vehicle Specifications',
    }),
  ).toBeInTheDocument()
})

it('renders controlled edit values and reports identification changes', () => {
  const onChange = jest.fn()
  const values: VehicleEditValues = {
    color: 'Alpine White',
    engine_capacity: '1998',
    fuel_type: 'petrol',
    is_active: 'true',
    make: 'BMW',
    manufacture_year: '2022',
    model: '330i',
    odometer: '18450',
    registration_number: 'DL02DS2213',
    transmission: 'automatic',
    variant: 'M Sport LCI',
    vehicle_type: 'private',
    vin: 'WBA3N5C51FK289410',
  }
  render(
    <VehicleIdentificationSection
      editMode
      onChange={onChange}
      onNotice={jest.fn()}
      values={values}
    />,
  )

  expect(
    screen.getByRole('textbox', { name: 'License Plate / Registration No.' }),
  ).toHaveValue('DL02DS2213')
  expect(
    screen.getByRole('spinbutton', { name: 'Manufacture Year' }),
  ).toHaveValue(2022)
  fireEvent.change(
    screen.getByRole('textbox', { name: 'License Plate / Registration No.' }),
    { target: { value: 'MH01XY1234' } },
  )

  expect(onChange).toHaveBeenCalledWith('registration_number', 'MH01XY1234')
})

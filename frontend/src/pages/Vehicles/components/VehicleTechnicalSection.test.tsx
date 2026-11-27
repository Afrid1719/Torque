import { fireEvent, render, screen } from '@testing-library/react'
import type { VehicleEditValues } from './vehicleEditForm'
import { VehicleTechnicalSection } from './VehicleTechnicalSection'

it.each([
  ['petrol', 'Petrol'],
  ['diesel', 'Diesel'],
  ['ev', 'Electric'],
  ['hybrid', 'Hybrid'],
  ['cng', 'CNG'],
] as const)('reports the selected %s fuel type', (fuelType, label) => {
  const onFuelTypeChange = jest.fn()
  render(
    <VehicleTechnicalSection
      fuelType={fuelType === 'petrol' ? 'diesel' : 'petrol'}
      onFuelTypeChange={onFuelTypeChange}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: label }))

  expect(onFuelTypeChange).toHaveBeenCalledWith(fuelType)
})

it('renders technical defaults, units, transmission, and diagnostics', () => {
  render(
    <VehicleTechnicalSection fuelType="petrol" onFuelTypeChange={jest.fn()} />,
  )

  expect(
    screen.getByRole('heading', {
      name: '3. Technical & Operational Parameters',
    }),
  ).toBeInTheDocument()
  expect(screen.getByDisplayValue('18450')).toBeInTheDocument()
  expect(screen.getByDisplayValue('1998')).toBeInTheDocument()
  expect(screen.getByText('KM')).toBeInTheDocument()
  expect(
    screen.getByText('Enter engine displacement in cubic centimeters.'),
  ).toBeInTheDocument()
  expect(screen.getByText('Automatic')).toBeInTheDocument()
  expect(screen.getByText('OBD-II Baseline Profile')).toBeInTheDocument()
  expect(screen.getByText('ECU: BOSCH MG1CS024')).toBeInTheDocument()
})

it('uses the supplied section number', () => {
  render(
    <VehicleTechnicalSection
      fuelType="petrol"
      onFuelTypeChange={jest.fn()}
      sectionNumber={2}
    />,
  )

  expect(
    screen.getByRole('heading', {
      name: '2. Technical & Operational Parameters',
    }),
  ).toBeInTheDocument()
})

it('renders controlled edit values and reports technical changes', () => {
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
    <VehicleTechnicalSection
      editMode
      fuelType="petrol"
      onChange={onChange}
      onFuelTypeChange={jest.fn()}
      values={values}
    />,
  )

  const odometer = screen.getByRole('spinbutton', {
    name: 'Current Odometer (km)',
  })
  expect(odometer).toHaveValue(18450)
  expect(screen.queryByText('OBD-II Baseline Profile')).not.toBeInTheDocument()
  fireEvent.change(odometer, { target: { value: '21000' } })
  fireEvent.click(screen.getByRole('button', { name: 'Diesel' }))

  expect(onChange).toHaveBeenCalledWith('odometer', '21000')
  expect(onChange).toHaveBeenCalledWith('fuel_type', 'diesel')
})

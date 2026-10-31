import { fireEvent, render, screen } from '@testing-library/react'
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

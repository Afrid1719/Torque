import { fireEvent, render, screen } from '@testing-library/react'
import { CustomerActivity } from './CustomerActivity'

it('renders empty activity and customer notes', () => {
  render(<CustomerActivity notes="Morning appointments" />)
  expect(screen.getByText('No vehicles registered')).toBeInTheDocument()
  expect(screen.getByText('Morning appointments')).toBeInTheDocument()
  expect(screen.getByText('No service history yet')).toBeInTheDocument()
})

it('calls the add vehicle action', () => {
  const onAddVehicle = jest.fn()
  render(<CustomerActivity notes="" onAddVehicle={onAddVehicle} />)

  fireEvent.click(screen.getByRole('button', { name: 'Add New' }))

  expect(onAddVehicle).toHaveBeenCalledTimes(1)
})

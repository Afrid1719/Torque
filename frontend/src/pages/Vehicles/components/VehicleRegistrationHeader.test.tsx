import { fireEvent, render, screen } from '@testing-library/react'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'
import { VehicleRegistrationHeader } from './VehicleRegistrationHeader'

const customer: CustomerProfileState = {
  email: 'sam@example.com',
  id: 44,
  mobileNumber: '+1 555 0100',
  name: 'Sam Driver',
}

it('renders the title, submit actions, and draft feedback callback', () => {
  const onNotice = jest.fn()
  render(
    <VehicleRegistrationHeader
      customer={customer}
      isSubmitting={false}
      onNotice={onNotice}
    />,
  )

  expect(
    screen.getByRole('heading', { name: 'Register Vehicle' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Save & Register' }),
  ).toHaveAttribute('form', 'register-vehicle-form')
  expect(
    screen.getByRole('button', { name: 'Register & Open Job Card' }),
  ).toHaveAttribute('type', 'submit')

  fireEvent.click(screen.getByRole('button', { name: 'Save as Draft' }))
  expect(onNotice).toHaveBeenCalledWith('Draft saved locally.')
})

it('disables submit actions while a request is pending', () => {
  render(
    <VehicleRegistrationHeader
      customer={customer}
      isSubmitting
      onNotice={jest.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: 'Save & Register' })).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Register & Open Job Card' }),
  ).toBeDisabled()
})

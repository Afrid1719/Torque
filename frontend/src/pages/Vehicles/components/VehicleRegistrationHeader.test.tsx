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
  const onSaveDraft = jest.fn()
  render(
    <VehicleRegistrationHeader
      customer={customer}
      isSubmitting={false}
      onSaveDraft={onSaveDraft}
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
  expect(onSaveDraft).toHaveBeenCalledTimes(1)
})

it('disables submit actions while a request is pending', () => {
  render(
    <VehicleRegistrationHeader
      customer={customer}
      isSubmitting
      onSaveDraft={jest.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: 'Save & Register' })).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Register & Open Job Card' }),
  ).toBeDisabled()
})

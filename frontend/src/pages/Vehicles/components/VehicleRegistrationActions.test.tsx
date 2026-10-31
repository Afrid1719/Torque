import { fireEvent, render, screen } from '@testing-library/react'
import { VehicleRegistrationActions } from './VehicleRegistrationActions'

it('wires footer actions to submit, cancel, and draft callbacks', () => {
  const onCancel = jest.fn()
  const onNotice = jest.fn()
  render(
    <VehicleRegistrationActions
      isSubmitting={false}
      onCancel={onCancel}
      onNotice={onNotice}
    />,
  )

  expect(screen.getByText('Draft auto-saved 2 mins ago')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Save & Register' }),
  ).toHaveAttribute('form', 'register-vehicle-form')
  expect(
    screen.getByRole('button', { name: 'Register & Create Job Card' }),
  ).toHaveAttribute('type', 'submit')

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save as Draft' }))
  expect(onCancel).toHaveBeenCalledTimes(1)
  expect(onNotice).toHaveBeenCalledWith('Draft saved locally.')
})

it('disables footer actions while a request is pending', () => {
  render(
    <VehicleRegistrationActions
      isSubmitting
      onCancel={jest.fn()}
      onNotice={jest.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Save & Register' })).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Register & Create Job Card' }),
  ).toBeDisabled()
})

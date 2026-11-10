import { fireEvent, render, screen } from '@testing-library/react'
import { VehicleRegistrationActions } from './VehicleRegistrationActions'

it('wires footer actions to submit, cancel, and draft callbacks', () => {
  const onCancel = jest.fn()
  const onSaveDraft = jest.fn()
  render(
    <VehicleRegistrationActions
      draftStatus="All changes saved"
      isSubmitting={false}
      onCancel={onCancel}
      onSaveDraft={onSaveDraft}
    />,
  )

  expect(screen.getByText('All changes saved')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Save & Register' }),
  ).toHaveAttribute('form', 'register-vehicle-form')
  expect(
    screen.getByRole('button', { name: 'Register & Create Job Card' }),
  ).toHaveAttribute('type', 'submit')

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save as Draft' }))
  expect(onCancel).toHaveBeenCalledTimes(1)
  expect(onSaveDraft).toHaveBeenCalledTimes(1)
})

it('disables footer actions while a request is pending', () => {
  render(
    <VehicleRegistrationActions
      draftStatus="All changes saved"
      isSubmitting
      onCancel={jest.fn()}
      onSaveDraft={jest.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Save & Register' })).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Register & Create Job Card' }),
  ).toBeDisabled()
})

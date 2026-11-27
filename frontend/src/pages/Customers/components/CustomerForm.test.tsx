import { fireEvent, render, screen } from '@testing-library/react'
import { CustomerForm } from './CustomerForm'

const baseProps = {
  email: '',
  emailInputRef: { current: null },
  fieldErrors: {},
  isCreating: false,
  mobileInputRef: { current: null },
  mobileNumber: '',
  name: '',
  nameInputRef: { current: null },
  onCancel: jest.fn(),
  onSubmit: jest.fn((event) => event.preventDefault()),
  requestError: null,
  updateField: jest.fn(),
}

describe('CustomerForm', () => {
  it('updates fields and exposes the form actions', () => {
    render(<CustomerForm {...baseProps} />)
    fireEvent.change(screen.getByLabelText(/Customer Name/), {
      target: { value: 'John' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(baseProps.updateField).toHaveBeenCalledWith('name', 'John')
    expect(baseProps.onCancel).toHaveBeenCalled()
  })

  it('disables inputs and actions while creating', () => {
    render(<CustomerForm {...baseProps} isCreating />)
    expect(screen.getByLabelText(/Customer Name/)).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /Creating Customer/ }),
    ).toBeDisabled()
  })
})

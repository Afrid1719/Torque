import { isValidMobileNumber, validateCustomer } from './customerValidation'

describe('customer validation', () => {
  it('accepts supported formatted mobile numbers', () => {
    expect(isValidMobileNumber('+91 (98765) 43210')).toBe(true)
  })

  it('returns required and optional-format errors', () => {
    expect(
      validateCustomer({ email: 'invalid', mobileNumber: '', name: ' ' }),
    ).toEqual({
      email: 'Enter a valid email address.',
      mobileNumber: 'Mobile number is required.',
      name: 'Customer name is required.',
    })
  })
})

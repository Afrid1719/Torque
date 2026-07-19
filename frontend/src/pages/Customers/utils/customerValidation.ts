export type CustomerField = 'name' | 'mobileNumber' | 'email'
export type CustomerFieldErrors = Partial<Record<CustomerField, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidMobileNumber(value: string) {
  const normalized = value.trim().replace(/[ \-()]/g, '')
  const digits = normalized.startsWith('+') ? normalized.slice(1) : normalized
  return /^\d{7,15}$/.test(digits)
}

export function validateCustomer(values: {
  email: string
  mobileNumber: string
  name: string
}): CustomerFieldErrors {
  const errors: CustomerFieldErrors = {}
  if (!values.name.trim()) errors.name = 'Customer name is required.'
  if (!values.mobileNumber.trim()) {
    errors.mobileNumber = 'Mobile number is required.'
  } else if (!isValidMobileNumber(values.mobileNumber)) {
    errors.mobileNumber =
      'Enter a valid mobile number containing 7 to 15 digits.'
  }
  if (values.email.trim() && !emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  return errors
}

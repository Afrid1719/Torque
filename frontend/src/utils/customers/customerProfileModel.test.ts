import { customerInitials, toProfileState } from './customerProfileModel'

it('maps API customers and creates initials', () => {
  expect(
    toProfileState({
      address: null,
      created_at: 'now',
      email: null,
      id: 1,
      mobile_number: '1234567',
      name: 'John Smith',
      notes: null,
      updated_at: 'now',
    }),
  ).toMatchObject({ address: '', email: '', name: 'John Smith' })
  expect(customerInitials('John Smith')).toBe('JS')
})

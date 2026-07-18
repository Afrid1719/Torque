import { render, screen } from '@testing-library/react'
import { CustomerCreationSuccess } from './CustomerCreationSuccess'

it('shows the created customer summary', () => {
  render(
    <CustomerCreationSuccess
      customer={{ mobileNumber: '1234567', name: 'John' }}
    />,
  )
  expect(
    screen.getByRole('heading', {
      name: 'Customer Profile Created Successfully',
    }),
  ).toBeInTheDocument()
  expect(screen.getByText('John')).toBeInTheDocument()
  expect(screen.getByText('1234567')).toBeInTheDocument()
})

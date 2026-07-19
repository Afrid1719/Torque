import { render, screen } from '@testing-library/react'
import { CustomerProfileOverview } from './CustomerProfileOverview'

it('renders customer identity and contact details', () => {
  render(
    <CustomerProfileOverview
      customer={{
        address: 'Pune',
        email: 'john@mail.com',
        id: 44,
        mobileNumber: '123',
        name: 'John Doe',
        notes: '',
      }}
    />,
  )
  expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument()
  expect(screen.getByText('JD')).toBeInTheDocument()
  expect(screen.getByText('john@mail.com')).toBeInTheDocument()
})

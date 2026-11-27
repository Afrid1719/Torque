import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CustomerProfileOverview } from './CustomerProfileOverview'

it('renders customer identity and contact details', () => {
  render(
    <MemoryRouter>
      <CustomerProfileOverview
        customer={{
          address: 'Pune',
          email: 'john@mail.com',
          id: 44,
          mobileNumber: '123',
          name: 'John Doe',
          notes: '',
        }}
        editPath="/customers/44/edit"
      />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument()
  expect(screen.getByText('JD')).toBeInTheDocument()
  expect(screen.getByText('john@mail.com')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Edit Profile' })).toHaveAttribute(
    'href',
    '/customers/44/edit',
  )
})

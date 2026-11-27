import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppBreadcrumbs } from './AppBreadcrumbs'

it('renders linked ancestors and marks the current page', () => {
  render(
    <MemoryRouter>
      <AppBreadcrumbs
        items={[
          { label: 'Customers', to: '/customers' },
          { label: 'Robert Harrison', to: '/customers/42' },
          { label: 'New Vehicle' },
        ]}
      />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'Customers' })).toHaveAttribute(
    'href',
    '/customers',
  )
  expect(screen.getByRole('link', { name: 'Robert Harrison' })).toHaveAttribute(
    'href',
    '/customers/42',
  )
  expect(screen.getByText('New Vehicle')).toHaveAttribute(
    'aria-current',
    'page',
  )
})

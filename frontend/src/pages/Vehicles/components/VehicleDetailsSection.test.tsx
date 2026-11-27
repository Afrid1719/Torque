import { render, screen } from '@testing-library/react'
import { VehicleDetailsSection } from './VehicleDetailsSection'

it('renders a semantic section heading with its icon and action', () => {
  render(
    <VehicleDetailsSection
      action={<button type="button">View all</button>}
      icon={<span aria-hidden="true">icon</span>}
      title="Vehicle specifications"
    >
      <p>Section content</p>
    </VehicleDetailsSection>,
  )

  expect(
    screen.getByRole('heading', {
      level: 2,
      name: 'Vehicle specifications',
    }),
  ).toBeInTheDocument()
  expect(screen.getByText('Section content')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument()
})

it('renders a title adornment beside the section heading', () => {
  render(
    <VehicleDetailsSection
      icon={<span aria-hidden="true">icon</span>}
      title="Active job card"
      titleAdornment={<span>JC-9842</span>}
    >
      Content
    </VehicleDetailsSection>,
  )

  expect(
    screen.getByRole('heading', { name: 'Active job card' }),
  ).toBeInTheDocument()
  expect(screen.getByText('JC-9842')).toBeInTheDocument()
})

import { render, screen } from '@testing-library/react'
import { VehicleFormSection } from './VehicleFormSection'

it('renders the shared section heading, detail, and content', () => {
  render(
    <VehicleFormSection
      detail="Section detail"
      icon={<span>Icon</span>}
      title="Section title"
    >
      <p>Section content</p>
    </VehicleFormSection>,
  )

  expect(
    screen.getByRole('heading', { name: 'Section title' }).closest('section'),
  ).toBeInTheDocument()
  expect(screen.getByText('Section detail')).toBeInTheDocument()
  expect(screen.getByText('Section content')).toBeInTheDocument()
})

import { render, screen } from '@testing-library/react'
import { CustomerCreationLoading } from './CustomerCreationLoading'

it('announces customer registration progress', () => {
  render(<CustomerCreationLoading />)
  expect(screen.getByRole('status')).toHaveTextContent('REGISTERING CUSTOMER')
  expect(
    screen.getByLabelText('Customer registration in progress'),
  ).toBeInTheDocument()
})

import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import { render, screen } from '@testing-library/react'
import { CustomerInformationTile } from './CustomerInformationTile'

it('renders customer information', () => {
  render(
    <CustomerInformationTile
      backgroundColor="#fff"
      description="Protected customer data"
      icon={VerifiedUserOutlinedIcon}
      iconColor="#000"
      title="Privacy"
    />,
  )
  expect(screen.getByText('Privacy')).toBeInTheDocument()
  expect(screen.getByText('Protected customer data')).toBeInTheDocument()
})

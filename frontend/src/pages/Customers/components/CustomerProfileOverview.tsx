import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import {
  customerInitials,
  type CustomerProfileState,
} from '@app/pages/Customers/utils/customerProfileModel'

export function CustomerProfileOverview({
  customer,
}: {
  customer: CustomerProfileState
}) {
  return (
    <Card component="section" variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: 3 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                fontSize: 28,
                fontWeight: 700,
                height: 88,
                width: 88,
              }}
            >
              {customerInitials(customer.name) || 'C'}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography component="h1" variant="h4">
                  {customer.name}
                </Typography>
                <Chip color="success" label="NEW CUSTOMER" size="small" />
              </Stack>
              <Typography
                color="text.secondary"
                sx={{ mt: 0.5 }}
                variant="body2"
              >
                Customer profile created today
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 3 }}
                sx={{ mt: 2 }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <PhoneOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    {customer.mobileNumber}
                  </Typography>
                </Stack>
                {customer.email && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <EmailOutlinedIcon color="primary" fontSize="small" />
                    <Typography variant="body2">{customer.email}</Typography>
                  </Stack>
                )}
              </Stack>
              {customer.address && (
                <Typography
                  color="text.secondary"
                  sx={{ mt: 1 }}
                  variant="body2"
                >
                  {customer.address}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<EditOutlinedIcon />} variant="outlined">
              Edit Profile
            </Button>
            <IconButton aria-label="More customer actions" color="primary">
              <MoreVertIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

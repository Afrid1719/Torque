import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useLocation, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@app/api/client'
import {
  customerQueryKey,
  getCustomer,
  type Customer,
} from '@app/api/customers'
import { useAuth } from '@app/hooks/useAuth'

export type CustomerProfileState = {
  address?: string
  createdAt?: string
  email?: string
  id?: number
  mobileNumber: string
  name: string
  notes?: string
}

const fallbackCustomer: CustomerProfileState = {
  mobileNumber: '—',
  name: 'Customer Profile',
}

const stats = [
  {
    icon: EventRepeatOutlinedIcon,
    label: 'Total Visits',
    supportingText: 'No visits recorded',
    value: '0',
  },
  {
    icon: PaymentsOutlinedIcon,
    label: 'Total Spend',
    supportingText: 'No invoices recorded',
    value: '₹0.00',
  },
  {
    icon: CalendarTodayOutlinedIcon,
    label: 'Last Visit',
    supportingText: 'No service history',
    value: '—',
  },
  {
    icon: DirectionsCarOutlinedIcon,
    label: 'Vehicles',
    supportingText: 'No vehicles registered',
    value: '0',
  },
]

function toProfileState(customer: Customer): CustomerProfileState {
  return {
    address: customer.address ?? '',
    createdAt: customer.created_at,
    email: customer.email ?? '',
    id: customer.id,
    mobileNumber: customer.mobile_number,
    name: customer.name,
    notes: customer.notes ?? '',
  }
}

export function CustomerProfilePage() {
  const location = useLocation()
  const { customerId } = useParams()
  const { accessToken } = useAuth()
  const navigationCustomer =
    (location.state as { customer?: CustomerProfileState } | null)?.customer ??
    null
  const customerQuery = useQuery({
    enabled: Boolean(accessToken && customerId),
    queryFn: () => getCustomer(accessToken!, customerId!),
    queryKey: customerQueryKey(customerId ?? ''),
  })
  const customer = customerQuery.data
    ? toProfileState(customerQuery.data)
    : (navigationCustomer ?? fallbackCustomer)
  const loadError = customerQuery.error
    ? customerQuery.error instanceof ApiError
      ? customerQuery.error.message
      : 'Unable to load the customer profile.'
    : null
  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  if (customerQuery.isPending && !navigationCustomer) {
    return (
      <Box sx={{ display: 'grid', minHeight: 400, placeItems: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading customer profile...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (loadError && !navigationCustomer) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Alert severity="error">{loadError}</Alert>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        maxWidth: 1440,
        mx: 'auto',
        p: { xs: 2, sm: 3, lg: 4 },
        width: '100%',
      }}
    >
      <Breadcrumbs
        aria-label="Customer navigation"
        separator="›"
        sx={{ mb: 3 }}
      >
        <Link
          component={RouterLink}
          to="/customers"
          underline="hover"
          variant="caption"
        >
          Customers
        </Link>
        <Typography color="primary" fontWeight={700} variant="caption">
          {customer.name}
        </Typography>
      </Breadcrumbs>

      <Stack spacing={3}>
        {loadError && <Alert severity="warning">{loadError}</Alert>}
        <Card component="section" variant="outlined">
          <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: 3 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{
                alignItems: { md: 'center' },
                justifyContent: 'space-between',
              }}
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
                  {initials || 'C'}
                </Avatar>
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
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
                        <Typography variant="body2">
                          {customer.email}
                        </Typography>
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

        <Box
          component="section"
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}
        >
          {stats.map(({ icon: Icon, label, supportingText, value }) => (
            <Card key={label} variant="outlined">
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      {label}
                    </Typography>
                    <Typography sx={{ mt: 1 }} variant="h5">
                      {value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#d8e2ff', color: 'primary.main' }}>
                    <Icon fontSize="small" />
                  </Avatar>
                </Stack>
                <Typography
                  color="text.secondary"
                  sx={{ mt: 1 }}
                  variant="caption"
                >
                  {supportingText}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          component="section"
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
          }}
        >
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardHeader
                action={
                  <Button size="small" startIcon={<AddCircleOutlineIcon />}>
                    Add New
                  </Button>
                }
                slotProps={{ title: { variant: 'overline' } }}
                title="Registered Vehicles"
              />
              <Divider />
              <CardContent sx={{ py: 5, textAlign: 'center' }}>
                <DirectionsCarOutlinedIcon
                  color="disabled"
                  sx={{ fontSize: 48 }}
                />
                <Typography sx={{ mt: 1 }} variant="h6">
                  No vehicles registered
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                  variant="body2"
                >
                  Add the customer’s first vehicle to begin creating job cards.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                avatar={<NotesOutlinedIcon color="primary" />}
                action={
                  <IconButton aria-label="Edit workshop notes" size="small">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                }
                slotProps={{ title: { variant: 'overline' } }}
                title="Workshop Notes"
              />
              <Divider />
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  {customer.notes || 'No internal notes have been added.'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          <Card variant="outlined">
            <CardHeader
              action={<Button variant="contained">New Job Card</Button>}
              slotProps={{ title: { variant: 'overline' } }}
              title="Service History"
            />
            <Divider />
            <CardContent
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 310,
                textAlign: 'center',
              }}
            >
              <EventRepeatOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
              <Typography sx={{ mt: 1 }} variant="h6">
                No service history yet
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 0.5 }}
                variant="body2"
              >
                Completed and active job cards will appear here.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  )
}

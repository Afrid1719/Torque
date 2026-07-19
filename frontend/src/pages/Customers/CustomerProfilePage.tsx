import {
  Alert,
  Box,
  Breadcrumbs,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useLocation, useParams } from 'react-router'
import { ApiError } from '@app/api/client'
import { customerQueryKey, getCustomer } from '@app/api/customers'
import { useAuth } from '@app/hooks/useAuth'
import { CustomerActivity } from '@app/pages/Customers/components/CustomerActivity'
import { CustomerProfileOverview } from '@app/pages/Customers/components/CustomerProfileOverview'
import { CustomerStats } from '@app/pages/Customers/components/CustomerStats'
import {
  fallbackCustomer,
  toProfileState,
  type CustomerProfileState,
} from '@app/pages/Customers/utils/customerProfileModel'

export type { CustomerProfileState } from '@app/pages/Customers/utils/customerProfileModel'

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
        <Typography color="primary" sx={{ fontWeight: 700 }} variant="caption">
          {customer.name}
        </Typography>
      </Breadcrumbs>
      <Stack spacing={3}>
        {loadError && <Alert severity="warning">{loadError}</Alert>}
        <CustomerProfileOverview customer={customer} />
        <CustomerStats />
        <CustomerActivity notes={customer.notes ?? ''} />
      </Stack>
    </Box>
  )
}

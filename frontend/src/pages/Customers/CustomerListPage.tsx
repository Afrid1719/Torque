import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '@app/api/client'
import { customerListQueryKey, getCustomers } from '@app/api/customers'
import { useAuth } from '@app/hooks/useAuth'
import { CustomerListContent } from '@app/pages/Customers/components/CustomerListContent'

export function CustomerListPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const customerQuery = useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getCustomers(accessToken!, deferredSearch),
    queryKey: customerListQueryKey(deferredSearch),
  })
  const error = customerQuery.error
    ? customerQuery.error instanceof ApiError
      ? customerQuery.error.message
      : 'Unable to load customers. Please try again.'
    : null

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4">
            Customers
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Find customer profiles before adding vehicles or creating job cards.
          </Typography>
        </Box>
        <TextField
          fullWidth
          label="Search customers"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or mobile number"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          value={search}
        />
        <CustomerListContent
          customers={customerQuery.data ?? []}
          error={error}
          isLoading={customerQuery.isPending}
          onSelect={(customerId) => navigate(`/customers/${customerId}`)}
          search={search}
        />
      </Stack>
    </Box>
  )
}

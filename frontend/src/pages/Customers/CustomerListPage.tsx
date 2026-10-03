import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { ApiError } from '@app/api/client'
import { customerListQueryKey, getCustomers } from '@app/api/customers'
import { useAuth } from '@app/hooks/useAuth'
import { CustomerListContent } from '@app/pages/Customers/components/CustomerListContent'
import { CustomerListSummary } from '@app/pages/Customers/components/CustomerListSummary'
import { buildCustomerCsv } from '@app/utils/customers/customerExport'

const customersPerPage = 10

export function CustomerListPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
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
  const customers = customerQuery.data ?? []
  const pageCount = Math.max(1, Math.ceil(customers.length / customersPerPage))
  const currentPage = Math.min(page, pageCount)
  const visibleCustomers = customers.slice(
    (currentPage - 1) * customersPerPage,
    currentPage * customersPerPage,
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleExport = () => {
    const file = new Blob([buildCustomerCsv(customers)], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'customers.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}>
      <Stack spacing={3}>
        <Box
          sx={{
            alignItems: { sm: 'flex-end' },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography component="h1" variant="h5">
              Customers
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
              Manage your workshop&apos;s client database and service history.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              disabled={customerQuery.isPending || customers.length === 0}
              onClick={handleExport}
              startIcon={<FileDownloadOutlinedIcon />}
              variant="outlined"
            >
              Export List
            </Button>
            <Button
              component={RouterLink}
              startIcon={<PersonAddOutlinedIcon />}
              to="/customers/new"
              variant="contained"
            >
              Add New Customer
            </Button>
          </Stack>
        </Box>
        <CustomerListSummary customerCount={customers.length} />
        <CustomerListContent
          customers={visibleCustomers}
          error={error}
          isLoading={customerQuery.isPending}
          onPageChange={setPage}
          onSearchChange={handleSearchChange}
          onSelect={(customerId) => navigate(`/customers/${customerId}`)}
          page={currentPage}
          pageCount={pageCount}
          search={search}
          totalCustomerCount={customers.length}
        />
      </Stack>
    </Box>
  )
}

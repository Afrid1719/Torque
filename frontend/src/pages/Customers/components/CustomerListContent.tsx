import MoreVertIcon from '@mui/icons-material/MoreVert'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlineOutlined'
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { Customer } from '@app/api/customers'
import { customerInitials } from '@app/utils/customers/customerProfileModel'

type CustomerListContentProps = {
  customers: Customer[]
  error: string | null
  isLoading: boolean
  onPageChange: (page: number) => void
  onSearchChange: (search: string) => void
  onSelect: (customerId: number) => void
  page: number
  pageCount: number
  search: string
  totalCustomerCount: number
}

function CustomerListEmptyState({ search }: { search: string }) {
  const hasSearch = Boolean(search.trim())

  return (
    <Box sx={{ px: 3, py: 8, textAlign: 'center' }}>
      {hasSearch ? (
        <SearchOffOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
      ) : (
        <PeopleOutlineIcon color="disabled" sx={{ fontSize: 48 }} />
      )}
      <Typography sx={{ mt: 1 }} variant="h6">
        {hasSearch ? 'No matching customers' : 'No customers yet'}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
        {hasSearch
          ? 'Try searching by a different name or mobile number.'
          : 'Customer records will appear here once they are created.'}
      </Typography>
    </Box>
  )
}

function CustomerListToolbar({
  customerCount,
  page,
  onSearchChange,
  search,
}: Pick<CustomerListContentProps, 'onSearchChange' | 'search' | 'page'> & {
  customerCount: number
}) {
  const rangeStart = customerCount === 0 ? 0 : (page - 1) * 10 + 1
  const rangeEnd = Math.min(page * 10, customerCount)

  return (
    <Box
      sx={{
        alignItems: { sm: 'center' },
        bgcolor: '#f2f4f6',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        justifyContent: 'space-between',
        p: 2,
      }}
    >
      <TextField
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by name or mobile number"
        slotProps={{
          htmlInput: {
            'aria-label': 'Search customers',
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: 440, width: '100%' }}
        value={search}
      />
      <Typography color="text.secondary" variant="caption">
        Showing {rangeStart}-{rangeEnd} of {customerCount} entries
      </Typography>
    </Box>
  )
}

export function CustomerListContent({
  customers,
  error,
  isLoading,
  onPageChange,
  onSearchChange,
  onSelect,
  page,
  pageCount,
  search,
  totalCustomerCount,
}: CustomerListContentProps) {
  return (
    <Paper sx={{ overflow: 'hidden' }} variant="outlined">
      <CustomerListToolbar
        customerCount={totalCustomerCount}
        onSearchChange={onSearchChange}
        page={page}
        search={search}
      />

      {isLoading ? (
        <Box sx={{ display: 'grid', minHeight: 280, placeItems: 'center' }}>
          <CircularProgress aria-label="Loading customers" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : customers.length === 0 ? (
        <CustomerListEmptyState search={search} />
      ) : (
        <TableContainer>
          <Table aria-label="Customers">
            <TableHead
              sx={{
                '& .MuiTableCell-root': {
                  color: '#424754',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  lineHeight: '16px',
                  py: 2,
                  textTransform: 'uppercase',
                },
              }}
            >
              <TableRow sx={{ bgcolor: '#f2f4f6' }}>
                <TableCell>Customer Name</TableCell>
                <TableCell>Contact Info</TableCell>
                <TableCell>Active Job Cards</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow
                  hover
                  key={customer.id}
                  sx={{ '&:hover': { bgcolor: '#f7f9fb' } }}
                >
                  <TableCell>
                    <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#d8e2ff',
                          color: 'primary.main',
                          fontSize: 14,
                          fontWeight: 700,
                          height: 40,
                          width: 40,
                        }}
                      >
                        {customerInitials(customer.name) || 'C'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }} variant="body2">
                          {customer.name}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          ID: #CUST-{customer.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {customer.email && (
                      <Typography variant="body2">{customer.email}</Typography>
                    )}
                    <Typography color="text.secondary" variant="subtitle1">
                      {customer.mobile_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="text.secondary" variant="subtitle1">
                      Not available
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="text.secondary" variant="subtitle1">
                      Not available
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label="—" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label={`Open ${customer.name} profile`}
                      onClick={() => onSelect(customer.id)}
                      size="small"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!isLoading && !error && totalCustomerCount > 0 && (
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: '#f2f4f6',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <Button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            variant="outlined"
          >
            Previous
          </Button>
          <Pagination
            count={pageCount}
            onChange={(_event, nextPage) => onPageChange(nextPage)}
            page={page}
            shape="rounded"
            size="small"
          />
          <Button
            disabled={page === pageCount}
            onClick={() => onPageChange(page + 1)}
            variant="outlined"
          >
            Next
          </Button>
        </Box>
      )}
    </Paper>
  )
}

import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlineOutlined'
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { Customer } from '@app/api/customers'

type CustomerListContentProps = {
  customers: Customer[]
  error: string | null
  isLoading: boolean
  onSelect: (customerId: number) => void
  search: string
}

function EmptyCustomerList({ search }: { search: string }) {
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

export function CustomerListContent({
  customers,
  error,
  isLoading,
  onSelect,
  search,
}: CustomerListContentProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', minHeight: 240, placeItems: 'center' }}>
        <CircularProgress aria-label="Loading customers" />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (customers.length === 0) {
    return <EmptyCustomerList search={search} />
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label="Customers">
        <TableHead>
          <TableRow>
            <TableCell>Customer</TableCell>
            <TableCell>Mobile Number</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow hover key={customer.id}>
              <TableCell>
                <Typography sx={{ fontWeight: 600 }} variant="body2">
                  {customer.name}
                </Typography>
              </TableCell>
              <TableCell>{customer.mobile_number}</TableCell>
              <TableCell align="right">
                <Button onClick={() => onSelect(customer.id)} size="small">
                  View profile
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

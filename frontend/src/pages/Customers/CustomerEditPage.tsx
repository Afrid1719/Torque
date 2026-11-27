import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { ApiError } from '@app/api/client'
import {
  customerQueryKey,
  getCustomer,
  updateCustomer,
  type Customer,
  type UpdateCustomerRequest,
} from '@app/api/customers'
import { useAuth } from '@app/hooks/useAuth'
import {
  validateCustomer,
  type CustomerField,
  type CustomerFieldErrors,
} from '@app/utils/customers/customerValidation'

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 1 } }

export function CustomerEditPage() {
  const { customerId } = useParams()
  const { accessToken } = useAuth()
  const customerQuery = useQuery({
    enabled: Boolean(accessToken && customerId),
    queryFn: () => getCustomer(accessToken!, customerId!),
    queryKey: customerQueryKey(customerId ?? ''),
  })

  if (customerQuery.isPending) {
    return (
      <Box sx={{ display: 'grid', minHeight: 400, placeItems: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading customer details...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (customerQuery.error || !customerQuery.data) {
    const message =
      customerQuery.error instanceof ApiError
        ? customerQuery.error.message
        : 'Unable to load the customer details.'
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    )
  }

  return (
    <CustomerEditForm
      accessToken={accessToken!}
      customer={customerQuery.data}
      key={customerQuery.data.id}
    />
  )
}

function CustomerEditForm({
  accessToken,
  customer,
}: {
  accessToken: string
  customer: Customer
}) {
  const customerId = String(customer.id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState({
    name: customer.name,
    mobileNumber: customer.mobile_number,
    email: customer.email ?? '',
    address: customer.address ?? '',
    notes: customer.notes ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState<CustomerFieldErrors>({})
  const [requestError, setRequestError] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (payload: UpdateCustomerRequest) =>
      updateCustomer(accessToken, customerId, payload),
    onSuccess: (updatedCustomer) => {
      queryClient.setQueryData(
        customerQueryKey(updatedCustomer.id),
        updatedCustomer,
      )
      navigate(`/customers/${updatedCustomer.id}`, {
        replace: true,
        state: { updated: true },
      })
    },
  })

  const updateField = (
    field: CustomerField | 'address' | 'notes',
    value: string,
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (field === 'name' || field === 'mobileNumber' || field === 'email') {
      setFieldErrors((current) => {
        if (!current[field]) return current
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = validateCustomer(values)
    setFieldErrors(errors)
    setRequestError(null)
    if (Object.keys(errors).length > 0) return

    const payload: UpdateCustomerRequest = {
      name: values.name.trim(),
      mobile_number: values.mobileNumber.trim(),
      email: values.email.trim() || null,
      address: values.address.trim() || null,
      notes: values.notes.trim() || null,
    }

    try {
      await mutation.mutateAsync(payload)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setFieldErrors({ mobileNumber: error.message })
        return
      }
      setRequestError(
        error instanceof ApiError
          ? error.message
          : 'Unable to update the customer. Please try again.',
      )
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 1024,
        mx: 'auto',
        p: { xs: 2, sm: 3, lg: 4 },
        width: '100%',
      }}
    >
      <Breadcrumbs
        aria-label="Customer navigation"
        separator="›"
        sx={{ mb: 2 }}
      >
        <Link
          component={RouterLink}
          to="/customers"
          underline="hover"
          variant="caption"
        >
          Customers
        </Link>
        <Link
          component={RouterLink}
          to={`/customers/${customer.id}`}
          underline="hover"
          variant="caption"
        >
          {customer.name}
        </Link>
        <Typography color="primary" sx={{ fontWeight: 700 }} variant="caption">
          Edit Profile
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography component="h1" variant="h4">
          Edit Customer Profile
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
          Update the customer’s contact and workshop information.
        </Typography>
      </Box>

      <Card component="section" variant="outlined">
        <CardHeader
          subheader="Required fields are marked with an asterisk."
          title="Customer Details"
          sx={{ bgcolor: '#f7f9fb', px: { xs: 2, sm: 4 }, py: 3 }}
        />
        <Box component="form" noValidate onSubmit={handleSubmit}>
          {requestError && (
            <Alert severity="error" sx={{ mx: { xs: 2, sm: 4 }, mt: 2 }}>
              {requestError}
            </Alert>
          )}
          <Stack spacing={3} sx={{ p: { xs: 2, sm: 4 } }}>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              }}
            >
              <TextField
                autoComplete="name"
                error={Boolean(fieldErrors.name)}
                fullWidth
                helperText={fieldErrors.name}
                label="Customer Name"
                onChange={(event) => updateField('name', event.target.value)}
                required
                sx={inputSx}
                value={values.name}
              />
              <TextField
                autoComplete="tel"
                error={Boolean(fieldErrors.mobileNumber)}
                fullWidth
                helperText={fieldErrors.mobileNumber}
                label="Mobile Number"
                onChange={(event) =>
                  updateField('mobileNumber', event.target.value)
                }
                required
                sx={inputSx}
                type="tel"
                value={values.mobileNumber}
              />
            </Box>
            <TextField
              autoComplete="email"
              error={Boolean(fieldErrors.email)}
              fullWidth
              helperText={fieldErrors.email}
              label="Email (Optional)"
              onChange={(event) => updateField('email', event.target.value)}
              sx={inputSx}
              type="email"
              value={values.email}
            />
            <TextField
              fullWidth
              label="Address (Optional)"
              minRows={3}
              multiline
              onChange={(event) => updateField('address', event.target.value)}
              sx={inputSx}
              value={values.address}
            />
            <TextField
              fullWidth
              helperText="These notes are visible only to workshop staff."
              label="Workshop Notes (Optional)"
              minRows={4}
              multiline
              onChange={(event) => updateField('notes', event.target.value)}
              sx={inputSx}
              value={values.notes}
            />
          </Stack>
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: '#f2f4f6',
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              gap: 1.5,
              justifyContent: 'flex-end',
              p: { xs: 2, sm: 3 },
            }}
          >
            <Button
              component={RouterLink}
              disabled={mutation.isPending}
              startIcon={<ArrowBackOutlinedIcon />}
              to={`/customers/${customer.id}`}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              disabled={mutation.isPending}
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={16} />
                ) : (
                  <SaveOutlinedIcon />
                )
              }
              type="submit"
              variant="contained"
            >
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

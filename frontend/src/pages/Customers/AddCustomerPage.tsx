import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Link,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@app/api/client'
import {
  createCustomer,
  customerQueryKey,
  type CreateCustomerRequest,
} from '@app/api/customers'
import { useAuth } from '@app/hooks/useAuth'
import type { CustomerProfileState } from '@app/pages/Customers/CustomerProfilePage'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
  },
}

type CustomerFlowState = 'form' | 'loading' | 'success'

type CustomerSummary = CustomerProfileState

type CustomerField = 'name' | 'mobileNumber' | 'email'

type CustomerFieldErrors = Partial<Record<CustomerField, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidMobileNumber(value: string) {
  const normalized = value.trim().replace(/[ \-()]/g, '')
  const digits = normalized.startsWith('+') ? normalized.slice(1) : normalized

  return /^\d{7,15}$/.test(digits)
}

type InformationTileProps = {
  backgroundColor: string
  description: string
  icon: typeof VerifiedUserOutlinedIcon
  iconColor: string
  title: string
}

function InformationTile({
  backgroundColor,
  description,
  icon: Icon,
  iconColor,
  title,
}: InformationTileProps) {
  return (
    <Card
      variant="outlined"
      sx={{ borderColor: 'divider', boxShadow: 'none', height: '100%' }}
    >
      <CardContent
        sx={{ display: 'flex', gap: 2, p: 3, '&:last-child': { pb: 3 } }}
      >
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: backgroundColor,
            borderRadius: 1,
            color: iconColor,
            display: 'flex',
            flexShrink: 0,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Box>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, lineHeight: '16px' }}
          >
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
            variant="subtitle1"
          >
            {description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export function AddCustomerPage() {
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const [flowState, setFlowState] = useState<CustomerFlowState>('form')
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<CustomerFieldErrors>({})
  const [requestError, setRequestError] = useState<string | null>(null)
  const [customerSummary, setCustomerSummary] =
    useState<CustomerSummary | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const isCreating = flowState === 'loading'
  const createCustomerMutation = useMutation({
    mutationFn: (payload: CreateCustomerRequest) => {
      if (!accessToken) throw new Error('Missing authenticated session.')
      return createCustomer(accessToken, payload)
    },
  })

  const updateField = (field: CustomerField, value: string) => {
    if (field === 'name') setName(value)
    if (field === 'mobileNumber') setMobileNumber(value)
    if (field === 'email') setEmail(value)

    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const normalizedName = name.trim()
    const normalizedMobileNumber = mobileNumber.trim()
    const normalizedEmail = email.trim()
    const nextErrors: CustomerFieldErrors = {}

    if (!normalizedName) nextErrors.name = 'Customer name is required.'
    if (!normalizedMobileNumber) {
      nextErrors.mobileNumber = 'Mobile number is required.'
    } else if (!isValidMobileNumber(normalizedMobileNumber)) {
      nextErrors.mobileNumber =
        'Enter a valid mobile number containing 7 to 15 digits.'
    }
    if (normalizedEmail && !emailPattern.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    setFieldErrors(nextErrors)
    setRequestError(null)

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) nameInputRef.current?.focus()
      else if (nextErrors.mobileNumber) mobileInputRef.current?.focus()
      else emailInputRef.current?.focus()
      return
    }

    setFlowState('loading')

    try {
      const address = String(data.get('address') ?? '').trim()
      const notes = String(data.get('notes') ?? '').trim()
      const customer = await createCustomerMutation.mutateAsync({
        address: address || null,
        email: normalizedEmail || null,
        mobile_number: normalizedMobileNumber,
        name: normalizedName,
        notes: notes || null,
      })

      queryClient.setQueryData(customerQueryKey(customer.id), customer)

      setCustomerSummary({
        address: customer.address ?? '',
        createdAt: customer.created_at,
        email: customer.email ?? '',
        id: customer.id,
        mobileNumber: customer.mobile_number,
        name: customer.name,
        notes: customer.notes ?? '',
      })
      setFlowState('success')
    } catch (error) {
      setFlowState('form')
      if (error instanceof ApiError && error.status === 409) {
        setFieldErrors({ mobileNumber: error.message })
        mobileInputRef.current?.focus()
      } else {
        setRequestError(
          error instanceof ApiError
            ? error.message
            : 'Unable to create the customer. Please try again.',
        )
      }
    }
  }

  useEffect(() => {
    if (flowState !== 'success' || !customerSummary) return

    const redirectTimer = window.setTimeout(() => {
      navigate(`/customers/${customerSummary.id}`, {
        replace: true,
        state: { customer: customerSummary },
      })
    }, 5_000)

    return () => window.clearTimeout(redirectTimer)
  }, [customerSummary, flowState, navigate])

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
      <Box
        sx={{
          flex: 1,
          maxWidth: 1024,
          mx: 'auto',
          p: { xs: 2, sm: 3, lg: 4 },
          width: '100%',
        }}
      >
        <Breadcrumbs
          aria-label="Customer navigation"
          separator="›"
          sx={{ mb: 1 }}
        >
          <Link
            component={RouterLink}
            to="/customers"
            underline="hover"
            variant="caption"
          >
            Customers
          </Link>
          <Typography
            color="primary"
            sx={{ fontWeight: 700 }}
            variant="caption"
          >
            Add Customer
          </Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 4 }}>
          <Typography component="h1" variant="h4">
            Add Customer
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Create a customer profile before adding vehicles or service records
          </Typography>
        </Box>

        {flowState === 'loading' && (
          <Card
            aria-live="polite"
            role="status"
            variant="outlined"
            sx={{
              borderColor: 'divider',
              boxShadow: '0 1px 3px rgba(25, 28, 30, 0.08)',
              mb: 3,
              p: 3,
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', color: 'primary.main' }}
                >
                  <CircularProgress aria-hidden size={18} thickness={5} />
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      lineHeight: '16px',
                    }}
                  >
                    REGISTERING CUSTOMER...
                  </Typography>
                </Stack>
                <Typography color="text.secondary" variant="caption">
                  Processing
                </Typography>
              </Stack>
              <LinearProgress aria-label="Customer registration in progress" />
            </Stack>
          </Card>
        )}

        {flowState === 'success' ? (
          <Card
            aria-live="polite"
            role="status"
            variant="outlined"
            sx={{
              alignItems: 'center',
              borderColor: 'divider',
              boxShadow: '0 1px 3px rgba(25, 28, 30, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 500,
              overflow: 'hidden',
              p: { xs: 3, sm: 5 },
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                animation:
                  'customerSuccessScale 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                bgcolor: 'success.main',
                borderRadius: '50%',
                boxShadow: '0 8px 24px rgba(0, 133, 91, 0.24)',
                color: 'success.contrastText',
                display: 'flex',
                height: 96,
                justifyContent: 'center',
                mb: 4,
                width: 96,
                '@keyframes customerSuccessScale': {
                  from: { opacity: 0, transform: 'scale(0.8)' },
                  to: { opacity: 1, transform: 'scale(1)' },
                },
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 54 }} />
            </Box>
            <Typography component="h2" variant="h4">
              Customer Profile Created Successfully
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 560, mb: 4, mt: 1 }}
              variant="body1"
            >
              The customer details have been validated and are ready for the
              next step in the workshop workflow.
            </Typography>

            <Box
              sx={{
                bgcolor: '#f2f4f6',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                maxWidth: 576,
                p: 3,
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Box>
                <Typography color="text.secondary" variant="caption">
                  CUSTOMER NAME
                </Typography>
                <Typography sx={{ mt: 0.5 }} variant="h6">
                  {customerSummary?.name}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="caption">
                  MOBILE NUMBER
                </Typography>
                <Typography sx={{ mt: 0.5 }} variant="h6">
                  {customerSummary?.mobileNumber}
                </Typography>
              </Box>
            </Box>

            <Box
              aria-hidden
              sx={{
                color: 'primary.main',
                opacity: 0.04,
                position: 'absolute',
                right: 24,
                top: 24,
              }}
            >
              <PersonAddOutlinedIcon sx={{ fontSize: 220 }} />
            </Box>
          </Card>
        ) : (
          <Card
            component="section"
            variant="outlined"
            sx={{
              borderColor: 'divider',
              boxShadow: '0 1px 3px rgba(25, 28, 30, 0.08)',
            }}
          >
            <CardHeader
              avatar={
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: '#d8e2ff',
                    borderRadius: '50%',
                    color: 'primary.dark',
                    display: 'flex',
                    height: 40,
                    justifyContent: 'center',
                    width: 40,
                  }}
                >
                  <PersonAddOutlinedIcon fontSize="small" />
                </Box>
              }
              subheader="Information will be used for billing and communication."
              sx={{
                bgcolor: '#f7f9fb',
                px: { xs: 2, sm: 4 },
                py: 3,
                '& .MuiCardHeader-action': { alignSelf: 'center', m: 0 },
                '& .MuiCardHeader-subheader': {
                  fontSize: 11,
                  lineHeight: '14px',
                },
                '& .MuiCardHeader-title': {
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: '28px',
                },
              }}
              title="Customer Details"
              action={
                <Typography
                  color="text.secondary"
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                  variant="caption"
                >
                  * Required Fields
                </Typography>
              }
            />
            <Divider />

            <Box
              component="form"
              id="add-customer-form"
              noValidate
              onSubmit={handleSubmit}
            >
              {requestError && (
                <Alert severity="error" sx={{ m: { xs: 2, sm: 4 }, mb: 0 }}>
                  {requestError}
                </Alert>
              )}
              <Stack
                spacing={4}
                sx={{
                  opacity: isCreating ? 0.55 : 1,
                  p: { xs: 2, sm: 4 },
                  transition: 'opacity 200ms ease',
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gap: 4,
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  }}
                >
                  <TextField
                    autoComplete="name"
                    disabled={isCreating}
                    error={Boolean(fieldErrors.name)}
                    fullWidth
                    helperText={fieldErrors.name}
                    inputRef={nameInputRef}
                    label="Customer Name"
                    name="name"
                    onChange={(event) =>
                      updateField('name', event.target.value)
                    }
                    placeholder="e.g. Michael Chen"
                    required
                    sx={fieldSx}
                    value={name}
                  />
                  <TextField
                    autoComplete="tel"
                    disabled={isCreating}
                    error={Boolean(fieldErrors.mobileNumber)}
                    fullWidth
                    helperText={fieldErrors.mobileNumber}
                    inputRef={mobileInputRef}
                    label="Mobile Number"
                    name="mobile_number"
                    onChange={(event) =>
                      updateField('mobileNumber', event.target.value)
                    }
                    placeholder="e.g. +91 98765 43210"
                    required
                    sx={fieldSx}
                    type="tel"
                    value={mobileNumber}
                  />
                </Box>

                <TextField
                  autoComplete="email"
                  disabled={isCreating}
                  error={Boolean(fieldErrors.email)}
                  fullWidth
                  helperText={fieldErrors.email}
                  inputRef={emailInputRef}
                  label="Email (Optional)"
                  name="email"
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="m.chen@example.com"
                  sx={fieldSx}
                  type="email"
                  value={email}
                />
                <TextField
                  disabled={isCreating}
                  fullWidth
                  label="Address (Optional)"
                  minRows={3}
                  multiline
                  name="address"
                  placeholder="Street address, city, state, and postal code"
                  sx={fieldSx}
                />
                <TextField
                  disabled={isCreating}
                  fullWidth
                  helperText="These notes are for workshop staff only and will not be visible to the customer."
                  label="Internal Notes (Optional)"
                  minRows={4}
                  multiline
                  name="notes"
                  placeholder="Any specific preferences or history notes..."
                  sx={fieldSx}
                />
              </Stack>

              <Divider />
              <Box
                sx={{
                  alignItems: 'center',
                  bgcolor: '#f2f4f6',
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  px: { xs: 2, sm: 4 },
                  py: 3,
                }}
              >
                <Button
                  disabled={isCreating}
                  onClick={() => navigate('/customers')}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isCreating}
                  form="add-customer-form"
                  startIcon={
                    isCreating ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : (
                      <SaveOutlinedIcon />
                    )
                  }
                  type="submit"
                  variant="contained"
                >
                  {isCreating ? 'Creating Customer...' : 'Create Customer'}
                </Button>
              </Box>
            </Box>
          </Card>
        )}

        {flowState !== 'success' && (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              mt: 3,
            }}
          >
            <InformationTile
              backgroundColor="rgba(131, 215, 173, 0.2)"
              description="Customer data is protected and stored according to workshop privacy standards."
              icon={VerifiedUserOutlinedIcon}
              iconColor="#005035"
              title="Data Privacy"
            />
            <InformationTile
              backgroundColor="rgba(173, 198, 255, 0.2)"
              description="Profiles created here are instantly available across the TORQUE application."
              icon={SyncOutlinedIcon}
              iconColor="#004191"
              title="Auto-Sync"
            />
            <InformationTile
              backgroundColor="rgba(213, 227, 252, 0.5)"
              description="Link future service logs and vehicle records to this customer profile."
              icon={HistoryOutlinedIcon}
              iconColor="#556379"
              title="Quick History"
            />
          </Box>
        )}
      </Box>

      <Snackbar
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        open={flowState === 'success'}
        slotProps={{
          content: {
            sx: { bgcolor: '#2d3133', borderRadius: 1 },
          },
        }}
        message={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <CheckCircleIcon color="success" />
            <Box>
              <Typography
                sx={{ color: '#eff1f3', fontWeight: 600 }}
                variant="body2"
              >
                Customer created successfully
              </Typography>
              <Typography
                sx={{ color: '#eff1f3', opacity: 0.75 }}
                variant="caption"
              >
                You will be redirected to the customer profile in 5 seconds.
              </Typography>
            </Box>
          </Stack>
        }
      />
    </Box>
  )
}

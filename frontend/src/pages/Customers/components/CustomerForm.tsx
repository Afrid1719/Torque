import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { FormEvent, RefObject } from 'react'
import type {
  CustomerField,
  CustomerFieldErrors,
} from '@app/utils/customers/customerValidation'

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 1 } }

interface CustomerFormProps {
  email: string
  emailInputRef: RefObject<HTMLInputElement | null>
  fieldErrors: CustomerFieldErrors
  isCreating: boolean
  mobileInputRef: RefObject<HTMLInputElement | null>
  mobileNumber: string
  name: string
  nameInputRef: RefObject<HTMLInputElement | null>
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  requestError: string | null
  updateField: (field: CustomerField, value: string) => void
}

export function CustomerForm(props: CustomerFormProps) {
  const {
    email,
    emailInputRef,
    fieldErrors,
    isCreating,
    mobileInputRef,
    mobileNumber,
    name,
    nameInputRef,
    onCancel,
    onSubmit,
    requestError,
    updateField,
  } = props

  return (
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
          '& .MuiCardHeader-subheader': { fontSize: 11, lineHeight: '14px' },
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
        onSubmit={onSubmit}
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
              onChange={(event) => updateField('name', event.target.value)}
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
          <Button disabled={isCreating} onClick={onCancel} variant="outlined">
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
  )
}

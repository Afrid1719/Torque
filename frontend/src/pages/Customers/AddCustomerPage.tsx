import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import {
  Box,
  Breadcrumbs,
  Link,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { CustomerCreationLoading } from '@app/pages/Customers/components/CustomerCreationLoading'
import { CustomerCreationSuccess } from '@app/pages/Customers/components/CustomerCreationSuccess'
import { CustomerForm } from '@app/pages/Customers/components/CustomerForm'
import { CustomerInformationTile } from '@app/pages/Customers/components/CustomerInformationTile'
import { useAddCustomer } from '@app/pages/Customers/hooks/useAddCustomer'

export function AddCustomerPage() {
  const customerFlow = useAddCustomer()
  const { customerSummary, flowState, navigate } = customerFlow

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

        {flowState === 'loading' && <CustomerCreationLoading />}
        {flowState === 'success' ? (
          <CustomerCreationSuccess customer={customerSummary} />
        ) : (
          <CustomerForm
            {...customerFlow}
            onCancel={() => navigate('/customers')}
            onSubmit={customerFlow.handleSubmit}
          />
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
            <CustomerInformationTile
              backgroundColor="rgba(131, 215, 173, 0.2)"
              description="Customer data is protected and stored according to workshop privacy standards."
              icon={VerifiedUserOutlinedIcon}
              iconColor="#005035"
              title="Data Privacy"
            />
            <CustomerInformationTile
              backgroundColor="rgba(173, 198, 255, 0.2)"
              description="Profiles created here are instantly available across the TORQUE application."
              icon={SyncOutlinedIcon}
              iconColor="#004191"
              title="Auto-Sync"
            />
            <CustomerInformationTile
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
        slotProps={{ content: { sx: { bgcolor: '#2d3133', borderRadius: 1 } } }}
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

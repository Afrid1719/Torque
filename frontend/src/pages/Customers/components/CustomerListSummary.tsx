import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type CustomerListSummaryProps = {
  customerCount: number
}

type SummaryCardProps = {
  children: ReactNode
  label: string
  value: string
}

function SummaryCard({ children, label, value }: SummaryCardProps) {
  return (
    <Paper sx={{ minHeight: 98, p: 2 }} variant="outlined">
      <Typography color="text.secondary" variant="overline">
        {label}
      </Typography>
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mt: 1 }}
      >
        <Typography variant="h4">{value}</Typography>
        {children}
      </Stack>
    </Paper>
  )
}

export function CustomerListSummary({
  customerCount,
}: CustomerListSummaryProps) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
      }}
    >
      <SummaryCard label="Total Clients" value={String(customerCount)}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
          <Typography color="success.dark" variant="caption">
            Current results
          </Typography>
        </Stack>
      </SummaryCard>
      <SummaryCard label="Active This Month" value="—">
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <CheckCircleIcon color="disabled" sx={{ fontSize: 16 }} />
          <Typography color="text.secondary" variant="caption">
            Not available
          </Typography>
        </Stack>
      </SummaryCard>
      <SummaryCard label="New Inquiries" value="—">
        <Typography color="text.secondary" variant="caption">
          Not available
        </Typography>
      </SummaryCard>
      <SummaryCard label="Retention Rate" value="—">
        <Box sx={{ mb: 0.75, width: 64 }}>
          <LinearProgress
            aria-label="Retention rate unavailable"
            value={0}
            variant="determinate"
          />
        </Box>
      </SummaryCard>
    </Box>
  )
}

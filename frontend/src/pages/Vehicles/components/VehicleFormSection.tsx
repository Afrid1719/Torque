import { Box, Card, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export function VehicleFormSection({
  children,
  detail,
  icon,
  title,
}: {
  children: ReactNode
  detail: string
  icon: ReactNode
  title: string
}) {
  return (
    <Card
      component="section"
      sx={{
        border: '1px solid #e8edf3',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(33, 54, 80, 0.035)',
        p: { xs: 2, sm: 2.5, lg: 3 },
      }}
    >
      <Box
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          display: 'flex',
          gap: 1.25,
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
        <Typography
          color="text.secondary"
          sx={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.6,
            textAlign: 'right',
            textTransform: 'uppercase',
          }}
        >
          {detail}
        </Typography>
      </Box>
      {children}
    </Card>
  )
}

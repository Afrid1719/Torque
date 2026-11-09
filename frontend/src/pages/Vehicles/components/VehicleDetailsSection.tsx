import type { ReactNode } from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

type VehicleDetailsSectionProps = {
  children: ReactNode
  icon: ReactNode
  title: ReactNode
  action?: ReactNode
  titleAdornment?: ReactNode
}

export function VehicleDetailsSection({
  action,
  children,
  icon,
  title,
  titleAdornment,
}: VehicleDetailsSectionProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: '#e1e6ed',
        borderRadius: 1.5,
        boxShadow: '0 2px 8px rgba(25, 38, 58, 0.035)',
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.25 } }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}
            >
              <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
              <Typography
                component="h2"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: '24px',
                  m: 0,
                  minWidth: 0,
                }}
              >
                {title}
              </Typography>
              {titleAdornment}
            </Stack>
            {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}

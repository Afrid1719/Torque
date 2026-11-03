import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { vehicleDashboardStats } from '@app/pages/Vehicles/components/vehicleListConfig'

export function VehicleDashboardStats() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        mb: 2.5,
      }}
    >
      {vehicleDashboardStats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} variant="outlined">
            <CardContent
              sx={{
                height: 122,
                p: '14px',
                '&:last-child': { pb: '14px' },
              }}
            >
              <Stack
                sx={{
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{
                    color: '#334155',
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: 0.45,
                    lineHeight: '12px',
                  }}
                >
                  {stat.label}
                </Typography>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: `${stat.iconColor}18`,
                    borderRadius: 0.5,
                    color: stat.iconColor,
                    display: 'flex',
                    height: 26,
                    justifyContent: 'center',
                    width: 26,
                    '& svg': { fontSize: 20 },
                  }}
                >
                  <Icon />
                </Box>
              </Stack>
              <Stack
                sx={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 0.75,
                  mt: 1.25,
                }}
              >
                <Typography
                  sx={{
                    color: stat.color,
                    fontSize: 27,
                    fontWeight: 700,
                    lineHeight: '32px',
                  }}
                >
                  {stat.value}
                </Typography>
                <Chip
                  label={stat.badge}
                  size="small"
                  sx={{
                    bgcolor: stat.badgeBg,
                    borderRadius: 0.5,
                    color: stat.badgeColor,
                    fontSize: 9,
                    height: 20,
                    '& .MuiChip-label': { px: 0.75, lineHeight: '20px' },
                  }}
                />
              </Stack>
              <Typography
                color="text.secondary"
                sx={{
                  color: '#334155',
                  display: 'block',
                  lineHeight: '14px',
                  mt: 0.75,
                  whiteSpace: 'nowrap',
                }}
                variant="caption"
              >
                {stat.detail}
              </Typography>
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}

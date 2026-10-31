import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'

export function CustomerStats({ vehiclesCount = 0 }: { vehiclesCount?: number }) {
  const stats = [
    ['Total Visits', '0', 'No visits recorded', EventRepeatOutlinedIcon],
    ['Total Spend', '₹0.00', 'No invoices recorded', PaymentsOutlinedIcon],
    ['Last Visit', '—', 'No service history', CalendarTodayOutlinedIcon],
    [
      'Vehicles',
      String(vehiclesCount),
      vehiclesCount === 0
        ? 'No vehicles registered'
        : `${vehiclesCount} vehicle${vehiclesCount === 1 ? '' : 's'} registered`,
      DirectionsCarOutlinedIcon,
    ],
  ] as const

  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
      }}
    >
      {stats.map(([label, value, supportingText, Icon]) => (
        <Card key={label} variant="outlined">
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="overline">
                  {label}
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5">
                  {value}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#d8e2ff', color: 'primary.main' }}>
                <Icon fontSize="small" />
              </Avatar>
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
              {supportingText}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

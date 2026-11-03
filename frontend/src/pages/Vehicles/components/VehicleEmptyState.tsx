import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import { Button, Card, CardContent, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'

export function VehicleEmptyState({ hasVehicles }: { hasVehicles: boolean }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 5, textAlign: 'center' }}>
        <DirectionsCarOutlinedIcon color="disabled" sx={{ fontSize: 42 }} />
        <Typography sx={{ mt: 1 }} variant="h6">
          {hasVehicles
            ? 'No vehicles match these filters'
            : 'No vehicles registered'}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
          {hasVehicles
            ? 'Try changing your search or filters.'
            : 'Register a vehicle to add it to the fleet.'}
        </Typography>
        {!hasVehicles && (
          <Button
            component={RouterLink}
            sx={{ mt: 2 }}
            to="/vehicles/new"
            variant="contained"
          >
            Register Vehicle
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

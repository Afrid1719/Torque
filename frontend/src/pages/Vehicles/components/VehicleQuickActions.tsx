import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import { Button, Stack, Tooltip } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { vehicleQuickActions } from '@app/pages/Vehicles/vehicleDetailsDemoData'
import { VehicleDetailsSection } from '@app/pages/Vehicles/components/VehicleDetailsSection'

export function VehicleQuickActions() {
  const actionIcons = [
    AddOutlinedIcon,
    NotificationsActiveOutlinedIcon,
    DownloadOutlinedIcon,
    SwapHorizOutlinedIcon,
  ] as const
  const actionDestinations = ['/job-cards', null, null, null] as const

  return (
    <VehicleDetailsSection
      icon={<DownloadOutlinedIcon fontSize="small" />}
      title="Quick Actions"
    >
      <Stack spacing={0.75}>
        {vehicleQuickActions.map((action, index) => {
          const Icon = actionIcons[index]
          const destination = actionDestinations[index]
          const button = destination ? (
            <Button
              component={RouterLink}
              fullWidth
              startIcon={<Icon />}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
              to={destination}
              variant="text"
            >
              {action}
            </Button>
          ) : (
            <Button
              disabled
              fullWidth
              startIcon={<Icon />}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
              variant="text"
            >
              {action}
            </Button>
          )
          return (
            <Tooltip
              key={action}
              title={destination ? '' : 'This action is not available yet.'}
            >
              <span>{button}</span>
            </Tooltip>
          )
        })}
      </Stack>
    </VehicleDetailsSection>
  )
}

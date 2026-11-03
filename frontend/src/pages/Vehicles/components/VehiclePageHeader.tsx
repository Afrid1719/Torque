import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import type { Vehicle } from '@app/api/vehicles'

export function VehiclePageHeader({
  vehicles,
  onExport,
}: {
  vehicles: Vehicle[]
  onExport: () => void
}) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        mb: 2,
      }}
    >
      <Box>
        <Typography component="h1" variant="h5">
          Vehicles
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
          Manage registered vehicles, review their details, and track service
          status.
        </Typography>
      </Box>
      <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
        <Button
          disabled={!vehicles.length}
          onClick={onExport}
          size="small"
          startIcon={<DownloadOutlinedIcon />}
          variant="outlined"
        >
          Export CSV
        </Button>
        <Button
          component={RouterLink}
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          to="/vehicles/new"
          variant="contained"
        >
          Register Vehicle
        </Button>
      </Stack>
    </Stack>
  )
}

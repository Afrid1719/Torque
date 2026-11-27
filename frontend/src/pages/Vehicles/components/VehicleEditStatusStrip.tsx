import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { Box, Chip, Stack, Switch, Typography } from '@mui/material'
import type { VehicleEditValues } from '@app/pages/Vehicles/components/vehicleEditForm'
import { serviceBayStaff } from '@app/pages/Vehicles/vehicleDetailsDemoData'

const statusStripFontSize = 12

export function VehicleEditStatusStrip({
  onActiveChange,
  values,
}: {
  onActiveChange: (isActive: boolean) => void
  values: VehicleEditValues
}) {
  const isActive = values.is_active === 'true'

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e1e6ed',
        borderLeft: '4px solid #0058be',
        borderRadius: 1.5,
        display: 'grid',
        gap: { xs: 1.5, md: 2 },
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: 'minmax(115px, 0.9fr) minmax(140px, 1.1fr) minmax(130px, 1fr) minmax(120px, 0.9fr) minmax(230px, 1.9fr)',
        },
        alignItems: 'center',
        mb: 2,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.5, sm: 1.25 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          color="text.secondary"
          sx={{ fontSize: statusStripFontSize, fontWeight: 700 }}
        >
          LICENSE PLATE
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', mt: 0.5 }}
        >
          <Typography
            sx={{
              bgcolor: '#f0f2f4',
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: statusStripFontSize,
              fontWeight: 700,
              px: 0.75,
              py: 0.35,
            }}
          >
            {values.registration_number}
          </Typography>
          <VerifiedOutlinedIcon
            aria-label="Registration recorded"
            sx={{ color: '#07875c', fontSize: 16 }}
          />
        </Stack>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          color="text.secondary"
          sx={{ fontSize: statusStripFontSize, fontWeight: 700 }}
        >
          CHASSIS / VIN
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', mt: 0.75, minWidth: 0 }}
        >
          <Typography
            noWrap
            sx={{
              fontFamily: 'monospace',
              fontSize: statusStripFontSize,
              minWidth: 0,
            }}
            title={values.vin}
          >
            {values.vin}
          </Typography>
          <Typography
            aria-label="ISO standard VIN format"
            sx={{
              bgcolor: '#dce8f8',
              borderRadius: 0.25,
              color: '#315b93',
              flexShrink: 0,
              fontSize: statusStripFontSize,
              px: 0.5,
              py: 0.35,
            }}
          >
            ISO 3
          </Typography>
        </Stack>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          color="text.secondary"
          sx={{ fontSize: statusStripFontSize, fontWeight: 700 }}
        >
          WORKSHOP STATUS
        </Typography>
        <Chip
          icon={
            <Box
              aria-hidden="true"
              sx={{
                bgcolor: isActive ? '#09865d' : '#687385',
                borderRadius: '50%',
                height: 7,
                width: 7,
              }}
            />
          }
          label={
            isActive ? `In Service (${serviceBayStaff.shortBay})` : 'Inactive'
          }
          size="small"
          sx={{
            bgcolor: isActive ? '#e5f4ed' : '#eef0f3',
            color: isActive ? '#087443' : '#59616d',
            fontSize: statusStripFontSize,
            fontWeight: 700,
            mt: 0.35,
            '& .MuiChip-icon': { ml: 0.75, mr: -0.5 },
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          color="text.secondary"
          sx={{ fontSize: statusStripFontSize, fontWeight: 700 }}
        >
          LAST SYNC
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ fontSize: statusStripFontSize, mt: 0.75 }}
        >
          Not available
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          minWidth: 0,
        }}
      >
        <Box sx={{ textAlign: 'right', minWidth: 0 }}>
          <Typography sx={{ fontSize: statusStripFontSize, fontWeight: 700 }}>
            Active in Workshop Fleet
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: statusStripFontSize }}
          >
            {isActive
              ? 'Eligible for job scheduling & billing'
              : 'Not eligible for scheduling & billing'}
          </Typography>
        </Box>
        <Switch
          checked={isActive}
          onChange={(_, checked) => onActiveChange(checked)}
          size="small"
          slotProps={{ input: { 'aria-label': 'Active in Workshop Fleet' } }}
        />
      </Stack>
    </Box>
  )
}

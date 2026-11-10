import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import GasMeterOutlinedIcon from '@mui/icons-material/GasMeterOutlined'
import LocalGasStationOutlinedIcon from '@mui/icons-material/LocalGasStationOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import {
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import type { CreateVehicleRequest } from '@app/api/vehicles'
import { VehicleFormSection } from '@app/pages/Vehicles/components/VehicleFormSection'
import { vehicleFieldSx } from '@app/pages/Vehicles/components/vehicleFormStyles'
import type {
  VehicleEditField,
  VehicleEditValues,
} from '@app/pages/Vehicles/components/vehicleEditForm'

export function VehicleTechnicalSection({
  editMode = false,
  fuelType,
  onChange,
  onFuelTypeChange,
  sectionNumber = 3,
  values,
}: {
  editMode?: boolean
  fuelType: CreateVehicleRequest['fuel_type']
  onChange?: (field: VehicleEditField, value: string) => void
  onFuelTypeChange: (fuelType: CreateVehicleRequest['fuel_type']) => void
  sectionNumber?: number
  values?: VehicleEditValues
}) {
  const fieldChange = (name: VehicleEditField) =>
    values ? (value: string) => onChange?.(name, value) : undefined

  return (
    <VehicleFormSection
      detail={
        editMode
          ? 'Powertrain & operating data'
          : 'Powertrain & diagnostic specs'
      }
      icon={<TuneOutlinedIcon fontSize="small" />}
      title={`${editMode ? '' : `${sectionNumber}. `}Technical & Operational Parameters`}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <ToggleButtonGroup
            aria-label="Fuel or powertrain type"
            exclusive
            fullWidth
            onChange={(_, value: string | null) => {
              if (
                value === 'petrol' ||
                value === 'diesel' ||
                value === 'ev' ||
                value === 'cng' ||
                value === 'hybrid'
              ) {
                if (values) {
                  fieldChange('fuel_type')?.(value)
                } else {
                  onFuelTypeChange(value)
                }
              }
            }}
            size="small"
            value={fuelType}
            sx={{
              bgcolor: '#f3f5f8',
              borderRadius: 1,
              gap: 0.25,
              p: 0.5,
              '& .MuiToggleButton-root': {
                border: 0,
                borderRadius: '4px !important',
                flex: 1,
                fontSize: { xs: 9, sm: 10 },
                gap: 0.5,
                minHeight: 32,
                minWidth: 0,
                px: 0.5,
                textTransform: 'none',
                whiteSpace: 'nowrap',
              },
              '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover, & .MuiToggleButton-root.Mui-selected:focus-visible':
                {
                  bgcolor: '#0058be',
                  color: '#fff',
                },
              '& .MuiToggleButton-root.Mui-selected .MuiSvgIcon-root': {
                color: 'inherit',
              },
            }}
          >
            <ToggleButton value="petrol">
              <LocalGasStationOutlinedIcon sx={{ fontSize: 13 }} />
              Petrol
            </ToggleButton>
            <ToggleButton value="diesel">
              <LocalGasStationOutlinedIcon sx={{ fontSize: 13 }} />
              Diesel
            </ToggleButton>
            <ToggleButton value="ev">
              <BoltOutlinedIcon sx={{ fontSize: 13 }} />
              Electric
            </ToggleButton>
            <ToggleButton value="hybrid">
              <BoltOutlinedIcon sx={{ fontSize: 13 }} />
              Hybrid
            </ToggleButton>
            <ToggleButton value="cng">
              <GasMeterOutlinedIcon sx={{ fontSize: 13 }} />
              CNG
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TextField
          defaultValue={values ? undefined : 'automatic'}
          fullWidth
          label="Transmission Type"
          name="transmission"
          onChange={(event) =>
            fieldChange('transmission')?.(event.target.value)
          }
          select
          sx={vehicleFieldSx}
          value={values?.transmission}
        >
          <MenuItem value="manual">Manual</MenuItem>
          <MenuItem value="semi_automatic">Semi-automatic</MenuItem>
          <MenuItem value="automatic">Automatic</MenuItem>
        </TextField>
        <TextField
          defaultValue={values ? undefined : '18450'}
          fullWidth
          helperText={editMode ? undefined : 'Recorded on check-in intake'}
          label={editMode ? 'Current Odometer (km)' : 'Current Odometer'}
          name="odometer"
          onChange={(event) => fieldChange('odometer')?.(event.target.value)}
          required
          sx={vehicleFieldSx}
          type="number"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">KM</InputAdornment>,
            },
          }}
          value={values?.odometer}
        />
        <TextField
          defaultValue={values ? undefined : 1998}
          fullWidth
          helperText={
            editMode
              ? 'Engine displacement in cubic centimeters'
              : 'Enter engine displacement in cubic centimeters.'
          }
          label="Engine Capacity (cc)"
          name="engine_capacity"
          onChange={(event) =>
            fieldChange('engine_capacity')?.(event.target.value)
          }
          sx={vehicleFieldSx}
          type="number"
          slotProps={{ htmlInput: { min: 998, step: 1 } }}
          value={values?.engine_capacity}
        />
        {!editMode && (
          <Box
            sx={{
              display: 'grid',
              gap: 0.75,
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <TextField
              defaultValue="ALLIANZ-882910"
              fullWidth
              label="Insurance Policy"
              name="insurance_policy"
              sx={vehicleFieldSx}
            />
            <TextField
              defaultValue="2026-03-31"
              fullWidth
              label="Expiry"
              name="insurance_expiry"
              sx={vehicleFieldSx}
              type="date"
            />
          </Box>
        )}
      </Box>
      {!editMode && (
        <Box
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            bgcolor: '#f3f5f8',
            borderRadius: 1.5,
            display: 'flex',
            gap: 1.5,
            mt: 2,
            p: 1.5,
          }}
        >
          <Box sx={{ color: 'primary.main', display: 'flex' }}>
            <SpeedOutlinedIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
              OBD-II Baseline Profile
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 11 }}>
              System will sync CAN-bus protocols for BMW G20 platform upon
              initial bay docking.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.75 }}
          >
            <Chip label="ECU: BOSCH MG1CS024" size="small" variant="outlined" />
            <Chip label="ARCH: SP2018" size="small" variant="outlined" />
          </Stack>
        </Box>
      )}
    </VehicleFormSection>
  )
}

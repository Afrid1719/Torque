import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined'
import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material'
import { VehicleFormSection } from '@app/pages/Vehicles/components/VehicleFormSection'
import { vehicleFieldSx } from '@app/pages/Vehicles/components/vehicleFormStyles'
import type {
  VehicleEditField,
  VehicleEditValues,
} from '@app/pages/Vehicles/components/vehicleEditForm'

export function VehicleIdentificationSection({
  editMode = false,
  onChange,
  onNotice,
  sectionNumber = 2,
  values,
}: {
  editMode?: boolean
  onChange?: (field: VehicleEditField, value: string) => void
  onNotice: (message: string) => void
  sectionNumber?: number
  values?: VehicleEditValues
}) {
  const fieldChange = (name: VehicleEditField) =>
    values ? (value: string) => onChange?.(name, value) : undefined

  return (
    <VehicleFormSection
      detail={editMode ? 'VIN & specifications' : 'VIN decoder active'}
      icon={<BadgeOutlinedIcon fontSize="small" />}
      title={`${editMode ? '' : `${sectionNumber}. `}Identification & Vehicle Specifications`}
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
        <TextField
          fullWidth
          defaultValue={values ? undefined : 'MH12AB1234'}
          helperText={
            editMode ? undefined : 'Official vehicle license plate mark'
          }
          label={
            editMode
              ? 'License Plate / Registration No.'
              : 'License Plate / Reg. No.'
          }
          name="registration_number"
          onChange={(event) =>
            fieldChange('registration_number')?.(event.target.value)
          }
          required
          sx={vehicleFieldSx}
          value={values?.registration_number}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">IND</InputAdornment>
              ),
            },
          }}
        />
        <TextField
          fullWidth
          defaultValue={values ? undefined : 'WBA3N5C51FK289410'}
          helperText={editMode ? undefined : '✓ Valid ISO 3779 checksum'}
          label={
            editMode
              ? 'VIN / Chassis Identifier'
              : 'VIN / Chassis Number (17-Digit Standard)'
          }
          name="vin"
          onChange={(event) => fieldChange('vin')?.(event.target.value)}
          required
          sx={{
            ...vehicleFieldSx,
            '& .MuiFormHelperText-root': { color: '#00855b' },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: -0.75 }}>
                  <Button
                    onClick={() =>
                      onNotice(
                        'VIN decoder has no live connection in this preview.',
                      )
                    }
                    size="small"
                    startIcon={<QrCodeScannerOutlinedIcon />}
                    sx={{
                      borderRadius: 1,
                      height: 28,
                      minHeight: 28,
                      minWidth: 48,
                      px: 1,
                      whiteSpace: 'nowrap',
                    }}
                    variant="outlined"
                  >
                    Scan
                  </Button>
                </InputAdornment>
              ),
            },
          }}
          value={values?.vin}
        />
        <Autocomplete
          defaultValue={values ? undefined : 'BMW'}
          freeSolo
          onChange={(_, value) => {
            if (typeof value === 'string') {
              fieldChange('make')?.(value)
            }
          }}
          onInputChange={(_, value) => fieldChange('make')?.(value)}
          options={['BMW', 'Audi', 'Mercedes-Benz', 'Toyota']}
          value={values ? values.make : undefined}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label={editMode ? 'Make / Manufacturer' : 'Vehicle Make'}
              name="make"
              required
              sx={vehicleFieldSx}
            />
          )}
        />
        <TextField
          fullWidth
          defaultValue={values ? undefined : '330i'}
          label={editMode ? 'Model Series' : 'Vehicle Model'}
          name="model"
          onChange={(event) => fieldChange('model')?.(event.target.value)}
          required
          sx={vehicleFieldSx}
          value={values?.model}
        />
        <TextField
          fullWidth
          defaultValue={values ? undefined : 'M Sport LCI'}
          label={editMode ? 'Trim / Specification Variant' : 'Variant'}
          name="variant"
          onChange={(event) => fieldChange('variant')?.(event.target.value)}
          required
          sx={vehicleFieldSx}
          value={values?.variant}
        />
        <TextField
          defaultValue={values ? undefined : 'private'}
          fullWidth
          label="Vehicle Type"
          name="vehicle_type"
          onChange={(event) =>
            fieldChange('vehicle_type')?.(event.target.value)
          }
          required
          select
          sx={vehicleFieldSx}
          value={values?.vehicle_type}
        >
          <MenuItem value="private">Private</MenuItem>
          <MenuItem value="commercial">Commercial</MenuItem>
        </TextField>
        <TextField
          fullWidth
          defaultValue={values ? undefined : 'Portimao Blue Metallic'}
          label={editMode ? 'Exterior Paint & Finish' : 'Exterior Color'}
          name="color"
          onChange={(event) => fieldChange('color')?.(event.target.value)}
          sx={vehicleFieldSx}
          value={values?.color}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    aria-label="Blue paint swatch"
                    sx={{
                      bgcolor: '#0058be',
                      borderRadius: '50%',
                      height: 12,
                      width: 12,
                    }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          defaultValue={values ? undefined : '2022'}
          fullWidth
          label="Manufacture Year"
          name="manufacture_year"
          onChange={(event) =>
            fieldChange('manufacture_year')?.(event.target.value)
          }
          sx={vehicleFieldSx}
          type="number"
          value={values?.manufacture_year}
          slotProps={{
            htmlInput: { min: 1970, max: new Date().getFullYear(), step: 1 },
          }}
        />
      </Box>
    </VehicleFormSection>
  )
}

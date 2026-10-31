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

export function VehicleIdentificationSection({
  onNotice,
}: {
  onNotice: (message: string) => void
}) {
  return (
    <VehicleFormSection
      detail="VIN decoder active"
      icon={<BadgeOutlinedIcon fontSize="small" />}
      title="2. Identification & Vehicle Specifications"
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
          defaultValue="MH12AB1234"
          fullWidth
          helperText="Official vehicle license plate mark"
          label="License Plate / Reg. No."
          name="registration_number"
          required
          sx={vehicleFieldSx}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">IND</InputAdornment>
              ),
            },
          }}
        />
        <TextField
          defaultValue="WBA3N5C51FK289410"
          fullWidth
          helperText="✓ Valid ISO 3779 checksum"
          label="VIN / Chassis Number (17-Digit Standard)"
          name="vin"
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
        />
        <Autocomplete
          defaultValue="BMW"
          freeSolo
          options={['BMW', 'Audi', 'Mercedes-Benz', 'Toyota']}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label="Vehicle Make"
              name="make"
              required
              sx={vehicleFieldSx}
            />
          )}
        />
        <TextField
          defaultValue="330i"
          fullWidth
          label="Vehicle Model"
          name="model"
          required
          sx={vehicleFieldSx}
        />
        <TextField
          defaultValue="M Sport LCI"
          fullWidth
          label="Variant"
          name="variant"
          required
          sx={vehicleFieldSx}
        />
        <TextField
          defaultValue="private"
          fullWidth
          label="Vehicle Type"
          name="vehicle_type"
          required
          select
          sx={vehicleFieldSx}
        >
          <MenuItem value="private">Private</MenuItem>
          <MenuItem value="commercial">Commercial</MenuItem>
        </TextField>
        <TextField
          defaultValue="Portimao Blue Metallic"
          fullWidth
          label="Exterior Color"
          name="color"
          sx={vehicleFieldSx}
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
          defaultValue={2022}
          fullWidth
          label="Manufacture Year"
          name="manufacture_year"
          sx={vehicleFieldSx}
          type="number"
          slotProps={{
            htmlInput: { min: 1970, max: new Date().getFullYear(), step: 1 },
          }}
        />
      </Box>
    </VehicleFormSection>
  )
}

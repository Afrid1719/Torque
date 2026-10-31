import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import LocalGasStationOutlinedIcon from '@mui/icons-material/LocalGasStationOutlined'
import {
  Box,
  Checkbox,
  FormControlLabel,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { VehicleFormSection } from '@app/pages/Vehicles/components/VehicleFormSection'
import { vehicleFieldSx } from '@app/pages/Vehicles/components/vehicleFormStyles'

const handoverItems = [
  'Original RC / Registration Card Verified',
  'Physical Spare Key Handed Over',
  'Owner Manual & Service Booklet',
  'Trunk Wheel Lock Nut Present',
]

export function VehicleIntakeSection() {
  const [fuelTankLevel, setFuelTankLevel] = useState(75)

  return (
    <VehicleFormSection
      detail="Pre-service inspection"
      icon={<FactCheckOutlinedIcon fontSize="small" />}
      title="4. Workshop Initial Intake & Inventory Handover"
    >
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 1.8fr) minmax(220px, 0.8fr)',
          },
        }}
      >
        <Box>
          <TextField
            defaultValue="Customer reports slight intermittent squeak in front right suspension when traversing low-speed speed-bumps. Minor cosmetic scratch (~4cm) observed on rear passenger bumper lower valance prior to bay admission."
            fullWidth
            helperText="Technician initials: AM (Alex Mercer)"
            label="Reported Symptoms & Cosmetic Inspection Notes"
            multiline
            minRows={3}
            name="intake_notes"
            sx={vehicleFieldSx}
          />
          <Typography
            color="text.secondary"
            sx={{ fontSize: 10, mt: 0.25, textAlign: 'right' }}
          >
            182 / 500 characters
          </Typography>
        </Box>
        <Box sx={{ bgcolor: '#f3f5f8', borderRadius: 1.5, p: 1.5 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
            Handover Checklist
          </Typography>
          <Stack spacing={0.25}>
            {handoverItems.map((item, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={index !== 2}
                    name="handover_checklist"
                    size="small"
                    sx={{ p: 0.5 }}
                    value={item}
                  />
                }
                key={item}
                label={item}
                sx={{
                  alignItems: 'center',
                  m: 0,
                  minHeight: 28,
                  width: '100%',
                  '& .MuiFormControlLabel-label': {
                    fontSize: 11,
                    lineHeight: 1.3,
                  },
                }}
              />
            ))}
          </Stack>
          <Stack
            sx={{
              borderTop: '1px solid #dfe4ec',
              mt: 1.25,
              pt: 1.5,
            }}
          >
            <Box
              sx={{
                background:
                  'linear-gradient(135deg, rgba(0, 88, 190, 0.1), rgba(33, 112, 228, 0.025) 72%)',
                border: '1px solid rgba(0, 88, 190, 0.12)',
                borderRadius: 1.5,
                p: 1.25,
              }}
            >
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: 'center' }}
                >
                  <Box
                    sx={{
                      alignItems: 'center',
                      bgcolor: 'rgba(0, 88, 190, 0.12)',
                      borderRadius: 1,
                      color: 'primary.main',
                      display: 'flex',
                      height: 28,
                      justifyContent: 'center',
                      width: 28,
                    }}
                  >
                    <LocalGasStationOutlinedIcon sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
                      Fuel tank level
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 9 }}>
                      Intake estimate
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  aria-live="polite"
                  color="primary.dark"
                  sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}
                >
                  {fuelTankLevel}%
                </Typography>
              </Stack>
              <Slider
                aria-label="Fuel tank level"
                getAriaValueText={(value) => `${value}% full`}
                marks={[
                  { value: 0, label: 'E' },
                  { value: 25, label: '' },
                  { value: 50, label: '' },
                  { value: 75, label: '' },
                  { value: 100, label: 'F' },
                ]}
                max={100}
                min={0}
                onChange={(_, value) =>
                  setFuelTankLevel(typeof value === 'number' ? value : value[0])
                }
                step={1}
                value={fuelTankLevel}
                valueLabelDisplay="auto"
                sx={{
                  color: '#0058be',
                  mb: -0.5,
                  mt: 0.5,
                  mx: 1,
                  width: 'calc(100% - 16px)',
                  '& .MuiSlider-rail': {
                    bgcolor: 'rgba(0, 88, 190, 0.16)',
                    opacity: 1,
                  },
                  '& .MuiSlider-track': { border: 0 },
                  '& .MuiSlider-thumb': {
                    bgcolor: '#fff',
                    border: '2px solid currentColor',
                    boxShadow: '0 1px 5px rgba(0, 64, 140, 0.24)',
                    height: 14,
                    width: 14,
                  },
                  '& .MuiSlider-mark': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    height: 5,
                    width: 2,
                  },
                  '& .MuiSlider-markLabel': {
                    color: '#667085',
                    fontSize: 9,
                    top: 21,
                  },
                  '& .MuiSlider-markActive': { opacity: 1 },
                }}
              />
              <input
                name="fuel_tank_level"
                readOnly
                type="hidden"
                value={fuelTankLevel}
              />
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', mt: 0.5 }}
              >
                <Typography color="text.secondary" sx={{ fontSize: 9 }}>
                  Drag or use arrow keys for 1% adjustments
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 9 }}>
                  {fuelTankLevel === 0
                    ? 'Empty'
                    : fuelTankLevel === 100
                      ? 'Full'
                      : 'Tank level'}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </VehicleFormSection>
  )
}

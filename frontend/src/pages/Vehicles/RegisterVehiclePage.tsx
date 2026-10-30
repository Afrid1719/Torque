import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import LocalGasStationOutlinedIcon from '@mui/icons-material/LocalGasStationOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControlLabel,
  InputAdornment,
  Link,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useState, type FormEvent, type ReactNode } from 'react'
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router'
import type { CustomerProfileState } from '@app/utils/customers/customerProfileModel'

const sampleCustomer: CustomerProfileState = {
  address: 'Bay Area Depot #4',
  email: 'r.harrison@business.com',
  id: 9842,
  mobileNumber: '+1 (555) 234-8902',
  name: 'Robert Harrison',
}

const fieldSx = {
  '& .MuiInputLabel-root': { fontSize: 12, fontWeight: 600 },
  '& .MuiOutlinedInput-root': {
    bgcolor: '#fff',
    borderRadius: 1,
    fontSize: 13,
  },
  '& .MuiFormHelperText-root': { fontSize: 10, mx: 0, mt: 0.5 },
}

function SectionHeading({
  icon,
  title,
  detail,
}: {
  icon: ReactNode
  title: string
  detail: string
}) {
  return (
    <Box
      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        display: 'flex',
        gap: 1.25,
        justifyContent: 'space-between',
        mb: 2,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
          {title}
        </Typography>
      </Stack>
      <Typography
        color="text.secondary"
        sx={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 0.6,
          textAlign: 'right',
          textTransform: 'uppercase',
        }}
      >
        {detail}
      </Typography>
    </Box>
  )
}

function FormSection({
  children,
  icon,
  title,
  detail,
}: {
  children: ReactNode
  icon: ReactNode
  title: string
  detail: string
}) {
  return (
    <Card
      component="section"
      sx={{
        border: '1px solid #e8edf3',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(33, 54, 80, 0.035)',
        p: { xs: 2, sm: 2.5, lg: 3 },
      }}
    >
      <SectionHeading detail={detail} icon={icon} title={title} />
      {children}
    </Card>
  )
}

export function RegisterVehiclePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { customerId } = useParams()
  const customer =
    (location.state as { customer?: CustomerProfileState } | null)?.customer ??
    sampleCustomer
  const [fuelType, setFuelType] = useState('petrol')
  const [notice, setNotice] = useState('')

  const showNotice = (message: string) => setNotice(message)
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    showNotice('Vehicle details are ready to register.')
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        pb: 4,
        px: { xs: 1.5, sm: 2.5, lg: 4 },
        pt: { xs: 2, sm: 2.5 },
      }}
    >
      <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
        <Box
          sx={{
            alignItems: { xs: 'flex-start', lg: 'center' },
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 2,
            justifyContent: 'space-between',
            mb: 2.5,
          }}
        >
          <Box>
            <Breadcrumbs
              aria-label="Vehicle registration breadcrumb"
              separator="›"
              sx={{ mb: 0.75 }}
            >
              <Link component={RouterLink} to="/vehicles" underline="hover">
                Vehicles
              </Link>
              <Link component={RouterLink} to="/customers" underline="hover">
                Customers
              </Link>
              <Link
                component={RouterLink}
                to={`/customers/${customer.id ?? customerId ?? ''}`}
                underline="hover"
              >
                {customer.name}
              </Link>
              <Typography color="primary.main" sx={{ fontWeight: 700 }}>
                Register Vehicle
              </Typography>
            </Breadcrumbs>
            <Typography
              component="h1"
              sx={{ fontSize: { xs: 25, sm: 29 }, fontWeight: 700 }}
            >
              Register Vehicle
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 0.25 }}
              variant="body2"
            >
              Enter vehicle specifications, technical parameters, and owner
              assignment for workshop service tracking.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              width: { xs: '100%', lg: 'auto' },
            }}
          >
            <Button
              onClick={() => showNotice('Draft saved locally.')}
              size="small"
              sx={{ px: 2 }}
              variant="outlined"
            >
              Save Draft
            </Button>
            <Button
              onClick={() =>
                showNotice('Vehicle details are ready to register.')
              }
              size="small"
              startIcon={<SaveOutlinedIcon />}
              variant="contained"
            >
              Save &amp; Register
            </Button>
            <Button
              onClick={() =>
                showNotice(
                  'Vehicle is ready for registration and job card setup.',
                )
              }
              size="small"
              startIcon={<AssignmentTurnedInOutlinedIcon />}
              variant="contained"
            >
              Register &amp; Open Job Card
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            bgcolor: '#fff',
            border: '1px solid #e8edf3',
            borderRadius: 2,
            display: 'flex',
            gap: 1.5,
            justifyContent: 'space-between',
            mb: 2,
            p: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: '#dce8ff',
                color: 'primary.dark',
                height: 40,
                width: 40,
              }}
            >
              <DirectionsCarOutlinedIcon />
            </Avatar>
            <Box>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.7,
                    textTransform: 'uppercase',
                  }}
                >
                  Registry mode
                </Typography>
                <Chip
                  color="success"
                  label="Customer linked"
                  size="small"
                  sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                />
              </Stack>
              <Typography
                color="text.secondary"
                sx={{ fontSize: 12, mt: 0.25 }}
              >
                Pre-assigned entry triggered from Customer Master Profile
                {` #CUST-${customer.id ?? customerId ?? '9842'}`}.
              </Typography>
            </Box>
          </Stack>
          <Typography
            color="text.secondary"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontSize: 10,
              whiteSpace: 'nowrap',
            }}
          >
            TORQUE Spec Engine v4.2&nbsp; ●
          </Typography>
        </Box>

        <Box
          component="form"
          id="register-vehicle-form"
          onSubmit={handleSubmit}
          sx={{ display: 'grid', gap: 2 }}
        >
          <FormSection
            detail="Mandatory for billing"
            icon={<PersonOutlineOutlinedIcon fontSize="small" />}
            title="1. Customer Ownership & Assignment"
          >
            <Box
              sx={{
                alignItems: { xs: 'flex-start', md: 'center' },
                bgcolor: '#f3f5f8',
                borderRadius: 1.5,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 1.5,
                justifyContent: 'space-between',
                p: 1.5,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#dce8ff',
                    borderRadius: 1.5,
                    color: 'primary.dark',
                    fontWeight: 700,
                  }}
                >
                  {customer.name
                    .split(/\s+/)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </Avatar>
                <Box>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 0.75,
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                      {customer.name}
                    </Typography>
                    <Chip
                      color="primary"
                      label={`#CUST-${customer.id ?? customerId ?? '9842'}`}
                      size="small"
                      sx={{ height: 18, fontSize: 9 }}
                    />
                    <Chip
                      label="Gold Fleet Tier"
                      size="small"
                      sx={{ bgcolor: '#e5ebf5', height: 18, fontSize: 9 }}
                    />
                    <Chip
                      color="success"
                      label="Customer Since 2019"
                      size="small"
                      sx={{ height: 18, fontSize: 9 }}
                    />
                  </Stack>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: 11, mt: 0.5 }}
                  >
                    ☎ {customer.mobileNumber}
                    {customer.email && (
                      <>&nbsp;&nbsp; · &nbsp; {customer.email}</>
                    )}
                    {customer.address && (
                      <>&nbsp;&nbsp; · &nbsp; {customer.address}</>
                    )}
                  </Typography>
                </Box>
              </Stack>
              <Button
                onClick={() =>
                  showNotice(
                    'Customer assignment controls will be available soon.',
                  )
                }
                size="small"
                startIcon={<TuneOutlinedIcon />}
                sx={{ bgcolor: '#fff', flexShrink: 0 }}
                variant="outlined"
              >
                Change / Unlink
              </Button>
            </Box>
            <Typography
              color="text.secondary"
              sx={{ fontSize: 11, lineHeight: 1.5, mt: 1 }}
            >
              If registering unassigned workshop inventory, insurance salvage,
              or a quick drive-in inspection without customer record, ownership
              can be attached prior to billing closure.
            </Typography>
          </FormSection>

          <FormSection
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
                defaultValue="7ABC890"
                fullWidth
                helperText="Official vehicle license plate mark"
                label="License Plate / Reg. No."
                required
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">USA</InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                defaultValue="WBA3N5C51FK289410"
                fullWidth
                helperText="✓ Valid ISO 3779 checksum"
                label="VIN / Chassis Number (17-Digit Standard)"
                required
                sx={{
                  ...fieldSx,
                  gridColumn: { sm: 'span 2', lg: 'span 2' },
                  '& .MuiFormHelperText-root': { color: '#00855b' },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() =>
                            showNotice(
                              'VIN decoder has no live connection in this preview.',
                            )
                          }
                          size="small"
                          sx={{ minWidth: 0, px: 1, whiteSpace: 'nowrap' }}
                          variant="outlined"
                        >
                          Scan
                        </Button>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                defaultValue="BMW"
                fullWidth
                label="Vehicle Make"
                required
                select
                sx={fieldSx}
              >
                {['BMW', 'Audi', 'Mercedes-Benz', 'Toyota'].map((make) => (
                  <MenuItem key={make} value={make}>
                    {make}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                defaultValue="330i M Sport LCI"
                fullWidth
                label="Vehicle Model"
                required
                select
                sx={fieldSx}
              >
                {['330i M Sport LCI', '320i Sport', 'M340i'].map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                defaultValue="2022"
                fullWidth
                label="Model Year"
                required
                select
                sx={fieldSx}
              >
                {['2024', '2023', '2022', '2021', '2020'].map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                defaultValue="Portimao Blue Metallic"
                fullWidth
                label="Exterior Color"
                sx={fieldSx}
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
                defaultValue="Sedan / Saloon"
                fullWidth
                label="Body Configuration"
                select
                sx={fieldSx}
              >
                {['Sedan / Saloon', 'Coupe', 'Hatchback', 'SUV'].map((body) => (
                  <MenuItem key={body} value={body}>
                    {body}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                defaultValue="Munich, Germany (Werk 1.1)"
                fullWidth
                label="Assembly Origin"
                sx={fieldSx}
              />
            </Box>
            <Typography
              color="text.secondary"
              sx={{ fontSize: 10, mt: 0.75, textAlign: { sm: 'right' } }}
            >
              Characters: 17/17
            </Typography>
          </FormSection>

          <FormSection
            detail="Powertrain & diagnostic specs"
            icon={<TuneOutlinedIcon fontSize="small" />}
            title="3. Technical & Operational Parameters"
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
                <Typography
                  component="label"
                  sx={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    mb: 0.75,
                  }}
                >
                  Fuel / Powertrain Type *
                </Typography>
                <ToggleButtonGroup
                  aria-label="Fuel or powertrain type"
                  exclusive
                  fullWidth
                  onChange={(_, value: string | null) => {
                    if (value) setFuelType(value)
                  }}
                  size="small"
                  value={fuelType}
                  sx={{
                    bgcolor: '#f3f5f8',
                    '& .MuiToggleButton-root': {
                      border: 0,
                      fontSize: 11,
                      minHeight: 36,
                      px: 0.75,
                      textTransform: 'none',
                    },
                    '& .Mui-selected': {
                      bgcolor: 'primary.main !important',
                      color: '#fff !important',
                    },
                  }}
                >
                  <ToggleButton value="petrol">
                    <LocalGasStationOutlinedIcon
                      sx={{ fontSize: 15, mr: 0.5 }}
                    />
                    Petrol
                  </ToggleButton>
                  <ToggleButton value="diesel">Diesel</ToggleButton>
                  <ToggleButton value="electric">
                    <BoltOutlinedIcon sx={{ fontSize: 15, mr: 0.5 }} />
                    Electric
                  </ToggleButton>
                  <ToggleButton value="hybrid">Hybrid</ToggleButton>
                  <ToggleButton value="cng">CNG</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <TextField
                defaultValue="8-Speed Steptronic Automatic"
                fullWidth
                label="Transmission Type"
                select
                sx={fieldSx}
              >
                {[
                  '8-Speed Steptronic Automatic',
                  '6-Speed Manual',
                  'CVT Automatic',
                ].map((transmission) => (
                  <MenuItem key={transmission} value={transmission}>
                    {transmission}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                defaultValue="18450"
                fullWidth
                helperText="Recorded on check-in intake"
                label="Current Odometer"
                required
                sx={fieldSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">KM</InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                defaultValue="1998 cc (2.0L TwinPower Turbo)"
                fullWidth
                helperText="Inline-4 B48 Engine Code"
                label="Displacement / Motor"
                sx={fieldSx}
              />
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
                  sx={fieldSx}
                />
                <TextField
                  defaultValue="2026-03-31"
                  fullWidth
                  label="Expiry"
                  sx={fieldSx}
                  type="date"
                />
              </Box>
            </Box>
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
                <Chip
                  label="ECU: BOSCH MG1CS024"
                  size="small"
                  variant="outlined"
                />
                <Chip label="ARCH: SP2018" size="small" variant="outlined" />
              </Stack>
            </Box>
          </FormSection>

          <FormSection
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
                  sx={fieldSx}
                />
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: 10, mt: 0.25, textAlign: 'right' }}
                >
                  182 / 500 characters
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: '#f3f5f8',
                  borderRadius: 1.5,
                  p: 1.5,
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
                  Handover Checklist
                </Typography>
                <Stack>
                  {[
                    'Original RC / Registration Card Verified',
                    'Physical Spare Key Handed Over',
                    'Owner Manual & Service Booklet',
                    'Trunk Wheel Lock Nut Present',
                  ].map((item, index) => (
                    <FormControlLabel
                      control={
                        <Checkbox defaultChecked={index !== 2} size="small" />
                      }
                      key={item}
                      label={item}
                      sx={{
                        alignItems: 'flex-start',
                        my: -0.5,
                        '& .MuiFormControlLabel-label': { fontSize: 11 },
                      }}
                    />
                  ))}
                </Stack>
                <Stack
                  direction="row"
                  sx={{
                    borderTop: '1px solid #dfe4ec',
                    justifyContent: 'space-between',
                    mt: 1,
                    pt: 1,
                  }}
                >
                  <Typography color="text.secondary" sx={{ fontSize: 10 }}>
                    Fuel Tank Level
                  </Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
                    ~ 75% Full
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </FormSection>

          <Box
            sx={{
              alignItems: { xs: 'stretch', sm: 'center' },
              bgcolor: '#fff',
              border: '1px solid #e8edf3',
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(25, 40, 60, 0.1)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.25,
              justifyContent: 'space-between',
              p: 1.5,
              position: 'sticky',
              bottom: 12,
              zIndex: 1,
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                gap: 1.5,
                justifyContent: 'space-between',
              }}
            >
              <Button
                onClick={() =>
                  navigate(`/customers/${customer.id ?? customerId ?? ''}`)
                }
                size="small"
                startIcon={<CloseOutlinedIcon />}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Typography color="text.secondary" sx={{ fontSize: 10 }}>
                Draft auto-saved 2 mins ago
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{ gap: 1, width: { xs: '100%', sm: 'auto' } }}
            >
              <Button
                onClick={() => showNotice('Draft saved locally.')}
                size="small"
                variant="outlined"
              >
                Save as Draft
              </Button>
              <Button
                onClick={() =>
                  showNotice('Vehicle details are ready to register.')
                }
                size="small"
                variant="contained"
              >
                Save Vehicle Record
              </Button>
              <Button
                startIcon={<CheckCircleOutlineOutlinedIcon />}
                size="small"
                type="submit"
                variant="contained"
              >
                Register &amp; Create Job Card
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
      <Snackbar
        autoHideDuration={3500}
        onClose={() => setNotice('')}
        open={Boolean(notice)}
      >
        <Alert
          onClose={() => setNotice('')}
          severity="info"
          sx={{ width: '100%' }}
        >
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  )
}

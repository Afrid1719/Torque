import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined'
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined'
import { keyframes } from '@emotion/react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  LinearProgress,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router'
import {
  activeJobCard,
  serviceBayStaff,
  vehicleServiceHistory,
} from '@app/pages/Vehicles/vehicleDetailsDemoData'
import { VehicleDetailsSection } from '@app/pages/Vehicles/components/VehicleDetailsSection'

const statusDotPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.35);
  }
`

export function VehicleActiveJobCard() {
  return (
    <VehicleDetailsSection
      action={
        <Button
          component={RouterLink}
          size="small"
          to="/job-cards"
          variant="text"
        >
          Open Job Card Desk →
        </Button>
      }
      icon={<AssignmentOutlinedIcon fontSize="small" />}
      titleAdornment={
        <Chip
          label={activeJobCard.reference}
          size="small"
          sx={{
            bgcolor: '#e5edf8',
            color: '#315b93',
            fontSize: 9,
            fontWeight: 700,
            height: 20,
          }}
        />
      }
      title="Active Job Card"
    >
      <Stack
        spacing={1.25}
        sx={{ bgcolor: '#f4f6f8', borderRadius: 1, p: { xs: 1.5, sm: 2 } }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
              {activeJobCard.title}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 0.25 }}
              variant="caption"
            >
              {activeJobCard.startedAt} · Est. Completion:{' '}
              {activeJobCard.estimatedCompletion}
            </Typography>
          </Box>
          <Chip
            label={activeJobCard.phase}
            size="small"
            sx={{
              alignSelf: { xs: 'flex-start', sm: 'center' },
              bgcolor: '#dce8f8',
              color: '#315b93',
              fontSize: 10,
              fontWeight: 700,
            }}
          />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gap: 0.5,
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          }}
        >
          {activeJobCard.steps.map((step) => (
            <Stack
              key={step.label}
              direction="row"
              spacing={0.4}
              sx={{
                alignItems: 'center',
                color:
                  step.state === 'complete'
                    ? '#087443'
                    : step.state === 'active'
                      ? '#0058be'
                      : 'text.secondary',
                minWidth: 0,
              }}
            >
              {step.state === 'complete' ? (
                <CheckCircleOutlineOutlinedIcon
                  aria-hidden="true"
                  sx={{ flexShrink: 0, fontSize: 12 }}
                />
              ) : step.state === 'active' ? (
                <Box
                  aria-hidden="true"
                  sx={{
                    bgcolor: '#0058be',
                    borderRadius: '50%',
                    flexShrink: 0,
                    height: 6,
                    width: 6,
                  }}
                />
              ) : (
                <Box aria-hidden="true" sx={{ flexShrink: 0, width: 6 }} />
              )}
              <Typography
                noWrap
                sx={{
                  fontSize: { xs: 8, sm: 10 },
                  fontWeight: step.state === 'upcoming' ? 400 : 600,
                  minWidth: 0,
                }}
              >
                {step.label}
              </Typography>
            </Stack>
          ))}
        </Box>
        <LinearProgress
          aria-label="Job card progress"
          value={activeJobCard.progress}
          variant="determinate"
          sx={{
            bgcolor: '#e1e5ea',
            borderRadius: 1,
            height: 6,
            '& .MuiLinearProgress-bar': { bgcolor: '#087443' },
          }}
        />
        <Typography
          color="text.secondary"
          sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4 }}
        >
          CHECKLIST PROGRESS
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, minmax(0, 1fr))',
            },
          }}
        >
          {activeJobCard.checklist.map((item) => {
            const Icon =
              item.state === 'complete'
                ? CheckCircleOutlineOutlinedIcon
                : item.state === 'active'
                  ? HourglassTopOutlinedIcon
                  : CircleOutlinedIcon
            return (
              <Stack
                key={item.label}
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: 'center',
                  bgcolor: '#fff',
                  borderRadius: 0.75,
                  color:
                    item.state === 'complete'
                      ? '#087443'
                      : item.state === 'active'
                        ? '#0058be'
                        : '#7b8490',
                  minHeight: 38,
                  px: 1,
                  py: 0.5,
                }}
              >
                <Icon sx={{ flexShrink: 0, fontSize: 15 }} />
                <Typography
                  sx={{
                    color:
                      item.state === 'upcoming'
                        ? 'text.secondary'
                        : 'text.primary',
                    fontSize: 10,
                    lineHeight: 1.25,
                    textDecoration:
                      item.state === 'complete' ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                </Typography>
              </Stack>
            )
          })}
        </Box>
      </Stack>
    </VehicleDetailsSection>
  )
}

export function VehicleServiceBayStaff() {
  return (
    <VehicleDetailsSection
      action={
        <Box
          aria-label="Staff on shift"
          sx={{
            animation: `${statusDotPulse} 1.6s ease-in-out infinite`,
            bgcolor: '#087443',
            borderRadius: '50%',
            height: 8,
            width: 8,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        />
      }
      icon={<EngineeringOutlinedIcon fontSize="small" />}
      title="Service Bay & Staff"
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            sx={{ bgcolor: 'primary.main', height: 40, width: 40 }}
          >
            <HandymanOutlinedIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700 }} variant="body2">
              {serviceBayStaff.technician}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {serviceBayStaff.role}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1} sx={{ bgcolor: '#f4f6f8', borderRadius: 1, p: 1.5 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between' }}
          >
            <Typography sx={{ color: '#475467' }} variant="caption">
              Station / Bay
            </Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 600, maxWidth: '60%' }}>
              {serviceBayStaff.bay}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between' }}
          >
            <Typography sx={{ color: '#475467' }} variant="caption">
              Shift Status
            </Typography>
            <Typography
              sx={{ color: '#087443', fontSize: 10, fontWeight: 700 }}
            >
              {serviceBayStaff.shiftStatus}
            </Typography>
          </Stack>
          <Typography
            sx={{
              color: '#344054',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.4,
              pt: 0.5,
            }}
          >
            TECHNICIAN INTAKE MEMO
          </Typography>
          <Box sx={{ bgcolor: '#fff', p: 1 }}>
            <Typography
              sx={{ color: '#344054', fontSize: 11, fontStyle: 'italic' }}
            >
              “{serviceBayStaff.intakeMemo}”
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </VehicleDetailsSection>
  )
}

export function VehicleServiceHistory() {
  return (
    <VehicleDetailsSection
      action={
        <Button
          component={RouterLink}
          size="small"
          to="/job-cards"
          variant="text"
        >
          View All Past Invoices
        </Button>
      }
      icon={<HistoryOutlinedIcon fontSize="small" />}
      title="Workshop Service History"
    >
      <Box sx={{ overflowX: 'auto' }}>
        <Table
          aria-label="Workshop service history"
          size="small"
          sx={{
            minWidth: 540,
            '& .MuiTableCell-root': {
              borderColor: '#e7ebf0',
              px: 0.75,
              py: 1,
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              bgcolor: '#f4f6f8',
              color: '#344054',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.25,
              whiteSpace: 'nowrap',
            },
            '& .MuiTableBody-root .MuiTableCell-root': {
              color: '#344054',
              fontSize: 11,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Work Performed</TableCell>
              <TableCell>Odometer</TableCell>
              <TableCell>Lead Tech</TableCell>
              <TableCell align="center" sx={{ width: 76 }}>
                Invoice
              </TableCell>
              <TableCell align="right" sx={{ width: 72 }}>
                Cost
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicleServiceHistory.map((visit) => (
              <TableRow key={visit.invoice}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {visit.date}
                </TableCell>
                <TableCell sx={{ minWidth: 145 }}>
                  <Typography
                    sx={{ color: '#191c1e', fontSize: 11, fontWeight: 600 }}
                  >
                    {visit.workPerformed}
                  </Typography>
                  <Typography sx={{ color: '#475467', fontSize: 10 }}>
                    {visit.details}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {visit.odometer}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {visit.leadTech}
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Chip
                    label={visit.invoice}
                    size="small"
                    sx={{
                      bgcolor: '#edf2f8',
                      '& .MuiChip-label': { px: 0.6 },
                      color: '#315b93',
                      fontFamily: 'monospace',
                      fontSize: 9,
                      height: 20,
                      maxWidth: '100%',
                    }}
                  />
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      visit.cost === 'Warranty' ? '#087443' : 'text.primary',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    width: 72,
                  }}
                >
                  {visit.cost}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'space-between' }}
      >
        <Typography color="text.secondary" variant="caption">
          Showing {vehicleServiceHistory.length} completed workshop visits
        </Typography>
        <Link
          component={RouterLink}
          sx={{ fontSize: 10, textDecoration: 'none' }}
          to="/job-cards"
        >
          ✓ Full service logs synchronized with workshop records
        </Link>
      </Stack>
    </VehicleDetailsSection>
  )
}

export const activeJobCard = {
  reference: 'JC-9842',
  title: '30,000 km Scheduled Service & Front Brake Pad Replacement',
  startedAt: 'Initiated today at 08:30 AM',
  estimatedCompletion: '03:00 PM',
  phase: 'Phase 2: In Servicing',
  progress: 66,
  steps: [
    { label: '1. Intake & Check-in', state: 'complete' },
    { label: '2. Mechanical Service', state: 'active' },
    { label: '3. Quality Inspection & Wash', state: 'upcoming' },
  ],
  checklist: [
    { label: 'Oil & Microfilter Change', state: 'complete' },
    { label: 'Front M-Brake Caliper Pads', state: 'active' },
    { label: 'Suspension Arm Torquing', state: 'upcoming' },
  ],
} as const

export const serviceBayStaff = {
  technician: 'Alex Mercer',
  role: 'Master Tech · BMW Certified',
  bay: 'Bay 02 (Hydraulic 2-Post)',
  shiftStatus: 'Active on Shift',
  intakeMemo:
    'Customer reported minor vibration around 60 mph on deceleration. Inspecting front rotor runout during pad replacement.',
} as const

export const nextServiceTarget = '25,000 km / Dec 2025'

export const vehicleServiceHistory = [
  {
    date: 'Dec 12, 2024',
    workPerformed: '15,000 km Interim Oil & Filter Service',
    details: 'Castrol Edge 0W-30 LL-04 + OEM Filter',
    odometer: '15,102 km',
    leadTech: 'Alex Mercer',
    invoice: 'INV-4029',
    cost: '$240.00',
  },
  {
    date: 'Aug 05, 2024',
    workPerformed: 'Wheel Alignment & Road Force Balancing',
    details: 'Front camber correction & high speed calibration',
    odometer: '10,840 km',
    leadTech: 'David Kim',
    invoice: 'INV-3211',
    cost: '$115.00',
  },
  {
    date: 'Feb 18, 2024',
    workPerformed: 'Pre-Delivery Multi-Point Inspection',
    details: 'Electronic module scan, firmware update & fluid checks',
    odometer: '25 km',
    leadTech: 'Alex Mercer',
    invoice: 'INV-1890',
    cost: 'Warranty',
  },
] as const

export const vehicleQuickActions = [
  'Create New Job Card',
  'Log Maintenance Reminder',
  'Download Dossier (PDF)',
  'Transfer Vehicle Ownership',
] as const

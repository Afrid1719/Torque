import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined'

export type VehicleFilter = 'all' | 'in-service' | 'ready-for-pickup'
export type VehicleSort = 'make' | 'year' | 'odometer'
export type VehicleView = 'grid' | 'list'

export const vehicleStatuses = [
  {
    label: 'IN SERVICE',
    background: '#e1efff',
    color: '#0058be',
    indicator: '#0058be',
    bay: 'Bay 2',
    bayBackground: '#e1efff',
    jobReference: '#JC-9842',
    jobStatus: 'In Diagnostic',
    jobDescription: 'Electrical Diagnostics & Suspension...',
    ownerTier: 'GOLD',
    ownerName: 'Robert Harrison',
    actionLabel: 'View Job Card',
    actionColor: '#0058be',
  },
  {
    label: 'READY FOR PICKUP',
    background: '#d9f4e7',
    color: '#006947',
    bay: 'Bay 3 Handover',
    bayBackground: '#d9f4e7',
    jobReference: '#JC-9721',
    jobStatus: 'Completed',
    jobDescription: 'Brake Pad Replacement & 30k Service...',
    ownerTier: 'PLATINUM',
    ownerName: 'Marcus Sterling',
    actionLabel: 'Handover / Invoice',
    actionColor: '#006947',
  },
  {
    label: 'REGISTERED',
    background: '#e8ebef',
    color: '#424754',
    bay: 'Fleet Bay A',
    bayBackground: '#e8ebef',
    jobReference: 'Routine Fleet Status',
    jobStatus: 'Scheduled',
    jobDescription: 'Next due in 2,500 km · Last svc Scheduled',
    ownerTier: 'COMMERCIAL',
    ownerName: 'David Miller',
    actionLabel: 'Create Job Card',
    actionColor: '#0058be',
  },
  {
    label: 'CRITICAL ALERT',
    background: '#fce4e4',
    color: '#ba1a1a',
    bay: 'Diag Bay 1',
    bayBackground: '#fce4e4',
    jobReference: 'DTC: P0300',
    jobStatus: 'Urgent',
    jobDescription: 'Random Misfire Detected (Bank 1 & ...)',
    ownerTier: 'PREMIER VIP',
    ownerName: 'Elena Vance',
    actionLabel: 'View Job Card',
    actionColor: '#0058be',
  },
] as const

export const fuelTypeLabels: Record<string, string> = {
  cng: 'CNG',
  diesel: 'Diesel',
  ev: 'Electric',
  hybrid: 'Hybrid',
  petrol: 'Petrol',
}

export const vehicleDashboardStats = [
  {
    label: 'TOTAL FLEET',
    value: '128',
    badge: '+12 this mo',
    detail: 'Active customer & fleet units',
    color: '#191c1e',
    badgeColor: '#006947',
    badgeBg: '#d9f4e7',
    iconColor: '#0058be',
    icon: DirectionsCarOutlinedIcon,
  },
  {
    label: 'IN SERVICE / BAYS',
    value: '18',
    badge: '85% Bay Cap',
    detail: 'Active job cards undergoing work',
    color: '#0058be',
    badgeColor: '#0058be',
    badgeBg: '#e1ecff',
    iconColor: '#0058be',
    icon: BuildOutlinedIcon,
  },
  {
    label: 'AWAITING INSPECTION',
    value: '7',
    badge: 'Action Req',
    detail: 'Checked-in & pending triage',
    color: '#a14f00',
    badgeColor: '#8a4300',
    badgeBg: '#fff0d6',
    iconColor: '#a14f00',
    icon: ContentPasteSearchOutlinedIcon,
  },
  {
    label: 'READY FOR PICKUP',
    value: '9',
    badge: 'QC Passed',
    detail: 'Pending customer handover',
    color: '#006947',
    badgeColor: '#006947',
    badgeBg: '#d9f4e7',
    iconColor: '#00855b',
    icon: CheckCircleOutlineOutlinedIcon,
  },
] as const

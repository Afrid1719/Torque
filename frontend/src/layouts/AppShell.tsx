import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlineOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState, type MouseEvent } from 'react'
import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router'

import { useAuth } from '@app/hooks/useAuth'

const drawerWidth = 260
const headerHeight = 64

const navigation = [
  { label: 'Dashboard', path: '/', icon: DashboardOutlinedIcon },
  { label: 'Customers', path: '/customers', icon: PeopleOutlineIcon },
  { label: 'Vehicles', path: '/vehicles', icon: DirectionsCarOutlinedIcon },
  { label: 'Job Cards', path: '/job-cards', icon: AssignmentOutlinedIcon },
  { label: 'Inventory', path: '/inventory', icon: Inventory2OutlinedIcon },
  { label: 'Billing', path: '/billing', icon: ReceiptLongOutlinedIcon },
  { label: 'Reports', path: '/reports', icon: BarChartOutlinedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsOutlinedIcon },
] as const

function displayUsername(username: string): string {
  return username
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

type SidebarContentProps = {
  onNavigate: () => void
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    onNavigate()
    navigate('/login', { replace: true })
  }

  const preventSupportNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
  }

  return (
    <Box
      sx={{
        bgcolor: '#334155',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowX: 'hidden',
        py: 3,
        width: drawerWidth,
      }}
    >
      <Box sx={{ mb: 3.5, px: 3 }}>
        <Typography
          component="div"
          sx={{ fontSize: 32, fontWeight: 700, lineHeight: '40px' }}
        >
          TORQUE
        </Typography>
        <Typography
          sx={{
            color: '#b9c7e0',
            fontSize: 12,
            fontWeight: 600,
            lineHeight: '16px',
            opacity: 0.8,
            textTransform: 'uppercase',
          }}
        >
          Service Management
        </Typography>
      </Box>

      <List component="nav" disablePadding sx={{ flex: 1 }}>
        {navigation.map(({ icon: Icon, label, path }) => (
          <ListItemButton
            component={RouterLink}
            key={path}
            onClick={onNavigate}
            selected={
              location.pathname === path ||
              (path !== '/' && location.pathname.startsWith(`${path}/`))
            }
            sx={{
              borderLeft: '4px solid transparent',
              color: '#e0e3e5',
              minHeight: 40,
              px: 2.5,
              py: 1,
              '&:hover': {
                bgcolor: '#d5e3fd',
                color: '#424754',
              },
              '&.Mui-selected': {
                bgcolor: '#2170e4',
                borderLeftColor: '#0058be',
                color: '#ffffff',
              },
              '&.Mui-selected:hover': {
                bgcolor: '#2170e4',
              },
            }}
            to={path}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={label}
              slotProps={{
                primary: {
                  sx: { fontSize: 12, fontWeight: 600, lineHeight: '16px' },
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', px: 3 }}>
        <Button
          component={RouterLink}
          fullWidth
          onClick={onNavigate}
          startIcon={<AddCircleOutlineIcon />}
          to="/job-cards"
          variant="contained"
        >
          New Job Card
        </Button>

        <Divider sx={{ borderColor: '#475569', mb: 1, mt: 3 }} />

        <List disablePadding>
          <ListItemButton
            component="a"
            href="#"
            onClick={preventSupportNavigation}
            sx={{ color: '#e0e3e5', minHeight: 36, px: 0, py: 0.5 }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <HelpOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Support"
              slotProps={{
                primary: {
                  sx: { fontSize: 12, fontWeight: 600, lineHeight: '16px' },
                },
              }}
            />
          </ListItemButton>
          <ListItemButton
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            sx={{
              color: '#e0e3e5',
              minHeight: 36,
              px: 0,
              py: 0.5,
              '&:hover': { color: '#ffb4ab' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={isLoggingOut ? 'Signing out' : 'Logout'}
              slotProps={{
                primary: {
                  sx: { fontSize: 12, fontWeight: 600, lineHeight: '16px' },
                },
              }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  )
}

type AppHeaderProps = {
  onOpenNavigation: () => void
}

function AppHeader({ onOpenNavigation }: AppHeaderProps) {
  const { user } = useAuth()
  const username = user ? displayUsername(user.username) : ''
  const initial = username.charAt(0) || 'T'

  return (
    <AppBar
      color="inherit"
      elevation={0}
      position="fixed"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        height: headerHeight,
        ml: { md: `${drawerWidth}px` },
        width: { md: `calc(100% - ${drawerWidth}px)` },
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 1, sm: 2 },
          minHeight: `${headerHeight}px !important`,
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Tooltip title="Open navigation">
          <IconButton
            aria-label="Open navigation"
            onClick={onOpenNavigation}
            sx={{ display: { md: 'none' } }}
          >
            <MenuOutlinedIcon />
          </IconButton>
        </Tooltip>

        <TextField
          aria-label="Search"
          placeholder="Search registration, VIN, or customer name..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            display: { xs: 'none', sm: 'block' },
            flexShrink: 0,
            maxWidth: 448,
            width: { sm: 320, lg: 448 },
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f2f4f6',
              borderRadius: 1,
              width: '100%',
            },
          }}
        />

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Notifications">
          <IconButton aria-label="Notifications">
            <Badge color="error" variant="dot">
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Button
          component={RouterLink}
          sx={{
            display: { xs: 'none', lg: 'inline-flex' },
            whiteSpace: 'nowrap',
          }}
          to="/vehicles"
          variant="contained"
        >
          Check In Vehicle
        </Button>

        <Divider flexItem orientation="vertical" sx={{ my: 1.5 }} />

        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <Box
            sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'right' }}
          >
            <Typography
              sx={{ fontSize: 12, fontWeight: 600, lineHeight: '16px' }}
            >
              {username}
            </Typography>
            <Typography
              color="text.secondary"
              component="p"
              variant="subtitle1"
            >
              {user?.role.display_name}
            </Typography>
          </Box>
          <Avatar
            aria-label={username ? `${username} profile` : 'User profile'}
            sx={{
              bgcolor: 'primary.dark',
              border: '1px solid',
              borderColor: 'divider',
              height: 40,
              width: 40,
            }}
          >
            {initial}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export function AppShell() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <AppHeader onOpenNavigation={() => setMobileNavigationOpen(true)} />

      <Box
        component="aside"
        sx={{ flexShrink: { md: 0 }, width: { md: drawerWidth } }}
      >
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={() => setMobileNavigationOpen(false)}
          open={mobileNavigationOpen}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { border: 0, width: drawerWidth },
          }}
          variant="temporary"
        >
          <SidebarContent onNavigate={() => setMobileNavigationOpen(false)} />
        </Drawer>
        <Drawer
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { border: 0, width: drawerWidth },
          }}
          variant="permanent"
        >
          <SidebarContent onNavigate={() => undefined} />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          minWidth: 0,
          pt: `${headerHeight}px`,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'

export function CustomerActivity({ notes }: { notes: string }) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
      }}
    >
      <Stack spacing={3}>
        <Card variant="outlined">
          <CardHeader
            action={
              <Button size="small" startIcon={<AddCircleOutlineIcon />}>
                Add New
              </Button>
            }
            slotProps={{ title: { variant: 'overline' } }}
            title="Registered Vehicles"
          />
          <Divider />
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <DirectionsCarOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
            <Typography sx={{ mt: 1 }} variant="h6">
              No vehicles registered
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
              Add the customer’s first vehicle to begin creating job cards.
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader
            avatar={<NotesOutlinedIcon color="primary" />}
            action={
              <IconButton aria-label="Edit workshop notes" size="small">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            }
            slotProps={{ title: { variant: 'overline' } }}
            title="Workshop Notes"
          />
          <Divider />
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              {notes || 'No internal notes have been added.'}
            </Typography>
          </CardContent>
        </Card>
      </Stack>
      <Card variant="outlined">
        <CardHeader
          action={<Button variant="contained">New Job Card</Button>}
          slotProps={{ title: { variant: 'overline' } }}
          title="Service History"
        />
        <Divider />
        <CardContent
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 310,
            textAlign: 'center',
          }}
        >
          <EventRepeatOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
          <Typography sx={{ mt: 1 }} variant="h6">
            No service history yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Completed and active job cards will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

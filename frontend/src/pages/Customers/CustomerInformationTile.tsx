import { Box, Card, CardContent, Typography } from '@mui/material'
import type { SvgIconComponent } from '@mui/icons-material'

type CustomerInformationTileProps = {
  backgroundColor: string
  description: string
  icon: SvgIconComponent
  iconColor: string
  title: string
}

export function CustomerInformationTile({
  backgroundColor,
  description,
  icon: Icon,
  iconColor,
  title,
}: CustomerInformationTileProps) {
  return (
    <Card variant="outlined" sx={{ boxShadow: 'none', height: '100%' }}>
      <CardContent sx={{ display: 'flex', gap: 2, p: 3 }}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: backgroundColor,
            borderRadius: 1,
            color: iconColor,
            display: 'flex',
            flexShrink: 0,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
            variant="subtitle1"
          >
            {description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

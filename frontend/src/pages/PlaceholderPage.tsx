import { Box, Typography } from '@mui/material'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography component="h1" variant="h5">
        {title}
      </Typography>
    </Box>
  )
}

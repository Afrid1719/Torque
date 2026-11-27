import { LinearProgress } from '@mui/material'
import { useIsFetching } from '@tanstack/react-query'

export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching()

  if (!isFetching) return null

  return (
    <LinearProgress
      aria-label="Loading data"
      sx={{
        height: 3,
        left: 0,
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: (theme) => theme.zIndex.tooltip,
      }}
    />
  )
}

import type { ReactNode } from 'react'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { Link as RouterLink, type To } from 'react-router'

export type AppBreadcrumbItem =
  { label: ReactNode; to: To } | { label: ReactNode; to?: never }

type AppBreadcrumbsProps = {
  ariaLabel?: string
  items: readonly AppBreadcrumbItem[]
  separator?: ReactNode
  sx?: SxProps<Theme>
}

export function AppBreadcrumbs({
  ariaLabel = 'Breadcrumb',
  items,
  separator = '›',
  sx,
}: AppBreadcrumbsProps) {
  return (
    <Breadcrumbs aria-label={ariaLabel} separator={separator} sx={sx}>
      {items.map(({ label, to }, index) =>
        to ? (
          <Link
            component={RouterLink}
            key={index}
            to={to}
            underline="hover"
            variant="caption"
          >
            {label}
          </Link>
        ) : (
          <Typography
            aria-current={index === items.length - 1 ? 'page' : undefined}
            color="primary"
            key={index}
            sx={{ fontWeight: 700 }}
            variant="caption"
          >
            {label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  )
}

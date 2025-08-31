import { cn } from '../../lib/utils'

interface ResponsiveGridProps {
  columns?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: string
  children: React.ReactNode
}

export function ResponsiveGrid({
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = '1rem',
  children
}: ResponsiveGridProps) {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(gridClasses)}>
      {children}
    </div>
  )
}

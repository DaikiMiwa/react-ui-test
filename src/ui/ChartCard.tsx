import type { CSSProperties, ReactNode } from 'react'
import { CardHeader } from './CardHeader'
import { SurfaceCard } from './SurfaceCard'

type ChartCardProps = {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  footer?: ReactNode
  style?: CSSProperties
}

export function ChartCard({ title, action, children, footer, style }: ChartCardProps) {
  return (
    <SurfaceCard style={{ ...styles.card, ...style }}>
      <CardHeader action={action}>{title}</CardHeader>
      <div style={styles.chart}>{children}</div>
      {footer ? <div style={styles.footer}>{footer}</div> : null}
    </SurfaceCard>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    overflow: 'hidden',
  },
  chart: {
    minWidth: 0,
  },
  footer: {
    marginTop: 10,
  },
}

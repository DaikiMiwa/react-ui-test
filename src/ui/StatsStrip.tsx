import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type StatsStripItem = {
  label: ReactNode
  value: ReactNode
  unit?: ReactNode
  sub?: ReactNode
  color?: string
}

type StatsStripProps = {
  items: StatsStripItem[]
  columns?: number
  style?: CSSProperties
}

export function StatsStrip({ items, columns, style }: StatsStripProps) {
  return (
    <div style={{ ...styles.strip, gridTemplateColumns: `repeat(${columns ?? items.length}, minmax(0, 1fr))`, ...style }}>
      {items.map((item, index) => (
        <div key={index} style={{ ...styles.item, ...(index === items.length - 1 ? styles.lastItem : undefined) }}>
          <div style={styles.label}>{item.label}</div>
          <div style={{ ...styles.value, ...(item.color ? { color: item.color } : undefined) }}>
            {item.value}
            {item.unit ? <span style={styles.unit}>{item.unit}</span> : null}
          </div>
          {item.sub ? <div style={{ ...styles.sub, ...(item.color ? { color: item.color } : undefined) }}>{item.sub}</div> : null}
        </div>
      ))}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  strip: {
    display: 'grid',
    background: COLORS.surfaceRaised,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
  },
  item: {
    padding: '14px 10px',
    borderRight: `1px solid ${COLORS.borderStrong}`,
    textAlign: 'center',
    minWidth: 0,
  },
  lastItem: {
    borderRight: 0,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 850,
    letterSpacing: 0,
  },
  unit: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 650,
    marginLeft: 2,
  },
  sub: {
    marginTop: 5,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
  },
}

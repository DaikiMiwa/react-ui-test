import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type MetricValueProps = {
  value: ReactNode
  unit?: ReactNode
  target?: ReactNode
  label?: ReactNode
  color?: string
  size?: 'md' | 'lg' | 'xl'
  style?: CSSProperties
}

export function MetricValue({ value, unit, target, label, color, size = 'lg', style }: MetricValueProps) {
  return (
    <div style={{ ...styles.wrap, ...style }}>
      {label ? <div style={styles.label}>{label}</div> : null}
      <div style={styles.row}>
        <span style={{ ...styles.value, ...styles[size], ...(color ? { color } : undefined) }}>{value}</span>
        {target ? (
          <>
            <span style={styles.divider}>/</span>
            <span style={styles.target}>{target}</span>
          </>
        ) : null}
        {unit ? <span style={styles.unit}>{unit}</span> : null}
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrap: {
    minWidth: 0,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.4,
  },
  row: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 5,
    flexWrap: 'wrap',
  },
  value: {
    color: COLORS.textPrimary,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,
  },
  md: {
    fontSize: 24,
  },
  lg: {
    fontSize: 34,
  },
  xl: {
    fontSize: 42,
  },
  divider: {
    color: COLORS.textMuted,
    fontSize: 25,
    fontWeight: 850,
  },
  target: {
    color: COLORS.textSecondary,
    fontSize: 25,
    lineHeight: 1,
    fontWeight: 850,
    letterSpacing: 0,
  },
  unit: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: 800,
  },
}

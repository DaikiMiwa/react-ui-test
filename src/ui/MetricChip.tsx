import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type MetricChipProps = {
  label: ReactNode
  value: ReactNode
  delta?: ReactNode
  color?: string
  style?: CSSProperties
}

export function MetricChip({ label, value, delta, color, style }: MetricChipProps) {
  return (
    <div style={{ ...styles.chip, ...style }}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.value, ...(color ? { color } : undefined) }}>{value}</div>
      {delta ? <div style={styles.delta}>{delta}</div> : null}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  chip: {
    minHeight: 78,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.surfaceRaised,
    padding: 12,
    boxSizing: 'border-box',
    display: 'grid',
    gap: 6,
    alignContent: 'center',
    textAlign: 'left',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,
  },
  delta: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 700,
  },
}

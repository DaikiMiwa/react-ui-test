import type { CSSProperties } from 'react'
import { COLORS } from './tokens'

type ProgressBarProps = {
  value: number
  accent?: string
  style?: CSSProperties
}

export function ProgressBar({ value, accent = COLORS.primary, style }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div style={{ ...styles.track, ...style }}>
      <span style={{ ...styles.fill, width: `${clampedValue}%`, background: accent }} />
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  track: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    display: 'block',
    height: '100%',
    borderRadius: 999,
  },
}

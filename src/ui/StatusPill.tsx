import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type StatusPillProps = {
  children: ReactNode
  tone?: 'default' | 'primary' | 'success' | 'muted'
  style?: CSSProperties
}

export function StatusPill({ children, tone = 'default', style }: StatusPillProps) {
  const toneStyle = tone === 'primary' ? styles.primary : tone === 'success' ? styles.success : tone === 'muted' ? styles.muted : undefined

  return <span style={{ ...styles.pill, ...toneStyle, ...style }}>{children}</span>
}

const styles: { [key: string]: CSSProperties } = {
  pill: {
    minHeight: 30,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  primary: {
    color: COLORS.primary,
    borderColor: `${COLORS.primary}66`,
  },
  success: {
    color: COLORS.success,
    borderColor: `${COLORS.success}55`,
  },
  muted: {
    color: COLORS.textMuted,
  },
}

import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type SelectableCardProps = {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
  style?: CSSProperties
}

export function SelectableCard({ children, selected = false, onClick, style }: SelectableCardProps) {
  return (
    <button type="button" onClick={onClick} style={{ ...styles.card, ...style, ...(selected ? styles.selected : undefined) }}>
      {children}
    </button>
  )
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    borderRadius: 18,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    padding: 13,
    display: 'grid',
    justifyItems: 'start',
    gap: 6,
    textAlign: 'left',
    fontFamily: 'inherit',
    boxShadow: '0 16px 34px rgba(0,0,0,0.22)',
    boxSizing: 'border-box',
  },
  selected: {
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}88`,
    boxShadow: '0 0 0 1px rgba(255,107,44,0.18), 0 18px 38px rgba(0,0,0,0.28)',
  },
}

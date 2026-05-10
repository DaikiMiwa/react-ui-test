import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type SurfaceCardProps = {
  children: ReactNode
  variant?: 'surface' | 'raised' | 'muted'
  style?: CSSProperties
}

export function SurfaceCard({ children, variant = 'surface', style }: SurfaceCardProps) {
  const background = variant === 'raised' ? COLORS.surfaceRaised : variant === 'muted' ? COLORS.surfaceMuted : COLORS.surface

  return <section style={{ ...styles.card, background, ...style }}>{children}</section>
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 24,
    padding: 18,
    boxShadow: '0 14px 34px rgba(0,0,0,0.32)',
    boxSizing: 'border-box',
  },
}

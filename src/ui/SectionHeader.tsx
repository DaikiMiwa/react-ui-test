import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type SectionHeaderProps = {
  title: ReactNode
  action?: ReactNode
  style?: CSSProperties
}

export function SectionHeader({ title, action, style }: SectionHeaderProps) {
  return (
    <div style={{ ...styles.wrap, ...style }}>
      <h2 style={styles.title}>{title}</h2>
      {action}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    color: COLORS.textPrimary,
    fontSize: 21,
    lineHeight: 1.1,
    letterSpacing: 0,
  },
}

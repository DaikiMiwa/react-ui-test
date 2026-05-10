import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type CardHeaderProps = {
  children: ReactNode
  action?: ReactNode
  style?: CSSProperties
}

export function CardHeader({ children, action, style }: CardHeaderProps) {
  return (
    <div style={{ ...styles.header, ...style }}>
      <span>{children}</span>
      {action}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  header: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 900,
    letterSpacing: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
    textAlign: 'left',
  },
}

import type { CSSProperties, ReactNode } from 'react'
import { COLORS, PHONE_FRAME } from './tokens'

type AppHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  left?: ReactNode
  right?: ReactNode
}

export function AppHeader({ title, subtitle, left, right }: AppHeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.side}>{left}</div>
      <div style={styles.center}>
        <div style={styles.title}>{title}</div>
        {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
      </div>
      <div style={styles.side}>{right}</div>
    </header>
  )
}

export function MoreDots() {
  return <span style={styles.moreDots}>•••</span>
}

const styles: { [key: string]: CSSProperties } = {
  header: {
    height: PHONE_FRAME.headerHeight,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '24px 18px 0',
    boxSizing: 'border-box',
  },
  side: {
    width: 50,
    height: 50,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: '1 1 auto',
    minWidth: 0,
    textAlign: 'center',
  },
  title: {
    margin: 0,
    color: COLORS.textPrimary,
    fontSize: 21,
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  moreDots: {
    display: 'block',
    fontSize: 18,
    letterSpacing: 2,
    transform: 'translateX(1px) translateY(-1px)',
  },
}

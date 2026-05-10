import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type EmptyStateProps = {
  title: ReactNode
  children?: ReactNode
  action?: ReactNode
  style?: CSSProperties
}

export function EmptyState({ title, children, action, style }: EmptyStateProps) {
  return (
    <section style={{ ...styles.wrap, ...style }}>
      <div style={styles.mark}>+</div>
      <h2 style={styles.title}>{title}</h2>
      {children ? <div style={styles.body}>{children}</div> : null}
      {action ? <div style={styles.action}>{action}</div> : null}
    </section>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrap: {
    padding: 18,
    borderRadius: 24,
    border: `1px dashed ${COLORS.borderStrong}`,
    background: COLORS.surface,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 999,
    margin: '0 auto 10px',
    display: 'grid',
    placeItems: 'center',
    background: COLORS.surfaceRaised,
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 900,
  },
  title: {
    margin: 0,
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 900,
    letterSpacing: 0,
  },
  body: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 1.45,
  },
  action: {
    marginTop: 14,
  },
}

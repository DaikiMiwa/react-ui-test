import type { CSSProperties, ReactNode } from 'react'
import { ActionButton } from './ActionButton'
import { COLORS } from './tokens'

type DialogAction = {
  label: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

type ConfirmDialogProps = {
  eyebrow?: ReactNode
  title: ReactNode
  children?: ReactNode
  actions: DialogAction[]
  labelledBy?: string
}

export function ConfirmDialog({ eyebrow, title, children, actions, labelledBy = 'confirm-dialog-title' }: ConfirmDialogProps) {
  return (
    <div style={styles.overlay}>
      <section style={styles.card} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {eyebrow ? <div style={styles.eyebrow}>{eyebrow}</div> : null}
        <h2 id={labelledBy} style={styles.title}>{title}</h2>
        {children ? <div style={styles.body}>{children}</div> : null}
        <div style={styles.actions}>
          {actions.map((action, index) => (
            <ActionButton key={index} variant={action.variant ?? 'secondary'} onClick={action.onClick} style={styles.button}>
              {action.label}
            </ActionButton>
          ))}
        </div>
      </section>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    background: 'rgba(0,0,0,0.64)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    boxSizing: 'border-box',
    backdropFilter: 'blur(8px)',
  },
  card: {
    width: '100%',
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 24,
    padding: 18,
    boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
    boxSizing: 'border-box',
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.8,
  },
  title: {
    margin: '8px 0 0',
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: 0,
  },
  body: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 1.45,
  },
  actions: {
    marginTop: 16,
    display: 'grid',
    gap: 10,
  },
  button: {
    width: '100%',
  },
}

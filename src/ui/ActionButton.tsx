import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { COLORS } from './tokens'

type ActionButtonProps = {
  children: ReactNode
  onClick?: () => void
  to?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
  style?: CSSProperties
}

export function ActionButton({
  children,
  onClick,
  to,
  type = 'button',
  variant = 'secondary',
  size = 'md',
  disabled = false,
  style,
}: ActionButtonProps) {
  const buttonStyle = {
    ...styles.base,
    ...(size === 'sm' ? styles.sm : styles.md),
    ...styles[variant],
    ...(disabled ? styles.disabled : undefined),
    ...style,
  }

  if (to) {
    return (
      <Link to={to} style={buttonStyle}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={buttonStyle}>
      {children}
    </button>
  )
}

const styles: { [key: string]: CSSProperties } = {
  base: {
    borderRadius: 999,
    display: 'inline-grid',
    placeItems: 'center',
    border: `1px solid ${COLORS.borderStrong}`,
    fontFamily: 'inherit',
    fontWeight: 900,
    textDecoration: 'none',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
  },
  sm: {
    minHeight: 38,
    padding: '0 14px',
    fontSize: 13,
  },
  md: {
    minHeight: 48,
    padding: '0 18px',
    fontSize: 15,
  },
  primary: {
    border: '1px solid transparent',
    background: COLORS.primary,
    color: COLORS.onPrimary,
    boxShadow: '0 12px 28px rgba(255,107,44,0.24)',
  },
  secondary: {
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
  },
  ghost: {
    background: COLORS.surface,
    color: COLORS.primary,
  },
  danger: {
    border: '1px solid transparent',
    background: COLORS.danger,
    color: COLORS.onPrimary,
  },
  disabled: {
    background: COLORS.surfaceMuted,
    color: COLORS.inactive,
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}

import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { COLORS } from './tokens'

type IconButtonProps = {
  children: ReactNode
  ariaLabel: string
  onClick?: () => void
  to?: string
  type?: 'button' | 'submit' | 'reset'
  style?: CSSProperties
}

export function IconButton({ children, ariaLabel, onClick, to, type = 'button', style }: IconButtonProps) {
  const buttonStyle = { ...styles.button, ...style }

  if (to) {
    return (
      <Link to={to} aria-label={ariaLabel} style={buttonStyle}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} aria-label={ariaLabel} onClick={onClick} style={buttonStyle}>
      {children}
    </button>
  )
}

const styles: { [key: string]: CSSProperties } = {
  button: {
    width: 50,
    height: 50,
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
    textDecoration: 'none',
    fontFamily: 'inherit',
    flexShrink: 0,
    padding: 0,
  },
}

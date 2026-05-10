import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { COLORS } from './tokens'

type FixedInputBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
  disabled?: boolean
  leftAction?: ReactNode
  submitLabel?: ReactNode
  style?: CSSProperties
}

export function FixedInputBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  leftAction,
  submitLabel = '↑',
  style,
}: FixedInputBarProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!value.trim() || disabled) return
    onSubmit()
  }

  const canSubmit = value.trim().length > 0 && !disabled

  return (
    <form style={{ ...styles.wrap, ...style }} onSubmit={submit}>
      <div style={styles.bar}>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          style={styles.input}
        />
        {leftAction}
        <button type="submit" disabled={!canSubmit} style={canSubmit ? styles.send : styles.sendDisabled}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 92,
    zIndex: 4,
    display: 'grid',
    gridTemplateColumns: '1fr',
    alignItems: 'center',
  },
  bar: {
    height: 48,
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    backdropFilter: 'blur(24px)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px 0 18px',
    boxSizing: 'border-box',
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: 0,
    outline: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'inherit',
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: 0,
    background: COLORS.surfaceMuted,
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 1,
    display: 'grid',
    placeItems: 'center',
  },
  sendDisabled: {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: 0,
    background: COLORS.surfaceMuted,
    color: COLORS.inactive,
    fontSize: 24,
    lineHeight: 1,
    display: 'grid',
    placeItems: 'center',
  },
}

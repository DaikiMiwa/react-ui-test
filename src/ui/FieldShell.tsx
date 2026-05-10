import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type FieldShellProps = {
  label: ReactNode
  children: ReactNode
  railColor?: string
  compact?: boolean
  style?: CSSProperties
}

export function FieldShell({ label, children, railColor, compact = false, style }: FieldShellProps) {
  return (
    <label style={{ ...styles.shell, ...(compact ? styles.compact : undefined), ...style }}>
      {railColor ? <span style={{ ...styles.rail, background: railColor }} /> : null}
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  )
}

type NumberFieldProps = {
  label: ReactNode
  value: number | string
  onChange: (value: number) => void
  unit?: ReactNode
  railColor?: string
  inputMode?: 'decimal' | 'numeric'
  ariaLabel?: string
  compact?: boolean
  style?: CSSProperties
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  railColor,
  inputMode = 'decimal',
  ariaLabel,
  compact,
  style,
}: NumberFieldProps) {
  return (
    <FieldShell label={label} railColor={railColor} compact={compact} style={style}>
      <span style={styles.inputRow}>
        <input
          value={value}
          onChange={(event) => onChange(readNumericInput(event.target.value))}
          inputMode={inputMode}
          aria-label={ariaLabel}
          style={styles.input}
        />
        {unit ? <span style={styles.unit}>{unit}</span> : null}
      </span>
    </FieldShell>
  )
}

type TextAreaFieldProps = {
  label: ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  style?: CSSProperties
}

export function TextAreaField({ label, value, onChange, placeholder, minHeight = 88, style }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} style={style}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{ ...styles.textarea, minHeight }}
      />
    </FieldShell>
  )
}

function readNumericInput(value: string) {
  if (value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

const styles: { [key: string]: CSSProperties } = {
  shell: {
    display: 'grid',
    gridTemplateColumns: '8px 1fr',
    gap: '7px 9px',
    padding: 12,
    borderRadius: 16,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
    boxSizing: 'border-box',
  },
  compact: {
    padding: 10,
    borderRadius: 14,
  },
  rail: {
    width: 7,
    borderRadius: 999,
    gridRow: '1 / span 2',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.6,
    textAlign: 'left',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 5,
    minWidth: 0,
  },
  input: {
    width: '100%',
    minWidth: 0,
    border: 0,
    outline: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 850,
    fontFamily: 'inherit',
    letterSpacing: 0,
  },
  unit: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 800,
  },
  textarea: {
    gridColumn: '1 / -1',
    width: '100%',
    resize: 'vertical',
    border: 0,
    outline: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 1.45,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
}

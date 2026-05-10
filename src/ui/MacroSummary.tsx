import type { CSSProperties } from 'react'
import { COLORS } from './tokens'
import { NumberField } from './FieldShell'

export type MacroKey = 'protein' | 'fat' | 'carbs'

export const MACRO_FIELDS: Array<{ key: MacroKey; label: string; shortLabel: string; color: string }> = [
  { key: 'protein', label: 'Protein', shortLabel: 'P', color: COLORS.protein },
  { key: 'fat', label: 'Fat', shortLabel: 'F', color: COLORS.fat },
  { key: 'carbs', label: 'Carbs', shortLabel: 'C', color: COLORS.carbs },
]

type MacroValues = Record<MacroKey, number>

type MacroBarProps = {
  values: MacroValues
  style?: CSSProperties
}

export function MacroBar({ values, style }: MacroBarProps) {
  const macroTotal = values.protein + values.fat + values.carbs

  return (
    <div style={{ ...styles.bar, ...style }} aria-hidden="true">
      {MACRO_FIELDS.map((field) => {
        const width = macroTotal > 0 ? (values[field.key] / macroTotal) * 100 : 0
        return <span key={field.key} style={{ ...styles.barSegment, width: `${width}%`, background: field.color }} />
      })}
    </div>
  )
}

type MacroSummaryGridProps = {
  values: MacroValues
  formatValue?: (value: number, key: MacroKey) => string
  style?: CSSProperties
}

export function MacroSummaryGrid({ values, formatValue = (value) => `${Math.round(value)}g`, style }: MacroSummaryGridProps) {
  return (
    <div style={{ ...styles.grid, ...style }}>
      {MACRO_FIELDS.map((field) => (
        <div key={field.key} style={styles.cell}>
          <span style={{ ...styles.dot, background: field.color }} />
          <span style={styles.label}>{field.shortLabel}</span>
          <strong style={styles.value}>{formatValue(values[field.key], field.key)}</strong>
        </div>
      ))}
    </div>
  )
}

type MacroInputGridProps = {
  values: MacroValues
  onChange: (key: MacroKey, value: number) => void
  style?: CSSProperties
}

export function MacroInputGrid({ values, onChange, style }: MacroInputGridProps) {
  return (
    <div style={{ ...styles.inputGrid, ...style }}>
      {MACRO_FIELDS.map((field) => (
        <NumberField
          key={field.key}
          label={field.label}
          value={values[field.key] || ''}
          onChange={(value) => onChange(field.key, value)}
          unit="g"
          railColor={field.color}
          ariaLabel={`${field.label} grams`}
        />
      ))}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  bar: {
    height: 10,
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    overflow: 'hidden',
    display: 'flex',
  },
  barSegment: {
    height: '100%',
    display: 'block',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 9,
  },
  cell: {
    minHeight: 62,
    padding: '10px 9px',
    borderRadius: 16,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
    display: 'grid',
    gridTemplateColumns: '8px auto',
    alignContent: 'center',
    gap: '4px 7px',
    boxSizing: 'border-box',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginTop: 5,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
  },
  value: {
    gridColumn: '2',
    fontSize: 19,
    lineHeight: 1,
    fontWeight: 900,
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 9,
  },
}

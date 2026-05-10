import type { CSSProperties } from 'react'
import { COLORS } from './tokens'

type SegmentedControlProps<T extends string> = {
  items: readonly T[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  getLabel?: (value: T) => string
  style?: CSSProperties
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  getLabel,
  style,
}: SegmentedControlProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} style={{ ...styles.wrap, gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, ...style }}>
      {items.map((item) => {
        const isActive = item === value

        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item)}
            style={{ ...styles.tab, ...(isActive ? styles.active : styles.inactive) }}
          >
            {getLabel ? getLabel(item) : item}
          </button>
        )
      })}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrap: {
    height: 36,
    display: 'grid',
    gap: 2,
    padding: 2,
    borderRadius: 999,
    background: COLORS.borderStrong,
    boxSizing: 'border-box',
  },
  tab: {
    border: 0,
    borderRadius: 999,
    padding: '0 12px',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0,
    fontFamily: 'inherit',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  active: {
    background: COLORS.surfaceMuted,
    color: COLORS.textPrimary,
    fontWeight: 800,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
  },
  inactive: {
    background: 'transparent',
    color: COLORS.textSecondary,
  },
}

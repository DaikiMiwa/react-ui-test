import type { CSSProperties, ReactNode } from 'react'
import { COLORS } from './tokens'

type OverflowMenuItem = {
  label: ReactNode
  onClick: () => void
  tone?: 'default' | 'danger'
}

type OverflowMenuProps = {
  items: OverflowMenuItem[]
  align?: 'left' | 'right'
  style?: CSSProperties
}

export function OverflowMenu({ items, align = 'right', style }: OverflowMenuProps) {
  return (
    <div style={{ ...styles.menu, ...(align === 'left' ? styles.left : styles.right), ...style }}>
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={item.onClick}
          style={{ ...styles.item, ...(item.tone === 'danger' ? styles.danger : undefined) }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  menu: {
    position: 'absolute',
    top: 72,
    zIndex: 12,
    minWidth: 188,
    padding: 6,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 18px 48px rgba(0,0,0,0.45)',
    boxSizing: 'border-box',
  },
  left: {
    left: 18,
  },
  right: {
    right: 18,
  },
  item: {
    width: '100%',
    minHeight: 40,
    border: 0,
    borderRadius: 12,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 850,
    textAlign: 'left',
    padding: '0 10px',
  },
  danger: {
    color: COLORS.danger,
  },
}

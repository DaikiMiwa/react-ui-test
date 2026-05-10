import type { CSSProperties, ReactNode } from 'react'

type BottomActionBarProps = {
  children: ReactNode
  columns?: number
  style?: CSSProperties
}

export function BottomActionBar({ children, columns, style }: BottomActionBarProps) {
  return (
    <div
      style={{
        ...styles.bar,
        ...(columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  bar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginTop: 18,
  },
}

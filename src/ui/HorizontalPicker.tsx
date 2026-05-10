import type { CSSProperties, ReactNode } from 'react'

type HorizontalPickerProps = {
  children: ReactNode
  minColumnWidth?: number
  maxColumnWidth?: number
  style?: CSSProperties
}

export function HorizontalPicker({ children, minColumnWidth = 126, maxColumnWidth = 142, style }: HorizontalPickerProps) {
  return (
    <div
      style={{
        ...styles.picker,
        gridAutoColumns: `minmax(${minColumnWidth}px, ${maxColumnWidth}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  picker: {
    display: 'grid',
    gridAutoFlow: 'column',
    gap: 10,
    overflowX: 'auto',
    paddingBottom: 2,
    scrollbarWidth: 'none',
  },
}

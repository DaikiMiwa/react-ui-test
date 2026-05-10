import type { CSSProperties, ReactNode } from 'react'

type AppMainProps = {
  children: ReactNode
  withBottomNav?: boolean
  style?: CSSProperties
}

export function AppMain({ children, withBottomNav = false, style }: AppMainProps) {
  return <main style={{ ...styles.main, ...style, paddingBottom: withBottomNav ? 118 : 28 }}>{children}</main>
}

const styles: { [key: string]: CSSProperties } = {
  main: {
    height: 708,
    overflowY: 'auto',
    padding: '8px 18px 28px',
    boxSizing: 'border-box',
    scrollbarWidth: 'none',
  },
}

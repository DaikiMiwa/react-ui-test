import type { CSSProperties, ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { COLORS, FONT_FAMILY, PHONE_FRAME } from './tokens'

type AppShellProps = {
  children: ReactNode
  phoneStyle?: CSSProperties
  showBottomTabBar?: boolean
}

export function AppShell({ children, phoneStyle, showBottomTabBar = true }: AppShellProps) {
  return (
    <div style={styles.page}>
      <div style={{ ...styles.phone, ...phoneStyle }}>
        {children}
        {showBottomTabBar ? <BottomTabBar /> : null}
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: COLORS.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: PHONE_FRAME.padding,
    boxSizing: 'border-box',
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    width: '100%',
    overflowX: 'hidden',
  },
  phone: {
    width: '100%',
    maxWidth: PHONE_FRAME.maxWidth,
    height: PHONE_FRAME.height,
    background: COLORS.background,
    borderRadius: PHONE_FRAME.radius,
    overflow: 'hidden',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 28px 90px rgba(0,0,0,0.54)',
    position: 'relative',
    boxSizing: 'border-box',
  },
}

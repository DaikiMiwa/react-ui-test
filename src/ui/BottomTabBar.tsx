import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { COLORS } from './tokens'

const TABS = [
  { label: '今日', to: '/' },
  { label: 'データ', to: '/data-review' },
  { label: 'コーチ', to: '/chat' },
  { label: '食事', to: '/meal' },
  { label: '記録', to: '/workout' },
] as const

export function BottomTabBar() {
  const { pathname } = useLocation()

  return (
    <nav aria-label="主要ナビゲーション" style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.to

        return (
          <Link key={tab.to} to={tab.to} style={{ ...styles.item, ...(isActive ? styles.active : undefined) }}>
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

const styles: { [key: string]: CSSProperties } = {
  bar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    zIndex: 3,
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 4,
    padding: 6,
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    backdropFilter: 'blur(24px)',
    boxShadow: '0 18px 46px rgba(0,0,0,0.42)',
  },
  item: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 40,
    borderRadius: 999,
    color: COLORS.inactive,
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 900,
  },
  active: {
    color: COLORS.textPrimary,
    background: COLORS.surfaceMuted,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
  },
}

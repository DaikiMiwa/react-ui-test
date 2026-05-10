import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { COLORS } from './tokens'

const TABS = [
  { label: '今日', to: '/' },
  { label: 'カレンダー', to: '/calendar' },
  { label: 'データ', to: '/data-review' },
] as const

function getActiveTab(pathname: string) {
  if (pathname === '/calendar') return '/calendar'
  if (pathname === '/data-review') return '/data-review'
  if (pathname === '/') return '/'
  return null
}

export function BottomTabBar() {
  const { pathname } = useLocation()
  const activeTab = getActiveTab(pathname)

  return (
    <nav aria-label="主要ナビゲーション" style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.to

        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={isActive ? 'page' : undefined}
            style={{ ...styles.item, ...(isActive ? styles.active : undefined) }}
          >
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
    gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))`,
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
    whiteSpace: 'nowrap',
  },
  active: {
    color: COLORS.textPrimary,
    background: COLORS.surfaceMuted,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
  },
}

import type { CSSProperties } from 'react'
import { AppHeader } from '../ui/AppHeader'
import { AppMain } from '../ui/AppMain'
import { AppShell } from '../ui/AppShell'
import { IconButton } from '../ui/IconButton'
import { SurfaceCard } from '../ui/SurfaceCard'
import { COLORS } from '../ui/tokens'

export default function SettingsPage() {
  return (
    <AppShell>
      <AppHeader
        title="Settings"
        subtitle="アプリ設定"
        left={<IconButton to="/" ariaLabel="ホームへ戻る">‹</IconButton>}
      />
      <AppMain withBottomNav>
        <SurfaceCard>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.text}>ここに設定系コンポーネントを追加していけばOKです。</p>
        </SurfaceCard>
      </AppMain>
    </AppShell>
  )
}

const styles: { [key: string]: CSSProperties } = {
  title: {
    margin: 0,
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 850,
    letterSpacing: 0,
  },
  text: {
    margin: '8px 0 0',
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 1.5,
  },
}

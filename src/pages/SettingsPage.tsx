import { AppHeader } from '../ui/AppHeader'
import { AppMain } from '../ui/AppMain'
import { AppShell } from '../ui/AppShell'
import { EmptyState } from '../ui/EmptyState'
import { IconButton } from '../ui/IconButton'

export default function SettingsPage() {
  return (
    <AppShell>
      <AppHeader
        title="Settings"
        subtitle="アプリ設定"
        left={<IconButton to="/" ariaLabel="ホームへ戻る">‹</IconButton>}
      />
      <AppMain withBottomNav>
        <EmptyState title="Settings">
          ここに設定系コンポーネントを追加していけばOKです。
        </EmptyState>
      </AppMain>
    </AppShell>
  )
}

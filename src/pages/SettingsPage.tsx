import type { CSSProperties } from 'react'

export default function SettingsPage() {
  return (
    <div style={styles.wrap}>
      <h1>Settings</h1>
      <p>ここに設定系コンポーネントを追加していけばOKです。</p>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrap: {
    minHeight: '100vh',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#fff',
    background: '#050506',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  },
}

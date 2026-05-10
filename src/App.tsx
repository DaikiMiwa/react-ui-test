import { Link, Route, BrowserRouter, Routes } from 'react-router-dom'
import type { CSSProperties } from 'react'
import HealthAssistantChatPage from './pages/HealthAssistantChatPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import WorkoutSetLogPage from './pages/WorkoutSetLogPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<HealthAssistantChatPage />} />
        <Route path="/workout" element={<WorkoutSetLogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div style={styles.wrap}>
      <p>ページが見つかりません</p>
      <Link to="/">ホームへ戻る</Link>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    background: '#050506',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  },
}

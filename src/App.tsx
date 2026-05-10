import { Link, Route, HashRouter, Routes } from 'react-router-dom'
import type { CSSProperties } from 'react'
import HealthAssistantChatPage from './pages/HealthAssistantChatPage'
import HomePage from './pages/HomePage'
import CalendarLogPage from './pages/CalendarLogPage'
import HealthDataReviewPage from './pages/HealthDataReviewPage'
import MealInputPage from './pages/MealInputPage'
import SettingsPage from './pages/SettingsPage'
import WorkoutSetLogPage from './pages/WorkoutSetLogPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarLogPage />} />
        <Route path="/history" element={<CalendarLogPage />} />
        <Route path="/data-review" element={<HealthDataReviewPage />} />
        <Route path="/chat" element={<HealthAssistantChatPage />} />
        <Route path="/meal" element={<MealInputPage />} />
        <Route path="/workout" element={<WorkoutSetLogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
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

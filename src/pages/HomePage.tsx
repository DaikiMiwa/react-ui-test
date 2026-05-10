import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'

export default function HomePage() {
  return (
    <div style={styles.pageWrap}>
      <h1 style={styles.title}>Health UI Demo</h1>
      <p style={styles.text}>画面をパスで振り分ける例です。</p>
      <div style={styles.grid}>
        <Link to="/chat" style={styles.card}>
          Health Assistant Chat
        </Link>
        <Link to="/workout" style={styles.card}>
          Workout Set Log
        </Link>
        <Link to="/settings" style={styles.card}>
          Settings
        </Link>
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  pageWrap: {
    minHeight: '100vh',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    background: '#050506',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  },
  title: {
    margin: 0,
    fontSize: 30,
  },
  text: {
    color: '#a1a1aa',
    margin: 0,
  },
  grid: {
    marginTop: 18,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    minWidth: 180,
    padding: '14px 18px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#c084fc',
    textDecoration: 'none',
    fontWeight: 700,
  },
}

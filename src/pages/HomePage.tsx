import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { AppHeader, MoreDots } from '../ui/AppHeader'
import { AppMain } from '../ui/AppMain'
import { AppShell } from '../ui/AppShell'
import { IconButton } from '../ui/IconButton'
import { ProgressBar } from '../ui/ProgressBar'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusPill } from '../ui/StatusPill'
import { COLORS } from '../ui/tokens'

const trainingTasks = [
  { label: 'Bench Press', detail: '67.5kg × 8 · 4 sets', state: '次にやる' },
  { label: 'Incline DB Press', detail: '22kg × 10 · 3 sets', state: '予定' },
  { label: 'Cable Fly', detail: '18kg × 12 · 3 sets', state: '予定' },
]

const mealTasks = [
  { label: '朝食', detail: 'P 32g / 520kcal', done: true },
  { label: '昼食', detail: 'P 41g / 680kcal', done: true },
  { label: '夕食', detail: '鶏むね200g・白米180g・野菜・味噌汁', done: false },
]

const todayFocus = [
  {
    label: 'トレーニング',
    title: 'Bench Focus',
    detail: 'Bench Press 67.5kg × 8から開始',
    cta: '記録を開く',
    to: '/workout',
    accent: COLORS.primary,
  },
  {
    label: '食事',
    title: '夕食でP 54g',
    detail: '鶏むね200g・白米180g・野菜を取る',
    cta: '入力する',
    to: '/meal',
    accent: COLORS.success,
  },
]

const nutritionProgress = [
  { label: 'カロリー', value: '1,420', target: '2,200kcal', progress: 65, accent: COLORS.warning },
  { label: 'たんぱく質', value: '96', target: '150g', progress: 64, accent: COLORS.success },
  { label: '水分', value: '1.6', target: '2.5L', progress: 64, accent: COLORS.info },
]

const shortcuts = [
  {
    label: '今日の重量を相談',
    description: '疲労感や直近データから調整する',
    to: '/chat',
    accent: COLORS.coach,
  },
  {
    label: '食事プランを相談',
    description: '残りカロリーとPFCから夕食を決める',
    to: '/chat',
    accent: COLORS.success,
  },
  {
    label: 'MEALを入力',
    description: 'PFCと食べたものを食事ごとに保存する',
    to: '/meal',
    accent: COLORS.success,
  },
  {
    label: 'データを確認',
    description: '身体指標・食事・トレーニング履歴を見る',
    to: '/data-review',
    accent: COLORS.info,
  },
]

export default function HomePage() {
  return (
    <AppShell>
      <AppHeader
        title="今日"
        subtitle="トレーニングと食事"
        left={<IconButton to="/chat" ariaLabel="AIコーチを開く">✦</IconButton>}
        right={<IconButton to="/settings" ariaLabel="設定を開く"><MoreDots /></IconButton>}
      />

        <AppMain withBottomNav>
          <section style={styles.todayCard}>
            <div style={styles.todayGlow} />
            <div style={styles.todayContent}>
              <p style={styles.kicker}>TODAY PLAN</p>
              <h1 style={styles.todayTitle}>Push Dayを進めて、夕食でたんぱく質を埋める</h1>
              <p style={styles.todayText}>
                今日のゴールは、胸トレ10セットとたんぱく質150g。まずワークアウトを開始して、夕食は残り54gのたんぱく質を中心に決めましょう。
              </p>

              <div style={styles.focusGrid}>
                {todayFocus.map((focus) => (
                  <Link key={focus.label} to={focus.to} style={styles.focusCard}>
                    <span style={{ ...styles.focusRail, background: focus.accent }} />
                    <span style={styles.focusLabel}>{focus.label}</span>
                    <strong style={styles.focusTitle}>{focus.title}</strong>
                    <span style={styles.focusDetail}>{focus.detail}</span>
                    <span style={{ ...styles.focusCta, color: focus.accent }}>{focus.cta}</span>
                  </Link>
                ))}
              </div>

              <div style={styles.heroProgressGrid}>
                <div style={styles.heroProgressCard}>
                  <span style={styles.heroProgressValue}>0 / 10</span>
                  <span style={styles.heroProgressLabel}>training sets</span>
                  <ProgressBar value={0} accent={COLORS.primary} />
                </div>
                <div style={styles.heroProgressCard}>
                  <span style={styles.heroProgressValue}>96 / 150g</span>
                  <span style={styles.heroProgressLabel}>protein</span>
                  <ProgressBar value={64} accent={COLORS.success} />
                </div>
              </div>

              <div style={styles.todayActions}>
                <ActionButton to="/workout" variant="primary">トレーニング開始</ActionButton>
                <ActionButton to="/chat">食事を相談</ActionButton>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <SectionHeader title="トレーニング" action={<span style={styles.updatedText}>未開始</span>} />
            <Link to="/workout" style={styles.trainingCard}>
              <div style={styles.cardTopRow}>
                <div>
                  <span style={styles.cardEyebrow}>Chest / Push</span>
                  <h3 style={styles.cardTitle}>Bench Focus</h3>
                </div>
                <StatusPill>0%</StatusPill>
              </div>
              <ProgressBar value={0} accent={COLORS.primary} />
              <div style={styles.taskList}>
                {trainingTasks.map((task, index) => (
                  <div key={task.label} style={styles.taskRow}>
                    <span style={{ ...styles.taskIndex, background: index === 0 ? COLORS.primary : COLORS.surfaceMuted }}>
                      {index + 1}
                    </span>
                    <span style={styles.taskText}>
                      <strong style={styles.taskTitle}>{task.label}</strong>
                      <span style={styles.taskDetail}>{task.detail}</span>
                    </span>
                    <span style={index === 0 ? styles.taskStateActive : styles.taskState}>{task.state}</span>
                  </div>
                ))}
              </div>
            </Link>
          </section>

          <section style={styles.section}>
            <SectionHeader title="食事" action={<Link to="/meal" style={styles.sectionLink}>食事入力</Link>} />
            <section style={styles.mealCard}>
              <div style={styles.cardTopRow}>
                <div>
                  <span style={styles.cardEyebrow}>Nutrition target</span>
                  <h3 style={styles.cardTitle}>残りは夕食で調整</h3>
                </div>
                <StatusPill>2 / 3 meals</StatusPill>
              </div>

              <div style={styles.nutritionGrid}>
                {nutritionProgress.map((item) => (
                  <div key={item.label} style={styles.nutritionItem}>
                    <div style={styles.nutritionTop}>
                      <span style={styles.nutritionLabel}>{item.label}</span>
                      <span style={{ ...styles.nutritionPercent, color: item.accent }}>{item.progress}%</span>
                    </div>
                    <div style={styles.nutritionValueRow}>
                      <strong style={styles.nutritionValue}>{item.value}</strong>
                      <span style={styles.nutritionTarget}>/ {item.target}</span>
                    </div>
                    <ProgressBar value={item.progress} accent={item.accent} />
                  </div>
                ))}
              </div>

              <div style={styles.mealList}>
                {mealTasks.map((meal) => (
                  <div key={meal.label} style={styles.mealRow}>
                    <span style={meal.done ? styles.mealCheckDone : styles.mealCheckTodo}>{meal.done ? '✓' : '!'}</span>
                    <span style={styles.mealText}>
                      <strong style={styles.mealTitle}>{meal.label}</strong>
                      <span style={styles.mealDetail}>{meal.detail}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div style={styles.mealActions}>
                <ActionButton to="/meal" variant="primary" size="sm">MEALを入力</ActionButton>
                <ActionButton to="/chat" size="sm">相談する</ActionButton>
              </div>
            </section>
          </section>

          <section style={styles.section}>
            <SectionHeader title="必要な動線" />
            <div style={styles.shortcutStack}>
              {shortcuts.map((shortcut) => (
                <Link key={shortcut.label} to={shortcut.to} style={styles.shortcutCard}>
                  <span style={{ ...styles.shortcutRail, background: shortcut.accent }} />
                  <span style={styles.shortcutText}>
                    <strong style={styles.shortcutTitle}>{shortcut.label}</strong>
                    <span style={styles.shortcutDescription}>{shortcut.description}</span>
                  </span>
                  <span style={styles.chevron}>›</span>
                </Link>
              ))}
            </div>
          </section>
        </AppMain>
    </AppShell>
  )
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: COLORS.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    boxSizing: 'border-box',
    color: COLORS.textPrimary,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  },
  phone: {
    width: '100%',
    maxWidth: 430,
    height: 820,
    background: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 28px 90px rgba(0,0,0,0.5)',
    position: 'relative',
  },
  header: {
    height: 112,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 18px 0',
    boxSizing: 'border-box',
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    fontSize: 23,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
    textDecoration: 'none',
  },
  moreDots: {
    display: 'block',
    fontSize: 18,
    letterSpacing: 2,
    transform: 'translateX(1px) translateY(-1px)',
  },
  headerCenter: {
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: 800,
    letterSpacing: -0.4,
  },
  headerSub: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.4,
  },
  content: {
    height: 708,
    overflowY: 'auto',
    padding: '8px 18px 118px',
    boxSizing: 'border-box',
    scrollbarWidth: 'none',
  },
  todayCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    padding: 18,
    background: `linear-gradient(145deg, rgba(255, 107, 44, 0.24), ${COLORS.surface} 44%, ${COLORS.surfaceRaised})`,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 20px 44px rgba(0,0,0,0.34)',
  },
  todayGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    right: -58,
    top: -68,
    borderRadius: '50%',
    background: 'rgba(255, 107, 44, 0.36)',
    filter: 'blur(9px)',
  },
  todayContent: {
    position: 'relative',
    zIndex: 1,
  },
  kicker: {
    margin: '0 0 8px',
    color: COLORS.primarySoft,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.1em',
  },
  todayTitle: {
    margin: 0,
    maxWidth: 320,
    color: COLORS.textPrimary,
    fontSize: 30,
    lineHeight: 1.05,
    letterSpacing: '-0.055em',
  },
  todayText: {
    margin: '12px 0 0',
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 1.48,
  },
  focusGrid: {
    marginTop: 18,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  focusCard: {
    minHeight: 154,
    display: 'grid',
    alignContent: 'start',
    gap: 7,
    padding: 12,
    boxSizing: 'border-box',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: COLORS.textPrimary,
    textDecoration: 'none',
  },
  focusRail: {
    width: 32,
    height: 4,
    borderRadius: 999,
    marginBottom: 2,
  },
  focusLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
  },
  focusTitle: {
    fontSize: 19,
    lineHeight: 1.05,
    letterSpacing: '-0.035em',
  },
  focusDetail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 1.35,
  },
  focusCta: {
    marginTop: 'auto',
    fontSize: 12,
    fontWeight: 900,
  },
  heroProgressGrid: {
    marginTop: 18,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  heroProgressCard: {
    padding: 12,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'grid',
    gap: 7,
  },
  heroProgressValue: {
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: '-0.04em',
  },
  heroProgressLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  todayActions: {
    marginTop: 18,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: COLORS.primary,
    color: COLORS.onPrimary,
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 900,
  },
  secondaryAction: {
    minHeight: 46,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textPrimary,
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 900,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    margin: 0,
    color: COLORS.textPrimary,
    fontSize: 21,
    lineHeight: 1.1,
    letterSpacing: -0.4,
  },
  sectionLink: {
    color: COLORS.primary,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 800,
  },
  updatedText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
  },
  trainingCard: {
    display: 'block',
    padding: 16,
    borderRadius: 24,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 20px 44px rgba(0,0,0,0.26)',
    color: COLORS.textPrimary,
    textDecoration: 'none',
  },
  mealCard: {
    display: 'block',
    padding: 16,
    borderRadius: 24,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 20px 44px rgba(0,0,0,0.26)',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  cardEyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  cardTitle: {
    margin: '5px 0 0',
    color: COLORS.textPrimary,
    fontSize: 22,
    letterSpacing: '-0.04em',
  },
  taskList: {
    display: 'grid',
    gap: 8,
    marginTop: 14,
  },
  taskRow: {
    display: 'grid',
    gridTemplateColumns: '28px 1fr auto',
    alignItems: 'center',
    gap: 10,
    padding: '10px 10px',
    borderRadius: 16,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
  },
  taskIndex: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 900,
  },
  taskText: {
    display: 'grid',
    gap: 3,
    minWidth: 0,
  },
  taskTitle: {
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  taskDetail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  taskState: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  taskStateActive: {
    color: COLORS.primarySoft,
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  nutritionGrid: {
    display: 'grid',
    gap: 10,
  },
  nutritionItem: {
    display: 'grid',
    gap: 7,
    padding: 12,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
  },
  nutritionTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  nutritionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 900,
  },
  nutritionPercent: {
    fontSize: 12,
    fontWeight: 900,
  },
  nutritionValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 5,
  },
  nutritionValue: {
    fontSize: 23,
    lineHeight: 1,
    letterSpacing: '-0.045em',
  },
  nutritionTarget: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
  },
  mealList: {
    display: 'grid',
    gap: 8,
    marginTop: 14,
  },
  mealRow: {
    display: 'grid',
    gridTemplateColumns: '28px 1fr',
    gap: 10,
    alignItems: 'center',
    padding: '10px 10px',
    borderRadius: 16,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
  },
  mealCheckDone: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: COLORS.success,
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: 900,
  },
  mealCheckTodo: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: COLORS.warning,
    color: COLORS.background,
    fontSize: 13,
    fontWeight: 900,
  },
  mealText: {
    display: 'grid',
    gap: 3,
    minWidth: 0,
  },
  mealTitle: {
    fontSize: 14,
  },
  mealDetail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mealActions: {
    marginTop: 14,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  mealPrimaryAction: {
    minHeight: 42,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: COLORS.success,
    color: COLORS.onPrimary,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 900,
  },
  mealSecondaryAction: {
    minHeight: 42,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textPrimary,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 900,
  },
  shortcutStack: {
    display: 'grid',
    gap: 10,
    marginTop: 12,
  },
  shortcutCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    minHeight: 72,
    padding: '12px 14px',
    boxSizing: 'border-box',
    borderRadius: 22,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    textDecoration: 'none',
    color: COLORS.textPrimary,
  },
  shortcutRail: {
    width: 12,
    height: 38,
    borderRadius: 999,
    flex: '0 0 auto',
  },
  shortcutText: {
    display: 'grid',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  shortcutTitle: {
    fontSize: 15,
    letterSpacing: '-0.015em',
  },
  shortcutDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 1.35,
  },
  chevron: {
    color: COLORS.textMuted,
    fontSize: 26,
    lineHeight: 1,
  },
  tabBar: {
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
  tabItem: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 40,
    borderRadius: 999,
    color: COLORS.inactive,
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 900,
  },
  tabItemActive: {
    color: COLORS.onPrimary,
    background: COLORS.primary,
  },
}

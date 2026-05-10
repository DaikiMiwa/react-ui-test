import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { AppHeader, MoreDots } from '../ui/AppHeader'
import { AppMain } from '../ui/AppMain'
import { AppShell } from '../ui/AppShell'
import { IconButton } from '../ui/IconButton'
import { SegmentedControl } from '../ui/SegmentedControl'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusPill } from '../ui/StatusPill'
import { COLORS } from '../ui/tokens'

const VIEW_MODES = ['meal', 'training'] as const
const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']
const STORAGE_KEY = 'workout-health-calendar-logs-v1'
const MEAL_STORAGE_KEY = 'workout-health-meals-v1'
const DAILY_PLAN_TARGETS = { calories: 2200, protein: 150, fat: 60, carbs: 240, waterLiters: 2.5 }

type ViewMode = (typeof VIEW_MODES)[number]
type MacroKey = 'protein' | 'fat' | 'carbs'

type MealDraft = {
  id: string
  label: string
  timeLabel: string
  protein: number
  fat: number
  carbs: number
  memo: string
  saved: boolean
}

type TrainingSetDraft = {
  set: number
  planWeight: number
  planReps: number
  actualWeight: number
  actualReps: number
  done: boolean
}

type TrainingExerciseDraft = {
  name: string
  target: string
  sets: TrainingSetDraft[]
}

type DailyLog = {
  date: string
  bodyWeight: number
  waterLiters: number
  meals: MealDraft[]
  training: TrainingExerciseDraft[]
  note: string
}

type DailyPlan = {
  date: string
  label: string
  training: Array<{
    name: string
    target: string
    sets: string
  }>
  meals: Array<{
    label: string
    calories: number
    protein: number
    fat: number
    carbs: number
  }>
}

function defaultMeals(date: string): MealDraft[] {
  return [
    { id: `${date}-meal-1`, label: 'MEAL 1', timeLabel: '08:00', protein: 0, fat: 0, carbs: 0, memo: '', saved: false },
    { id: `${date}-meal-2`, label: 'MEAL 2', timeLabel: '12:30', protein: 0, fat: 0, carbs: 0, memo: '', saved: false },
    { id: `${date}-meal-3`, label: 'MEAL 3', timeLabel: '19:00', protein: 0, fat: 0, carbs: 0, memo: '', saved: false },
  ]
}

function normalizeMealDraft(item: Partial<MealDraft>, index: number, date: string): MealDraft {
  return {
    id: typeof item.id === 'string' ? item.id : `${date}-meal-${index + 1}`,
    label: typeof item.label === 'string' ? item.label : `MEAL ${index + 1}`,
    timeLabel: typeof item.timeLabel === 'string' ? item.timeLabel : index === 0 ? '08:00' : index === 1 ? '12:30' : '19:00',
    protein: Number.isFinite(item.protein) ? Math.max(0, Number(item.protein)) : 0,
    fat: Number.isFinite(item.fat) ? Math.max(0, Number(item.fat)) : 0,
    carbs: Number.isFinite(item.carbs) ? Math.max(0, Number(item.carbs)) : 0,
    memo: typeof item.memo === 'string' ? item.memo : '',
    saved: Boolean(item.saved),
  }
}

function normalizeSetDraft(item: Partial<TrainingSetDraft>, index: number): TrainingSetDraft {
  const planWeight = Number.isFinite(item.planWeight) ? Math.max(0, Number(item.planWeight)) : 0
  const planReps = Number.isFinite(item.planReps) ? Math.max(0, Number(item.planReps)) : 0
  return {
    set: Number.isFinite(item.set) ? Math.max(1, Number(item.set)) : index + 1,
    planWeight,
    planReps,
    actualWeight: Number.isFinite(item.actualWeight) ? Math.max(0, Number(item.actualWeight)) : planWeight,
    actualReps: Number.isFinite(item.actualReps) ? Math.max(0, Number(item.actualReps)) : planReps,
    done: Boolean(item.done),
  }
}

function normalizeTrainingDraft(item: Partial<TrainingExerciseDraft>): TrainingExerciseDraft | null {
  if (typeof item.name !== 'string' || !item.name.trim()) return null
  return {
    name: item.name,
    target: typeof item.target === 'string' ? item.target : '',
    sets: Array.isArray(item.sets) ? item.sets.map((set, index) => normalizeSetDraft(set, index)) : [],
  }
}

function mergePlanIntoLog(log: DailyLog, plan?: DailyPlan): DailyLog {
  if (!plan) return log
  const blank = makeBlankLog(log.date, plan)
  return {
    ...log,
    meals: log.meals.length > 0 ? log.meals : blank.meals,
    training: log.training.length > 0 ? log.training : blank.training,
  }
}

function normalizeLog(item: Partial<DailyLog>): DailyLog {
  const date = typeof item.date === 'string' ? item.date : toDateKey(new Date())
  const meals = Array.isArray(item.meals)
    ? item.meals.map((meal, index) => normalizeMealDraft(meal, index, date)).filter((meal) => meal.label)
    : []
  const training = Array.isArray(item.training)
    ? item.training.map(normalizeTrainingDraft).filter((exercise): exercise is TrainingExerciseDraft => Boolean(exercise))
    : []
  return {
    ...makeBlankLog(date),
    ...item,
    bodyWeight: Number.isFinite(item.bodyWeight) ? Number(item.bodyWeight) : 0,
    waterLiters: Number.isFinite(item.waterLiters) ? Number(item.waterLiters) : 0,
    meals: meals.length > 0 ? meals : defaultMeals(date),
    training,
    note: typeof item.note === 'string' ? item.note : '',
  }
}

function readTodayMealLog(date: string): Pick<DailyLog, 'meals' | 'waterLiters'> | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(MEAL_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || parsed.date !== date) return null
    const meals = Array.isArray(parsed.meals)
      ? parsed.meals.map((meal: Partial<MealDraft>, index: number) => normalizeMealDraft(meal, index, date))
      : defaultMeals(date)
    return {
      meals: meals.length > 0 ? meals : defaultMeals(date),
      waterLiters: Number.isFinite(parsed.waterLiters) ? Math.max(0, Number(parsed.waterLiters)) : 0,
    }
  } catch {
    return null
  }
}

function loadInitialLogs() {
  const today = toDateKey(new Date())
  const applyTodayMealLog = (logs: DailyLog[]) => {
    const todayMealLog = readTodayMealLog(today)
    if (!todayMealLog) return logs.map((log) => mergePlanIntoLog(log, MOCK_PLANS.find((plan) => plan.date === log.date)))
    const nextLogs = logs.map((log) =>
      log.date === today ? { ...mergePlanIntoLog(log, MOCK_PLANS.find((plan) => plan.date === log.date)), ...todayMealLog } : mergePlanIntoLog(log, MOCK_PLANS.find((plan) => plan.date === log.date))
    )
    return nextLogs.some((log) => log.date === today)
      ? nextLogs
      : [...nextLogs, { ...makeBlankLog(today, MOCK_PLANS.find((plan) => plan.date === today)), ...todayMealLog }]
  }

  if (typeof window === 'undefined') return MOCK_LOGS

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return applyTodayMealLog(MOCK_LOGS)
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return applyTodayMealLog(MOCK_LOGS)
    return applyTodayMealLog(parsed.map(normalizeLog))
  } catch {
    return applyTodayMealLog(MOCK_LOGS)
  }
}

const MACRO_FIELDS: Array<{ key: MacroKey; label: string; shortLabel: string; color: string }> = [
  { key: 'protein', label: 'Protein', shortLabel: 'P', color: COLORS.protein },
  { key: 'fat', label: 'Fat', shortLabel: 'F', color: COLORS.fat },
  { key: 'carbs', label: 'Carbs', shortLabel: 'C', color: COLORS.carbs },
]

function createSet(set: number, planWeight: number, planReps: number, done = false): TrainingSetDraft {
  return {
    set,
    planWeight,
    planReps,
    actualWeight: planWeight,
    actualReps: planReps,
    done,
  }
}

const MOCK_LOGS: DailyLog[] = [
  {
    date: '2026-05-05',
    bodyWeight: 77.8,
    waterLiters: 2.3,
    meals: [
      { id: 'm1', label: 'MEAL 1', timeLabel: '08:15', protein: 31, fat: 12, carbs: 56, memo: 'オートミール、ヨーグルト、プロテイン', saved: true },
      { id: 'm2', label: 'MEAL 2', timeLabel: '12:42', protein: 42, fat: 18, carbs: 75, memo: '鶏むね定食、ご飯普通盛り', saved: true },
      { id: 'm3', label: 'MEAL 3', timeLabel: '19:10', protein: 38, fat: 16, carbs: 62, memo: '鮭、白米、味噌汁、サラダ', saved: true },
    ],
    training: [
      { name: 'Bench Press', target: 'Chest / Push', sets: [createSet(1, 60, 10, true), createSet(2, 65, 8, true), createSet(3, 67.5, 7, true)] },
      { name: 'Cable Fly', target: 'Chest Finish', sets: [createSet(1, 18, 12, true), createSet(2, 18, 12, true)] },
    ],
    note: 'ベンチは3セット目で少し重い。夕食は脂質控えめ。',
  },
  {
    date: '2026-05-07',
    bodyWeight: 77.5,
    waterLiters: 1.8,
    meals: [
      { id: 'm1', label: 'MEAL 1', timeLabel: '08:30', protein: 28, fat: 10, carbs: 48, memo: '卵、トースト、プロテイン', saved: true },
      { id: 'm2', label: 'MEAL 2', timeLabel: '13:05', protein: 35, fat: 24, carbs: 86, memo: '外食ランチ。ハンバーグ定食', saved: true },
      { id: 'm3', label: 'MEAL 3', timeLabel: '20:00', protein: 0, fat: 0, carbs: 0, memo: '', saved: false },
    ],
    training: [],
    note: '昼が重め。夜で調整予定。',
  },
  {
    date: '2026-05-09',
    bodyWeight: 77.4,
    waterLiters: 2.1,
    meals: [
      { id: 'm1', label: 'MEAL 1', timeLabel: '09:10', protein: 24, fat: 7, carbs: 34, memo: 'プロテイン軽食', saved: true },
      { id: 'm2', label: 'MEAL 2', timeLabel: '12:35', protein: 44, fat: 13, carbs: 70, memo: '鶏むね、白米、野菜', saved: true },
    ],
    training: [
      { name: 'Incline Dumbbell Press', target: 'Upper Chest', sets: [createSet(1, 22, 10, true), createSet(2, 22, 9, true), createSet(3, 20, 12, false)] },
    ],
    note: '',
  },
  {
    date: '2026-05-11',
    bodyWeight: 77.6,
    waterLiters: 1.6,
    meals: [
      { id: 'm1', label: 'MEAL 1', timeLabel: '08:10', protein: 34, fat: 12, carbs: 58, memo: 'オートミール、ギリシャヨーグルト、バナナ、プロテイン', saved: true },
      { id: 'm2', label: 'MEAL 2', timeLabel: '12:40', protein: 46, fat: 18, carbs: 72, memo: '鶏むね肉の定食。ご飯、味噌汁、サラダ', saved: true },
      { id: 'm3', label: 'MEAL 3', timeLabel: '18:30', protein: 0, fat: 0, carbs: 0, memo: '', saved: false },
    ],
    training: [
      {
        name: 'Bench Press',
        target: 'Chest / Push',
        sets: [createSet(1, 60, 10, false), createSet(2, 65, 8, false), createSet(3, 67.5, 8, false), createSet(4, 65, 8, false)],
      },
      { name: 'Incline Dumbbell Press', target: 'Upper Chest', sets: [createSet(1, 22, 10, false), createSet(2, 22, 10, false), createSet(3, 20, 12, false)] },
    ],
    note: '',
  },
]

const MOCK_PLANS: DailyPlan[] = [
  {
    date: '2026-05-11',
    label: 'Today',
    training: [
      { name: 'Bench Press', target: 'Chest / Push', sets: '67.5kg x 8 x 4' },
      { name: 'Incline DB Press', target: 'Upper Chest', sets: '22kg x 10 x 3' },
    ],
    meals: [
      { label: 'MEAL 1', calories: 520, protein: 34, fat: 12, carbs: 58 },
      { label: 'MEAL 2', calories: 680, protein: 46, fat: 18, carbs: 72 },
      { label: 'MEAL 3', calories: 760, protein: 54, fat: 16, carbs: 86 },
    ],
  },
  {
    date: '2026-05-12',
    label: 'Tomorrow',
    training: [
      { name: 'Zone 2', target: 'Recovery', sets: '25min' },
      { name: 'Mobility', target: 'Shoulder', sets: '10min' },
    ],
    meals: [
      { label: 'MEAL 1', calories: 500, protein: 32, fat: 10, carbs: 62 },
      { label: 'MEAL 2', calories: 700, protein: 42, fat: 14, carbs: 88 },
      { label: 'MEAL 3', calories: 850, protein: 58, fat: 18, carbs: 92 },
    ],
  },
  {
    date: '2026-05-13',
    label: 'Next Session',
    training: [
      { name: 'Deadlift', target: 'Pull / Hinge', sets: '110kg x 5 x 3' },
      { name: 'Lat Pulldown', target: 'Lats', sets: '55kg x 10 x 3' },
      { name: 'Seated Row', target: 'Back', sets: '48kg x 12 x 3' },
    ],
    meals: [
      { label: 'MEAL 1', calories: 560, protein: 32, fat: 12, carbs: 72 },
      { label: 'MEAL 2', calories: 780, protein: 44, fat: 18, carbs: 98 },
      { label: 'MEAL 3', calories: 720, protein: 46, fat: 16, carbs: 76 },
    ],
  },
  {
    date: '2026-05-15',
    label: 'Bench Volume',
    training: [
      { name: 'Bench Press', target: 'Volume', sets: '60kg x 10 x 4' },
      { name: 'Incline DB Press', target: 'Upper Chest', sets: '22kg x 10 x 3' },
      { name: 'Cable Fly', target: 'Chest Finish', sets: '18kg x 12 x 3' },
    ],
    meals: [
      { label: 'MEAL 1', calories: 520, protein: 34, fat: 12, carbs: 58 },
      { label: 'MEAL 2', calories: 760, protein: 40, fat: 24, carbs: 88 },
      { label: 'MEAL 3', calories: 680, protein: 56, fat: 12, carbs: 72 },
    ],
  },
  {
    date: '2026-05-17',
    label: 'Check-in',
    training: [
      { name: 'Walk', target: 'Recovery', sets: '8,000 steps' },
      { name: 'Stretch', target: 'Full Body', sets: '10min' },
    ],
    meals: [
      { label: 'MEAL 1', calories: 500, protein: 32, fat: 12, carbs: 58 },
      { label: 'MEAL 2', calories: 700, protein: 44, fat: 18, carbs: 78 },
      { label: 'MEAL 3', calories: 720, protein: 50, fat: 16, carbs: 80 },
    ],
  },
]

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readNumericInput(value: string) {
  if (value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function calcCalories(meal: Pick<MealDraft, 'protein' | 'fat' | 'carbs'>) {
  return Math.round(meal.protein * 4 + meal.fat * 9 + meal.carbs * 4)
}

function setsFromPlan(planSets: string): TrainingSetDraft[] {
  const match = planSets.match(/(\d+(?:\.\d+)?)kg\s*x\s*(\d+)\s*x\s*(\d+)/i)
  if (!match) return []

  const weight = Number(match[1])
  const reps = Number(match[2])
  const count = Number(match[3])
  return Array.from({ length: count }, (_, index) => createSet(index + 1, weight, reps))
}

function makeBlankLog(date: string, plan?: DailyPlan): DailyLog {
  return {
    date,
    bodyWeight: 0,
    waterLiters: 0,
    meals: plan?.meals.map((meal, index) => ({
      id: `${date}-meal-${index + 1}`,
      label: meal.label,
      timeLabel: index === 0 ? '08:00' : index === 1 ? '12:30' : '19:00',
      protein: 0,
      fat: 0,
      carbs: 0,
      memo: '',
      saved: false,
    })) ?? defaultMeals(date),
    training: plan?.training
      .map((exercise) => ({
        name: exercise.name,
        target: exercise.target,
        sets: setsFromPlan(exercise.sets),
      }))
      .filter((exercise) => exercise.sets.length > 0) ?? [],
    note: '',
  }
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const visibleDayCount = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: visibleDayCount }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return {
      key: toDateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    }
  })
}

export default function CalendarLogPage() {
  const todayKey = toDateKey(new Date())
  const [monthDate, setMonthDate] = useState(() => new Date(2026, 4, 1))
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [logs, setLogs] = useState<DailyLog[]>(loadInitialLogs)
  const [activeMealId, setActiveMealId] = useState('m3')
  const [activeExerciseName, setActiveExerciseName] = useState('Bench Press')
  const [viewMode, setViewMode] = useState<ViewMode>('meal')

  const selectedPlan = MOCK_PLANS.find((plan) => plan.date === selectedDate)
  const selectedLog = logs.find((log) => log.date === selectedDate) || makeBlankLog(selectedDate, selectedPlan)
  const nextPlan = MOCK_PLANS.find((plan) => plan.date > selectedDate)
  const isFutureDate = selectedDate > todayKey
  const isToday = selectedDate === todayKey
  const activeMeal = selectedLog.meals.find((meal) => meal.id === activeMealId) || selectedLog.meals[0]
  const activeExercise = selectedLog.training.find((exercise) => exercise.name === activeExerciseName) || selectedLog.training[0]
  const calendarDays = useMemo(() => buildCalendarDays(monthDate), [monthDate])
  const monthLabel = new Intl.DateTimeFormat('ja-JP', { month: 'long', year: 'numeric' }).format(monthDate)
  const savedMeals = selectedLog.meals.filter((meal) => meal.saved).length
  const totalSets = selectedLog.training.reduce((sum, exercise) => sum + exercise.sets.length, 0)
  const doneSets = selectedLog.training.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.done).length, 0)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
    const todayLog = logs.find((log) => log.date === todayKey)
    if (todayLog) {
      window.localStorage.setItem(
        MEAL_STORAGE_KEY,
        JSON.stringify({
          schemaVersion: 2,
          date: todayKey,
          meals: todayLog.meals,
          waterLiters: todayLog.waterLiters,
          planTargets: DAILY_PLAN_TARGETS,
        })
      )
    }
  }, [logs, todayKey])

  function updateSelectedLog(updater: (log: DailyLog) => DailyLog) {
    setLogs((currentLogs) => {
      const plan = MOCK_PLANS.find((item) => item.date === selectedDate)
      const currentLog = currentLogs.find((log) => log.date === selectedDate) || makeBlankLog(selectedDate, plan)
      const nextLog = updater(currentLog)
      return currentLogs.some((log) => log.date === nextLog.date)
        ? currentLogs.map((log) => (log.date === nextLog.date ? nextLog : log))
        : [...currentLogs, nextLog]
    })
  }

  function selectDate(date: string) {
    setSelectedDate(date)
    const nextPlan = MOCK_PLANS.find((plan) => plan.date === date)
    const nextLog = logs.find((log) => log.date === date) || makeBlankLog(date, nextPlan)
    setActiveMealId(nextLog.meals[0]?.id || `${date}-meal-1`)
    setActiveExerciseName(nextLog.training[0]?.name || 'Bench Press')
  }

  function moveMonth(offset: number) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  function updateMeal(mealId: string, updater: (meal: MealDraft) => MealDraft) {
    updateSelectedLog((log) => ({
      ...log,
      meals: log.meals.map((meal) => (meal.id === mealId ? updater(meal) : meal)),
    }))
  }

  function updateActiveMacro(key: MacroKey, value: number) {
    updateMeal(activeMeal.id, (meal) => ({ ...meal, [key]: value, saved: false }))
  }

  function addMeal() {
    const nextNumber = selectedLog.meals.length + 1
    const nextMeal: MealDraft = {
      id: `${selectedDate}-meal-${Date.now()}`,
      label: `MEAL ${nextNumber}`,
      timeLabel: '20:30',
      protein: 0,
      fat: 0,
      carbs: 0,
      memo: '',
      saved: false,
    }
    updateSelectedLog((log) => ({ ...log, meals: [...log.meals, nextMeal] }))
    setActiveMealId(nextMeal.id)
  }

  function updateTrainingSet(exerciseName: string, setNumber: number, updater: (set: TrainingSetDraft) => TrainingSetDraft) {
    updateSelectedLog((log) => ({
      ...log,
      training: log.training.map((exercise) =>
        exercise.name === exerciseName
          ? { ...exercise, sets: exercise.sets.map((set) => (set.set === setNumber ? updater(set) : set)) }
          : exercise
      ),
    }))
  }

  function addTrainingSet() {
    if (!activeExercise) return
    const lastSet = activeExercise.sets[activeExercise.sets.length - 1]
    const nextSet = createSet((lastSet?.set || 0) + 1, lastSet?.actualWeight || 20, lastSet?.actualReps || 10)
    updateSelectedLog((log) => ({
      ...log,
      training: log.training.map((exercise) => (exercise.name === activeExercise.name ? { ...exercise, sets: [...exercise.sets, nextSet] } : exercise)),
    }))
  }

  function addExercise() {
    const nextExercise: TrainingExerciseDraft = {
      name: `Accessory ${selectedLog.training.length + 1}`,
      target: 'Optional',
      sets: [createSet(1, 20, 12)],
    }
    updateSelectedLog((log) => ({ ...log, training: [...log.training, nextExercise] }))
    setActiveExerciseName(nextExercise.name)
  }

  function completeExercise(exerciseName: string) {
    updateSelectedLog((log) => ({
      ...log,
      training: log.training.map((exercise) =>
        exercise.name === exerciseName
          ? { ...exercise, sets: exercise.sets.map((set) => ({ ...set, done: true })) }
          : exercise
      ),
    }))
  }

  return (
    <AppShell>
      <AppHeader
        title="カレンダー"
        subtitle="予定と記録"
        left={<IconButton to="/" ariaLabel="ホームへ戻る">‹</IconButton>}
        right={<IconButton to="/settings" ariaLabel="設定を開く"><MoreDots /></IconButton>}
      />

      <AppMain withBottomNav>
        <section style={styles.monthCard}>
          <div style={styles.monthHeader}>
            <IconButton ariaLabel="前の月" onClick={() => moveMonth(-1)}>‹</IconButton>
            <div>
              <p style={styles.kicker}>MONTH LOG</p>
              <h1 style={styles.monthTitle}>{monthLabel}</h1>
            </div>
            <IconButton ariaLabel="次の月" onClick={() => moveMonth(1)}>›</IconButton>
          </div>

          <div style={styles.weekGrid}>
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} style={styles.weekday}>{weekday}</span>
            ))}
          </div>
          <div style={styles.calendarGrid}>
            {calendarDays.map((day) => {
              const log = logs.find((item) => item.date === day.key)
              const plan = MOCK_PLANS.find((item) => item.date === day.key)
              const hasMeals = Boolean(log?.meals.some((meal) => meal.saved))
              const hasTraining = Boolean(log?.training.some((exercise) => exercise.sets.some((set) => set.done)))
              const hasMealPlan = Boolean(plan?.meals.length)
              const hasTrainingPlan = Boolean(plan?.training.length)
              const isSelected = selectedDate === day.key
              const isToday = todayKey === day.key
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => selectDate(day.key)}
                  style={{
                    ...styles.dayCell,
                    ...(day.inMonth ? undefined : styles.dayCellMuted),
                    ...(isSelected ? styles.dayCellSelected : undefined),
                    ...(isToday && !isSelected ? styles.dayCellToday : undefined),
                  }}
                >
                  {plan ? <span style={styles.dayPlanMarker}>{plan.label}</span> : null}
                  <span style={styles.dayNumber}>{day.day}</span>
                  <span style={styles.dayDots}>
                    <span
                      style={{
                        ...styles.dayDot,
                        ...(hasMeals
                          ? { background: COLORS.primarySoft }
                          : hasMealPlan
                            ? { background: 'transparent', border: `1px solid ${COLORS.primarySoft}` }
                            : { background: COLORS.surfaceMuted }),
                      }}
                    />
                    <span
                      style={{
                        ...styles.dayDot,
                        ...(hasTraining
                          ? { background: COLORS.primary }
                          : hasTrainingPlan
                            ? { background: 'transparent', border: `1px solid ${COLORS.primary}` }
                            : { background: COLORS.surfaceMuted }),
                      }}
                    />
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {isFutureDate ? (
          <PlanSchedulePanel plan={selectedPlan} nextPlan={nextPlan} selectedDate={selectedDate} />
        ) : isToday ? (
          <TodayInputPanel plan={selectedPlan} savedMeals={savedMeals} totalMeals={selectedLog.meals.length} doneSets={doneSets} totalSets={totalSets} />
        ) : (
          <>
            <BodyHydrationEditor
              bodyWeight={selectedLog.bodyWeight}
              waterLiters={selectedLog.waterLiters}
              onBodyWeightChange={(bodyWeight) => updateSelectedLog((log) => ({ ...log, bodyWeight }))}
              onWaterChange={(waterLiters) => updateSelectedLog((log) => ({ ...log, waterLiters }))}
            />

            <SegmentedControl
              items={VIEW_MODES}
              value={viewMode}
              onChange={setViewMode}
              ariaLabel="実績タイプ"
              getLabel={(mode) => (mode === 'meal' ? '食事' : 'トレーニング')}
              style={styles.subModeSwitch}
            />

            {viewMode === 'meal' ? (
              <MealRetroEditor
                meals={selectedLog.meals}
                activeMeal={activeMeal}
                onSelectMeal={setActiveMealId}
                onAddMeal={addMeal}
                onUpdateMacro={updateActiveMacro}
                onUpdateMemo={(memo) => updateMeal(activeMeal.id, (meal) => ({ ...meal, memo, saved: false }))}
                onSave={() => updateMeal(activeMeal.id, (meal) => ({ ...meal, saved: true }))}
                onClear={() => updateMeal(activeMeal.id, (meal) => ({ ...meal, protein: 0, fat: 0, carbs: 0, memo: '', saved: false }))}
              />
            ) : (
              <TrainingRetroEditor
                exercises={selectedLog.training}
                activeExercise={activeExercise}
                onSelectExercise={setActiveExerciseName}
                onAddExercise={addExercise}
                onAddSet={addTrainingSet}
                onUpdateSet={updateTrainingSet}
                onCompleteExercise={completeExercise}
              />
            )}

            <section style={styles.noteCard}>
              <SectionHeader title="日別メモ" />
              <textarea
                value={selectedLog.note}
                onChange={(event) => updateSelectedLog((log) => ({ ...log, note: event.target.value }))}
                placeholder="体調、睡眠、食欲、重量の感触など"
                style={styles.noteTextarea}
              />
            </section>
          </>
        )}
      </AppMain>
    </AppShell>
  )
}

function TodayInputPanel({
  plan,
  savedMeals,
  totalMeals,
  doneSets,
  totalSets,
}: {
  plan?: DailyPlan
  savedMeals: number
  totalMeals: number
  doneSets: number
  totalSets: number
}) {
  const nutritionTotals = plan?.meals.reduce(
    (sum, meal) => ({
      calories: sum.calories + meal.calories,
      protein: sum.protein + meal.protein,
      fat: sum.fat + meal.fat,
      carbs: sum.carbs + meal.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )

  return (
    <section style={styles.todayInputCard}>
      <div style={styles.planFocusHeader}>
        <div>
          <p style={styles.kicker}>TODAY INPUT</p>
          <h2 style={styles.planFocusTitle}>今日の入力</h2>
        </div>
        <StatusPill>{savedMeals}/{totalMeals} meals</StatusPill>
      </div>

      {nutritionTotals ? (
        <div style={styles.planNutritionCard}>
          <div style={styles.planNutritionTop}>
            <span style={styles.planItemLabel}>PLANNED NUTRITION</span>
            <strong style={styles.planCalories}>{nutritionTotals.calories} kcal</strong>
          </div>
          <div style={styles.planMacroGrid}>
            {MACRO_FIELDS.map((field) => (
              <span key={field.key} style={styles.planMacroItem}>
                <span style={{ ...styles.planMacroDot, background: field.color }} />
                {field.shortLabel} {nutritionTotals[field.key]}g
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div style={styles.todayInputGrid}>
        <section style={styles.todayInputItem}>
          <span style={{ ...styles.planRail, background: COLORS.primary }} />
          <span style={styles.planItemLabel}>TRAINING</span>
          <strong style={styles.planItemTitle}>トレーニングを記録</strong>
          <span style={styles.planItemDetail}>{doneSets}/{totalSets || 0} sets complete</span>
          <ActionButton to="/workout" variant="primary" size="sm">開く</ActionButton>
        </section>
        <section style={styles.todayInputItem}>
          <span style={{ ...styles.planRail, background: COLORS.primarySoft }} />
          <span style={styles.planItemLabel}>MEAL</span>
          <strong style={styles.planItemTitle}>食事を入力</strong>
          <span style={styles.planItemDetail}>{savedMeals}/{totalMeals} meals saved</span>
          <ActionButton to="/meal" variant="primary" size="sm">開く</ActionButton>
        </section>
      </div>
    </section>
  )
}

function BodyHydrationEditor({
  bodyWeight,
  waterLiters,
  onBodyWeightChange,
  onWaterChange,
}: {
  bodyWeight: number
  waterLiters: number
  onBodyWeightChange: (value: number) => void
  onWaterChange: (value: number) => void
}) {
  const [bodyWeightDraft, setBodyWeightDraft] = useState(bodyWeight ? String(bodyWeight) : '')
  const [waterDraft, setWaterDraft] = useState(waterLiters ? String(waterLiters) : '')

  useEffect(() => {
    setBodyWeightDraft(bodyWeight ? String(bodyWeight) : '')
  }, [bodyWeight])

  useEffect(() => {
    setWaterDraft(waterLiters ? String(waterLiters) : '')
  }, [waterLiters])

  return (
    <section style={styles.bodyHydrationCard}>
      <div>
        <p style={styles.kicker}>BODY CHECK</p>
        <h2 style={styles.editorTitle}>体重と水分</h2>
      </div>
      <div style={styles.bodyHydrationGrid}>
        <label style={styles.compactInputWrap}>
          <span style={styles.inputLabel}>体重</span>
          <span style={styles.compactInputRow}>
            <input
              value={bodyWeightDraft}
              onChange={(event) => setBodyWeightDraft(event.target.value)}
              onBlur={() => onBodyWeightChange(readNumericInput(bodyWeightDraft))}
              inputMode="decimal"
              aria-label="体重 kg"
              style={styles.compactNumberInput}
            />
            <span style={styles.inputUnit}>kg</span>
          </span>
        </label>
        <label style={styles.compactInputWrap}>
          <span style={styles.inputLabel}>水分</span>
          <span style={styles.compactInputRow}>
            <input
              value={waterDraft}
              onChange={(event) => setWaterDraft(event.target.value)}
              onBlur={() => onWaterChange(readNumericInput(waterDraft))}
              inputMode="decimal"
              aria-label="水分 L"
              style={styles.compactNumberInput}
            />
            <span style={styles.inputUnit}>L</span>
          </span>
        </label>
      </div>
      <div style={styles.waterQuickActions}>
        <button type="button" onClick={() => onWaterChange(Math.round((waterLiters + 0.25) * 100) / 100)} style={styles.quickWaterButton}>+250ml</button>
        <button type="button" onClick={() => onWaterChange(Math.round((waterLiters + 0.5) * 100) / 100)} style={styles.quickWaterButton}>+500ml</button>
      </div>
    </section>
  )
}

function MealRetroEditor({
  meals,
  activeMeal,
  onSelectMeal,
  onAddMeal,
  onUpdateMacro,
  onUpdateMemo,
  onSave,
  onClear,
}: {
  meals: MealDraft[]
  activeMeal: MealDraft
  onSelectMeal: (mealId: string) => void
  onAddMeal: () => void
  onUpdateMacro: (key: MacroKey, value: number) => void
  onUpdateMemo: (memo: string) => void
  onSave: () => void
  onClear: () => void
}) {
  const totals = meals.reduce(
    (sum, meal) => ({
      protein: sum.protein + meal.protein,
      fat: sum.fat + meal.fat,
      carbs: sum.carbs + meal.carbs,
      calories: sum.calories + calcCalories(meal),
    }),
    { protein: 0, fat: 0, carbs: 0, calories: 0 }
  )

  return (
    <>
      <section style={styles.mealSummaryCard}>
        <div>
          <p style={styles.kicker}>DAILY INTAKE</p>
          <div style={styles.calorieRow}>
            <strong style={styles.calorieValue}>{totals.calories}</strong>
            <span style={styles.calorieUnit}>kcal</span>
          </div>
        </div>
        <div style={styles.macroSummaryGrid}>
          {MACRO_FIELDS.map((field) => (
            <span key={field.key} style={styles.macroSummary}>
              <span style={{ ...styles.macroDot, background: field.color }} />
              {field.shortLabel} {Math.round(totals[field.key])}g
            </span>
          ))}
        </div>
      </section>

      <section style={styles.mealPickerSection}>
        <SectionHeader title="Meals" action={<button type="button" onClick={onAddMeal} style={styles.smallTextButton}>+ Meal</button>} />
        <div style={styles.mealPicker}>
          {meals.map((meal) => (
            <button
              key={meal.id}
              type="button"
              onClick={() => onSelectMeal(meal.id)}
              style={meal.id === activeMeal.id ? { ...styles.mealPickerCard, ...styles.mealPickerCardActive } : styles.mealPickerCard}
            >
              <span style={styles.mealPickerLabel}>{meal.label}</span>
              <span style={styles.mealPickerMeta}>{meal.timeLabel}</span>
              <span style={meal.saved ? styles.savedText : styles.draftText}>{meal.saved ? 'Saved' : 'Draft'}</span>
              <span style={styles.mealPickerMacros}>P{meal.protein} F{meal.fat} C{meal.carbs}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.editorCard}>
        <div style={styles.editorHeader}>
          <div>
            <p style={styles.kicker}>ACTIVE MEAL</p>
            <h2 style={styles.editorTitle}>{activeMeal.label}</h2>
          </div>
          <StatusPill tone={activeMeal.saved ? 'primary' : 'default'}>{activeMeal.saved ? 'Saved' : 'Draft'}</StatusPill>
        </div>

        <label style={styles.inputBlock}>
          <span style={styles.inputLabel}>食べたものメモ</span>
          <textarea
            value={activeMeal.memo}
            onChange={(event) => onUpdateMemo(event.target.value)}
            placeholder="例: 鮭定食。ご飯普通盛り、サラダ追加"
            style={styles.mealTextarea}
          />
        </label>

        <div style={styles.macroInputGrid}>
          {MACRO_FIELDS.map((field) => (
            <label key={field.key} style={styles.macroInputWrap}>
              <span style={{ ...styles.macroInputRail, background: field.color }} />
              <span style={styles.inputLabel}>{field.label}</span>
              <span style={styles.macroInputRow}>
                <input
                  value={activeMeal[field.key] || ''}
                  onChange={(event) => onUpdateMacro(field.key, readNumericInput(event.target.value))}
                  inputMode="decimal"
                  aria-label={`${field.label} grams`}
                  style={styles.numberInput}
                />
                <span style={styles.inputUnit}>g</span>
              </span>
            </label>
          ))}
        </div>

        <div style={styles.editorActions}>
          <ActionButton onClick={onClear}>Clear</ActionButton>
          <ActionButton onClick={onSave} variant="primary">Save Meal</ActionButton>
        </div>
      </section>
    </>
  )
}

function PlanSchedulePanel({
  plan,
  nextPlan,
  selectedDate,
}: {
  plan?: DailyPlan
  nextPlan?: DailyPlan
  selectedDate: string
}) {
  const visiblePlan = plan || nextPlan
  const isSelectedPlan = Boolean(plan)
  const nutritionTotals = visiblePlan?.meals.reduce(
    (sum, meal) => ({
      calories: sum.calories + meal.calories,
      protein: sum.protein + meal.protein,
      fat: sum.fat + meal.fat,
      carbs: sum.carbs + meal.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )
  const macroTotal = nutritionTotals
    ? nutritionTotals.protein + nutritionTotals.fat + nutritionTotals.carbs
    : 0

  if (!visiblePlan) {
    return (
      <section style={styles.planFocusCard}>
        <div style={styles.planFocusHeader}>
          <div>
            <p style={styles.kicker}>DAY PLAN</p>
            <h2 style={styles.planFocusTitle}>{selectedDate}</h2>
          </div>
          <StatusPill>予定なし</StatusPill>
        </div>
      </section>
    )
  }

  return (
    <section style={styles.planFocusCard}>
      <div style={styles.planFocusHeader}>
        <div>
          <p style={styles.kicker}>{isSelectedPlan ? 'DAY PLAN' : 'NEXT UP'}</p>
          <h2 style={styles.planFocusTitle}>{isSelectedPlan ? selectedDate : nextPlan?.date || 'No plan'}</h2>
        </div>
        <StatusPill>{isSelectedPlan ? visiblePlan?.label || 'Plan' : 'Upcoming'}</StatusPill>
      </div>

      <>
        {nutritionTotals ? (
            <div style={styles.planNutritionCard}>
              <div style={styles.planNutritionTop}>
                <span style={styles.planItemLabel}>DAILY NUTRITION</span>
                <strong style={styles.planCalories}>{nutritionTotals.calories} kcal</strong>
              </div>
              <div style={styles.planMacroBar} aria-hidden="true">
                {MACRO_FIELDS.map((field) => {
                  const value = nutritionTotals[field.key]
                  const width = macroTotal > 0 ? (value / macroTotal) * 100 : 0
                  return <span key={field.key} style={{ ...styles.planMacroBarSegment, width: `${width}%`, background: field.color }} />
                })}
              </div>
              <div style={styles.planMacroGrid}>
                {MACRO_FIELDS.map((field) => (
                  <span key={field.key} style={styles.planMacroItem}>
                    <span style={{ ...styles.planMacroDot, background: field.color }} />
                    {field.shortLabel} {nutritionTotals[field.key]}g
                  </span>
                ))}
              </div>
            </div>
        ) : null}
        <div style={styles.planGrid}>
            <div style={styles.planItem}>
              <span style={{ ...styles.planRail, background: COLORS.primary }} />
              <span style={styles.planItemLabel}>TRAINING</span>
              <div style={styles.planRows}>
                {visiblePlan.training.map((item) => (
                  <div key={`${item.name}-${item.sets}`} style={styles.planRow}>
                    <span style={styles.planRowMain}>
                      <strong style={styles.planItemTitle}>{item.name}</strong>
                      <span style={styles.planItemDetail}>{item.target}</span>
                    </span>
                    <span style={styles.planValue}>{item.sets}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.planItem}>
              <span style={{ ...styles.planRail, background: COLORS.primarySoft }} />
              <span style={styles.planItemLabel}>MEAL</span>
              <div style={styles.planRows}>
                {visiblePlan.meals.map((meal) => (
                  <div key={meal.label} style={styles.planRow}>
                    <span style={styles.planRowMain}>
                      <strong style={styles.planItemTitle}>{meal.label}</strong>
                      <span style={styles.planItemDetail}>{meal.calories} kcal</span>
                    </span>
                    <span style={styles.planValue}>P{meal.protein} F{meal.fat} C{meal.carbs}</span>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </>
    </section>
  )
}

function TrainingRetroEditor({
  exercises,
  activeExercise,
  onSelectExercise,
  onAddExercise,
  onAddSet,
  onUpdateSet,
  onCompleteExercise,
}: {
  exercises: TrainingExerciseDraft[]
  activeExercise?: TrainingExerciseDraft
  onSelectExercise: (exerciseName: string) => void
  onAddExercise: () => void
  onAddSet: () => void
  onUpdateSet: (exerciseName: string, setNumber: number, updater: (set: TrainingSetDraft) => TrainingSetDraft) => void
  onCompleteExercise: (exerciseName: string) => void
}) {
  if (!activeExercise) {
    return (
      <section style={styles.editorCard}>
        <SectionHeader title="Training" />
        <p style={styles.emptyText}>この日の種目はまだありません。</p>
        <ActionButton onClick={onAddExercise} variant="primary">＋ Exercise</ActionButton>
      </section>
    )
  }

  const doneCount = activeExercise.sets.filter((set) => set.done).length

  return (
    <>
      <section style={styles.exercisePickerSection}>
        <SectionHeader title="Exercises" action={<button type="button" onClick={onAddExercise} style={styles.smallTextButton}>＋ Exercise</button>} />
        <div style={styles.exerciseStack}>
          {exercises.map((exercise) => {
            const exerciseDone = exercise.sets.filter((set) => set.done).length
            const isActive = exercise.name === activeExercise.name
            return (
              <button
                key={exercise.name}
                type="button"
                onClick={() => onSelectExercise(exercise.name)}
                style={isActive ? { ...styles.exerciseCard, ...styles.exerciseCardActive } : styles.exerciseCard}
              >
                <span>
                  <strong style={styles.exerciseName}>{exercise.name}</strong>
                  <span style={styles.exerciseTarget}>{exercise.target}</span>
                </span>
                <StatusPill>{exerciseDone}/{exercise.sets.length}</StatusPill>
              </button>
            )
          })}
        </div>
        <div style={styles.addExerciseAction}>
          <ActionButton onClick={onAddExercise}>＋ 種目を追加</ActionButton>
        </div>
      </section>

      <section style={styles.editorCard}>
        <div style={styles.editorHeader}>
          <div>
            <p style={styles.kicker}>SET LOG</p>
            <h2 style={styles.editorTitle}>{activeExercise.name}</h2>
            <p style={styles.editorSubtitle}>{activeExercise.target}</p>
          </div>
          <StatusPill>{doneCount}/{activeExercise.sets.length}</StatusPill>
        </div>

        <div style={styles.setHeaderRow}>
          <span>SET</span>
          <span>PLAN</span>
          <span>ACTUAL</span>
          <span>DONE</span>
        </div>

        <div style={styles.setStack}>
          {activeExercise.sets.map((set) => (
            <div key={set.set} style={set.done ? { ...styles.setRow, ...styles.setRowDone } : styles.setRow}>
              <span style={styles.setIndex}>{set.set}</span>
              <span style={styles.setPlanValue}>{set.planWeight}kg × {set.planReps}</span>
              <span style={styles.actualInputs}>
                <input
                  value={set.actualWeight || ''}
                  onChange={(event) => onUpdateSet(activeExercise.name, set.set, (item) => ({ ...item, actualWeight: readNumericInput(event.target.value) }))}
                  inputMode="decimal"
                  aria-label={`Set ${set.set} weight`}
                  style={styles.setInput}
                />
                <span style={styles.inputTimes}>×</span>
                <input
                  value={set.actualReps || ''}
                  onChange={(event) => onUpdateSet(activeExercise.name, set.set, (item) => ({ ...item, actualReps: readNumericInput(event.target.value) }))}
                  inputMode="numeric"
                  aria-label={`Set ${set.set} reps`}
                  style={styles.setInputSmall}
                />
              </span>
              <button
                type="button"
                onClick={() => onUpdateSet(activeExercise.name, set.set, (item) => ({ ...item, done: !item.done }))}
                style={set.done ? styles.setCheckDone : styles.setCheck}
                aria-label={`Set ${set.set} 完了`}
              >
                ✓
              </button>
            </div>
          ))}
        </div>

        <div style={styles.editorActions}>
          <ActionButton onClick={onAddSet}>＋ Set</ActionButton>
          <ActionButton variant="primary" onClick={() => onCompleteExercise(activeExercise.name)}>
            Complete
          </ActionButton>
        </div>
      </section>
    </>
  )
}

const styles: { [key: string]: CSSProperties } = {
  kicker: {
    margin: 0,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  monthCard: {
    padding: 16,
    borderRadius: 24,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 20px 48px rgba(0,0,0,0.35)',
  },
  monthHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitle: {
    margin: '3px 0 0',
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 1.1,
    letterSpacing: 0,
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 6,
    marginBottom: 6,
  },
  weekday: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 900,
    textAlign: 'center',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 6,
  },
  dayCell: {
    position: 'relative',
    minWidth: 0,
    aspectRatio: '1 / 1',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  dayCellMuted: {
    color: COLORS.textMuted,
    opacity: 0.42,
  },
  dayCellSelected: {
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}`,
    boxShadow: '0 0 0 1px rgba(255,107,44,0.16)',
  },
  dayCellToday: {
    border: `1px solid ${COLORS.primarySoft}`,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 900,
  },
  dayPlanMarker: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: COLORS.primarySoft,
    fontSize: 7,
    lineHeight: 1,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  dayDots: {
    display: 'flex',
    gap: 3,
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    boxSizing: 'border-box',
  },
  planFocusCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 18px 42px rgba(0,0,0,0.28)',
  },
  todayInputCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 18px 42px rgba(0,0,0,0.28)',
  },
  planFocusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  planFocusTitle: {
    margin: '4px 0 0',
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 1.1,
    letterSpacing: 0,
  },
  planNutritionCard: {
    padding: 12,
    borderRadius: 18,
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    marginBottom: 10,
  },
  planNutritionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  planCalories: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,
  },
  planMacroBar: {
    height: 8,
    marginTop: 10,
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    overflow: 'hidden',
    display: 'flex',
  },
  planMacroBarSegment: {
    height: '100%',
    display: 'block',
  },
  planMacroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 6,
    marginTop: 10,
  },
  planMacroItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minWidth: 0,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  planMacroDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    flex: '0 0 auto',
  },
  planGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 10,
  },
  planItem: {
    position: 'relative',
    minWidth: 0,
    padding: '12px 11px 12px 13px',
    borderRadius: 18,
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    display: 'grid',
    gap: 5,
    overflow: 'hidden',
  },
  planRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  planItemLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.08em',
  },
  planItemTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 1.15,
    fontWeight: 900,
  },
  planItemDetail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 1.35,
    fontWeight: 700,
  },
  planRows: {
    display: 'grid',
    gap: 8,
  },
  planRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 8,
    alignItems: 'center',
    padding: '8px 0',
    borderTop: `1px solid ${COLORS.border}`,
  },
  planRowMain: {
    minWidth: 0,
    display: 'grid',
    gap: 2,
  },
  setPlanValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 1.2,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  todayInputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginTop: 10,
  },
  todayInputItem: {
    position: 'relative',
    minWidth: 0,
    padding: '12px 11px 12px 13px',
    borderRadius: 18,
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    display: 'grid',
    gap: 8,
    overflow: 'hidden',
  },
  modeSwitch: {
    marginTop: 14,
    marginBottom: 14,
  },
  subModeSwitch: {
    marginBottom: 14,
  },
  mealSummaryCard: {
    padding: 16,
    borderRadius: 22,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'center',
  },
  calorieRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 5,
  },
  calorieValue: {
    color: COLORS.textPrimary,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,
  },
  calorieUnit: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
  },
  macroSummaryGrid: {
    display: 'grid',
    gap: 6,
  },
  macroSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
  },
  macroDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  mealPickerSection: {
    marginTop: 16,
  },
  mealPicker: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '138px',
    gap: 10,
    overflowX: 'auto',
    paddingBottom: 2,
    scrollbarWidth: 'none',
  },
  mealPickerCard: {
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    padding: 12,
    textAlign: 'left',
    display: 'grid',
    gap: 5,
    cursor: 'pointer',
  },
  mealPickerCardActive: {
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}66`,
  },
  mealPickerLabel: {
    fontSize: 13,
    fontWeight: 900,
  },
  mealPickerMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 800,
  },
  mealPickerMacros: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 800,
  },
  savedText: {
    color: COLORS.primarySoft,
    fontSize: 11,
    fontWeight: 900,
  },
  draftText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 900,
  },
  smallTextButton: {
    border: 0,
    background: 'transparent',
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 900,
    cursor: 'pointer',
  },
  editorCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
  },
  bodyHydrationCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    gap: 12,
  },
  bodyHydrationGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  compactInputWrap: {
    display: 'grid',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
  },
  compactInputRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 5,
  },
  compactNumberInput: {
    minWidth: 0,
    width: '100%',
    border: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 900,
    outline: 'none',
    fontFamily: 'inherit',
  },
  waterQuickActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  quickWaterButton: {
    height: 34,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 999,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  editorTitle: {
    margin: '4px 0 0',
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 1.1,
    letterSpacing: 0,
  },
  editorSubtitle: {
    margin: '4px 0 0',
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
  },
  inputBlock: {
    display: 'grid',
    gap: 8,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  mealTextarea: {
    minHeight: 90,
    resize: 'vertical',
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 18,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    padding: 12,
    font: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  macroInputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 9,
    marginTop: 12,
  },
  macroInputWrap: {
    position: 'relative',
    display: 'grid',
    gap: 8,
    padding: '12px 10px 10px',
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    overflow: 'hidden',
  },
  macroInputRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  macroInputRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  numberInput: {
    minWidth: 0,
    width: '100%',
    border: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 900,
    outline: 'none',
  },
  inputUnit: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 900,
  },
  editorActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 14,
  },
  exercisePickerSection: {
    marginTop: 4,
  },
  exerciseStack: {
    display: 'grid',
    gap: 10,
  },
  addExerciseAction: {
    marginTop: 10,
    display: 'grid',
  },
  exerciseCard: {
    width: '100%',
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    padding: 13,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    cursor: 'pointer',
  },
  exerciseCardActive: {
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}66`,
  },
  exerciseName: {
    display: 'block',
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 900,
    lineHeight: 1.15,
  },
  exerciseTarget: {
    display: 'block',
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
    marginTop: 4,
  },
  setHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '42px 82px 1fr 44px',
    gap: 8,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '0 4px 7px',
  },
  setStack: {
    display: 'grid',
    gap: 8,
  },
  setRow: {
    display: 'grid',
    gridTemplateColumns: '42px 82px 1fr 44px',
    gap: 8,
    alignItems: 'center',
    minHeight: 58,
    padding: '8px 4px',
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
  },
  setRowDone: {
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}44`,
  },
  setIndex: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 900,
  },
  planValue: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
  },
  actualInputs: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  setInput: {
    width: 48,
    border: 0,
    borderRadius: 10,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    padding: '8px 6px',
    fontSize: 13,
    fontWeight: 900,
    outline: 'none',
    boxSizing: 'border-box',
  },
  setInputSmall: {
    width: 36,
    border: 0,
    borderRadius: 10,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    padding: '8px 6px',
    fontSize: 13,
    fontWeight: 900,
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputTimes: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 900,
  },
  setCheck: {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: 900,
    cursor: 'pointer',
  },
  setCheckDone: {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: `1px solid ${COLORS.primary}`,
    background: COLORS.primary,
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: 900,
    cursor: 'pointer',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 700,
    margin: '0 0 12px',
  },
  noteCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
  },
  noteTextarea: {
    width: '100%',
    minHeight: 96,
    resize: 'vertical',
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 18,
    background: COLORS.background,
    color: COLORS.textPrimary,
    padding: 12,
    font: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
}

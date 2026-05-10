import { useId, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { AppHeader, MoreDots } from '../ui/AppHeader'
import { AppMain } from '../ui/AppMain'
import { AppShell } from '../ui/AppShell'
import { CardHeader } from '../ui/CardHeader'
import { IconButton } from '../ui/IconButton'
import { MetricChip } from '../ui/MetricChip'
import { SegmentedControl } from '../ui/SegmentedControl'
import { SurfaceCard } from '../ui/SurfaceCard'
import { COLORS } from '../ui/tokens'
import { bodyTimeline, nutritionTimeline, trainingTimeline } from '../mocks/healthDataReviewMock'
import type { TrainingDay, TrainingSet } from '../mocks/healthDataReviewMock'

type ExerciseHistoryItem = {
  date: string
  oneRm: number
  plannedOneRm: number
  targetOneRm: number
  maxWeight: number
  totalVolume: number
  setCount: number
}

type ExerciseHistory = {
  name: string
  history: ExerciseHistoryItem[]
  maxOneRm: number
  plannedOneRm: number
  targetOneRm: number
  maxWeight: number
  totalVolume: number
  totalSets: number
}

const TAB_SET = ['身体指標', '食事', 'トレーニング'] as const
type TabKey = (typeof TAB_SET)[number]
const PERIOD_OPTIONS = [7, 12, 30, 90] as const
type PeriodKey = (typeof PERIOD_OPTIONS)[number]
type DisplaySettings = { plan: boolean; target: boolean }
type DisplaySettingKey = keyof DisplaySettings

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = { plan: true, target: true }
const DEFAULT_SELECTED_EXERCISES = ['Bench Press', 'Squat', 'Deadlift']

function calcOneRm(set: TrainingSet) {
  return set.weight * (1 + set.reps / 30)
}

function buildExerciseHistory(logs: TrainingDay[]) {
  const map = new Map<string, ExerciseHistory>()

  logs.forEach((day) => {
    day.exercises.forEach((exercise) => {
      const oneRms = exercise.sets.map(calcOneRm)
      const maxWeight = Math.max(...exercise.sets.map((set) => set.weight))
      const totalVolume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0)
      const entry: ExerciseHistoryItem = {
        date: day.date,
        oneRm: Math.max(...oneRms),
        plannedOneRm: exercise.plannedOneRm,
        targetOneRm: exercise.targetOneRm,
        maxWeight,
        totalVolume,
        setCount: exercise.sets.length,
      }
      const current = map.get(exercise.name)
      if (current) {
        current.history.push(entry)
        current.maxOneRm = Math.max(current.maxOneRm, entry.oneRm)
        current.plannedOneRm = entry.plannedOneRm
        current.targetOneRm = entry.targetOneRm
        current.maxWeight = Math.max(current.maxWeight, entry.maxWeight)
        current.totalVolume += totalVolume
        current.totalSets += exercise.sets.length
      } else {
        map.set(exercise.name, {
          name: exercise.name,
          history: [entry],
          maxOneRm: entry.oneRm,
          plannedOneRm: entry.plannedOneRm,
          targetOneRm: entry.targetOneRm,
          maxWeight: entry.maxWeight,
          totalVolume,
          totalSets: exercise.sets.length,
        })
      }
    })
  })

  return Array.from(map.values()).sort((a, b) => b.maxOneRm - a.maxOneRm)
}

function calcDelta(current: number, previous?: number) {
  if (previous == null) return '—'
  const delta = current - previous
  if (!Number.isFinite(delta)) return '—'
  const prefix = delta > 0 ? '+' : ''
  return `${prefix}${delta.toFixed(1)}`
}

function formatSigned(value: number, unit = '') {
  if (Math.abs(value) < 0.05) return `±0.0${unit}`
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}${unit}`
}

function formatValue(value: number, unit = '', digits = 1) {
  if (unit === 'kcal' || unit === 'g') return `${Math.round(value)} ${unit}`
  if (!unit) return value.toFixed(digits)
  return `${value.toFixed(digits)} ${unit}`
}

function comparisonText({
  actual,
  plan,
  target,
  unit,
  settings,
  digits = 1,
}: {
  actual: number
  plan: number
  target: number
  unit: string
  settings: DisplaySettings
  digits?: number
}) {
  const parts: string[] = []
  if (settings.plan) parts.push(`計画比 ${formatSigned(actual - plan, unit)}`)
  if (settings.target) parts.push(`目標 ${formatValue(target, unit, digits)}`)
  return parts.length > 0 ? parts.join(' / ') : '実績のみ'
}

function getOneRmProgress(exercise: ExerciseHistory) {
  const first = exercise.history[0]?.oneRm ?? 0
  const latest = exercise.history[exercise.history.length - 1]?.oneRm ?? first
  const delta = latest - first
  const percent = first > 0 ? (delta / first) * 100 : 0

  if (delta > 0.25) {
    return {
      first,
      latest,
      delta,
      percent,
      status: '伸びてる',
      tone: COLORS.success,
      note: '推定MAX RMが前進',
    }
  }

  if (delta < -0.25) {
    return {
      first,
      latest,
      delta,
      percent,
      status: '要確認',
      tone: COLORS.healthRed,
      note: '疲労やフォームを確認',
    }
  }

  return {
    first,
    latest,
    delta,
    percent,
    status: '維持',
    tone: COLORS.textSecondary,
    note: '同水準をキープ',
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function makeTrendPath(values: number[], width: number, height: number, minValue?: number, maxValue?: number) {
  if (values.length === 0) return ''
  const min = clamp(minValue ?? Math.min(...values), -1e9, 1e9)
  const max = maxValue ?? Math.max(...values)
  const range = Math.max(1, max - min)
  const paddedWidth = Math.max(1, width - 56)
  const paddedHeight = Math.max(1, height - 28)
  return values
    .map((value, index) => {
      const x = 28 + (values.length === 1 ? 0 : (paddedWidth / (values.length - 1)) * index)
      const y = 14 + ((max - value) / range) * paddedHeight
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function makeTrendAreaPath(points: Array<{ x: number; y: number }>, height: number) {
  if (points.length < 2) return ''

  const baseline = height - 14
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ')
  const first = points[0]
  const last = points[points.length - 1]

  return `${linePath} L ${last.x.toFixed(1)} ${baseline.toFixed(1)} L ${first.x.toFixed(1)} ${baseline.toFixed(1)} Z`
}

function getTrendDomain(values: number[]) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = Math.max(1, max - min)

  return {
    min: min - spread * 0.24,
    max: max + spread * 0.18,
  }
}

function makeTrendPoints(values: number[], width: number, height: number, minValue?: number, maxValue?: number) {
  const min = clamp(minValue ?? Math.min(...values), -1e9, 1e9)
  const max = maxValue ?? Math.max(...values)
  const range = Math.max(1, max - min)
  const paddedWidth = Math.max(1, width - 56)
  const paddedHeight = Math.max(1, height - 28)

  return values.map((value, index) => {
    const x = 28 + (values.length === 1 ? 0 : (paddedWidth / (values.length - 1)) * index)
    const y = 14 + ((max - value) / range) * paddedHeight
    return { x, y, value }
  })
}

export default function HealthDataReviewPage() {
  const [period, setPeriod] = useState<PeriodKey>(12)
  const [activeTab, setActiveTab] = useState<TabKey>('身体指標')
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS)
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState<string[]>(DEFAULT_SELECTED_EXERCISES)

  const visibleBody = useMemo(() => bodyTimeline.slice(-period), [period])
  const visibleNutrition = useMemo(() => nutritionTimeline.slice(-period), [period])
  const visibleTraining = useMemo(() => trainingTimeline.slice(-period), [period])
  const exerciseHistory = useMemo(() => buildExerciseHistory(visibleTraining), [visibleTraining])
  const currentBody = visibleBody[visibleBody.length - 1]

  function toggleDisplaySetting(key: DisplaySettingKey) {
    setDisplaySettings((current) => ({ ...current, [key]: !current[key] }))
  }

  function toggleExercise(name: string) {
    setSelectedExercises((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    )
  }

  return (
    <AppShell phoneStyle={styles.phoneFrame}>
      <AppHeader
        title="データ確認"
        subtitle="身体・食事・トレーニング"
        left={<IconButton to="/" ariaLabel="ホームへ戻る">‹</IconButton>}
        right={
          <button
            type="button"
            aria-label="表示設定"
            aria-expanded={isDisplaySettingsOpen}
            onClick={() => setIsDisplaySettingsOpen((current) => !current)}
            style={{
              ...styles.headerMenuButton,
              ...(isDisplaySettingsOpen ? styles.headerMenuButtonActive : undefined),
            }}
          >
            <MoreDots />
          </button>
        }
      />
        <AppMain withBottomNav style={styles.main}>
          <SegmentedControl
            items={TAB_SET}
            value={activeTab}
            onChange={setActiveTab}
            ariaLabel="データカテゴリ"
            style={styles.tabWrap}
          />
          <section style={styles.periodBar}>
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                style={{
                  ...styles.periodButton,
                  ...(period === option ? styles.periodButtonActive : styles.periodButtonIdle),
                }}
              >
                {option}日
              </button>
            ))}
          </section>
          {isDisplaySettingsOpen ? (
            <DisplaySettingsPanel settings={displaySettings} onToggle={toggleDisplaySetting} />
          ) : null}
          {activeTab === '身体指標' ? (
            <BodySection
              data={visibleBody}
              current={currentBody}
              displaySettings={displaySettings}
            />
          ) : activeTab === '食事' ? (
            <NutritionSection data={visibleNutrition} displaySettings={displaySettings} />
          ) : (
            <TrainingSection
              logs={visibleTraining}
              exerciseSummary={exerciseHistory}
              displaySettings={displaySettings}
              selectedExercises={selectedExercises}
              onToggleExercise={toggleExercise}
            />
          )}
        </AppMain>
    </AppShell>
  )
}

function DisplaySettingsPanel({
  settings,
  onToggle,
}: {
  settings: DisplaySettings
  onToggle: (key: DisplaySettingKey) => void
}) {
  return (
    <div style={styles.displaySettingsPanel}>
      <SurfaceCard>
        <CardHeader>表示設定</CardHeader>
        <div style={styles.checkboxGrid}>
          <CheckboxChip
            label="計画"
            description="日ごとの予定ラインを表示"
            checked={settings.plan}
            onChange={() => onToggle('plan')}
          />
          <CheckboxChip
            label="目標"
            description="期間のゴール値を表示"
            checked={settings.target}
            onChange={() => onToggle('target')}
          />
        </div>
      </SurfaceCard>
    </div>
  )
}

function CheckboxChip({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label style={{ ...styles.checkboxChip, ...(checked ? styles.checkboxChipActive : undefined) }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={styles.checkboxInput} />
      <span style={styles.checkboxText}>
        <span style={styles.checkboxLabel}>{label}</span>
        {description ? <span style={styles.checkboxDescription}>{description}</span> : null}
      </span>
    </label>
  )
}

function BodySection({
  data,
  current,
  displaySettings,
}: {
  data: typeof bodyTimeline
  current: (typeof bodyTimeline)[number]
  displaySettings: DisplaySettings
}) {
  if (!current) return null

  const bodySummary = [
    { label: '体重', actual: current.weight, plan: current.plan.weight, target: current.target.weight, unit: 'kg', color: COLORS.healthRed },
    { label: '体脂肪率', actual: current.fat, plan: current.plan.fat, target: current.target.fat, unit: '%', color: COLORS.healthPurple },
    { label: 'BMI', actual: current.bmi, plan: current.plan.bmi, target: current.target.bmi, unit: '', color: COLORS.healthGreen },
    { label: 'ウエスト', actual: current.waist, plan: current.plan.waist, target: current.target.waist, unit: 'cm', color: COLORS.healthOrange },
  ]

  const dates = data.map((item) => item.date)

  return (
    <div style={styles.sectionColumn}>
      <SurfaceCard>
        <CardHeader>最新の身体指標</CardHeader>
        <div style={styles.summaryGrid}>
          {bodySummary.map((item) => (
            <MetricChip
              key={item.label}
              label={item.label}
              value={formatValue(item.actual, item.unit)}
              delta={comparisonText({
                actual: item.actual,
                plan: item.plan,
                target: item.target,
                unit: item.unit,
                settings: displaySettings,
              })}
              color={item.color}
            />
          ))}
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <CardHeader>体重推移</CardHeader>
        <TrendLine
          values={data.map((item) => item.weight)}
          labels={dates}
          unit="kg"
          color={COLORS.healthRed}
          chartHeight={92}
          showRange
          planValues={displaySettings.plan ? data.map((item) => item.plan.weight) : undefined}
          targetValue={displaySettings.target ? current.target.weight : undefined}
        />
      </SurfaceCard>
      <SurfaceCard>
        <CardHeader>体脂肪率推移</CardHeader>
        <TrendLine
          values={data.map((item) => item.fat)}
          labels={dates}
          unit="%"
          color={COLORS.healthPurple}
          chartHeight={92}
          showRange
          planValues={displaySettings.plan ? data.map((item) => item.plan.fat) : undefined}
          targetValue={displaySettings.target ? current.target.fat : undefined}
        />
      </SurfaceCard>
      <SurfaceCard>
        <CardHeader>BMI / ウエスト推移</CardHeader>
        <TrendLine
          values={data.map((item) => item.bmi)}
          labels={dates}
          unit=""
          color={COLORS.healthGreen}
          chartHeight={84}
          showRange
          planValues={displaySettings.plan ? data.map((item) => item.plan.bmi) : undefined}
          targetValue={displaySettings.target ? current.target.bmi : undefined}
        />
        <div style={{ ...styles.rowSpace, marginTop: 10 }}>
          <TrendLine
            values={data.map((item) => item.waist)}
            labels={dates}
            unit="cm"
            color={COLORS.healthOrange}
            chartHeight={84}
            showRange
            planValues={displaySettings.plan ? data.map((item) => item.plan.waist) : undefined}
            targetValue={displaySettings.target ? current.target.waist : undefined}
          />
        </div>
      </SurfaceCard>
    </div>
  )
}

function NutritionSection({ data, displaySettings }: { data: typeof nutritionTimeline; displaySettings: DisplaySettings }) {
  const calories = data.map((item) => item.calories)
  const water = data.map((item) => item.water)
  const latest = data[data.length - 1]
  const avg = Math.round((calories.reduce((sum, item) => sum + item, 0) / calories.length) * 10) / 10
  const totalWater = data.reduce((sum, item) => sum + item.water, 0)

  return (
    <div style={styles.sectionColumn}>
      <SurfaceCard>
        <CardHeader>最新の食事入力</CardHeader>
        <div style={styles.summaryGrid}>
          <MetricChip
            label="摂取カロリー"
            value={`${latest?.calories ?? 0} kcal`}
            delta={
              latest
                ? comparisonText({
                    actual: latest.calories,
                    plan: latest.plan.calories,
                    target: latest.target.calories,
                    unit: 'kcal',
                    settings: displaySettings,
                    digits: 0,
                  })
                : `avg ${avg} kcal`
            }
          />
          <MetricChip
            label="水分"
            value={`${latest?.water ?? 0} L`}
            delta={
              latest
                ? comparisonText({
                    actual: latest.water,
                    plan: latest.plan.water,
                    target: latest.target.water,
                    unit: 'L',
                    settings: displaySettings,
                  })
                : `7日合計 ${totalWater.toFixed(1)} L`
            }
            color={COLORS.healthBlue}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <CardHeader>摂取カロリー時系列</CardHeader>
        <TrendLine
          values={calories}
          labels={data.map((item) => item.date)}
          unit="kcal"
          color={COLORS.healthOrange}
          chartHeight={90}
          showRange
          planValues={displaySettings.plan ? data.map((item) => item.plan.calories) : undefined}
          targetValue={displaySettings.target ? latest?.target.calories : undefined}
        />
      </SurfaceCard>

      <SurfaceCard>
        <CardHeader>水分摂取トレンド</CardHeader>
        <TrendLine
          values={water}
          labels={data.map((item) => item.date)}
          unit="L"
          color={COLORS.healthBlue}
          chartHeight={76}
          showRange
          planValues={displaySettings.plan ? data.map((item) => item.plan.water) : undefined}
          targetValue={displaySettings.target ? latest?.target.water : undefined}
        />
      </SurfaceCard>
    </div>
  )
}

function ExerciseSelectorPanel({
  exerciseSummary,
  selectedExercises,
  isOpen,
  onToggleOpen,
  onToggleExercise,
}: {
  exerciseSummary: ExerciseHistory[]
  selectedExercises: string[]
  isOpen: boolean
  onToggleOpen: () => void
  onToggleExercise: (name: string) => void
}) {
  const selectedNames = exerciseSummary
    .filter((exercise) => selectedExercises.includes(exercise.name))
    .map((exercise) => exercise.name)

  return (
    <SurfaceCard>
      <div style={styles.exerciseSelectorHeader}>
        <div style={styles.exerciseSelectorCopy}>
          <div style={styles.exerciseSelectorTitle}>種目別データ</div>
          <div style={styles.exerciseSelectorMeta}>
            {selectedNames.length}/{exerciseSummary.length} 種目
            {selectedNames.length > 0 ? ` ・ ${selectedNames.join(' / ')}` : ' ・ 未選択'}
          </div>
        </div>
        <button
          type="button"
          aria-label="表示する種目を選択"
          aria-expanded={isOpen}
          onClick={onToggleOpen}
          style={{ ...styles.exerciseSelectorButton, ...(isOpen ? styles.exerciseSelectorButtonActive : undefined) }}
        >
          <MoreDots />
        </button>
      </div>
      {isOpen ? (
        <div style={styles.exerciseFilterGrid}>
          {exerciseSummary.map((exercise) => (
            <CheckboxChip
              key={exercise.name}
              label={exercise.name}
              description={`BEST ${exercise.maxOneRm.toFixed(1)}kg`}
              checked={selectedExercises.includes(exercise.name)}
              onChange={() => onToggleExercise(exercise.name)}
            />
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  )
}

function TrainingSection({
  logs,
  exerciseSummary,
  displaySettings,
  selectedExercises,
  onToggleExercise,
}: {
  logs: TrainingDay[]
  exerciseSummary: ExerciseHistory[]
  displaySettings: DisplaySettings
  selectedExercises: string[]
  onToggleExercise: (name: string) => void
}) {
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false)
  const calories = logs.map((item) => item.burnedCalories)
  const rmProgress = exerciseSummary.map((exercise) => ({
    exercise,
    progress: getOneRmProgress(exercise),
  }))
  const visibleProgress = rmProgress.filter((item) => selectedExercises.includes(item.exercise.name))
  const latestDay = logs[logs.length - 1]

  return (
    <div style={styles.sectionColumn}>
      <SurfaceCard>
        <CardHeader>消費カロリー時系列</CardHeader>
        <TrendLine
          values={calories}
          labels={logs.map((item) => item.date)}
          unit="kcal"
          color={COLORS.healthYellow}
          chartHeight={90}
          showRange
          planValues={displaySettings.plan ? logs.map((item) => item.plannedCalories) : undefined}
          targetValue={displaySettings.target ? latestDay?.targetCalories : undefined}
        />
      </SurfaceCard>

      <ExerciseSelectorPanel
        exerciseSummary={exerciseSummary}
        selectedExercises={selectedExercises}
        isOpen={isExerciseSelectorOpen}
        onToggleOpen={() => setIsExerciseSelectorOpen((current) => !current)}
        onToggleExercise={onToggleExercise}
      />

      {visibleProgress.length === 0 ? (
        <SurfaceCard>
          <CardHeader>種目別データ</CardHeader>
          <div style={styles.emptyState}>表示したい種目にチェックを入れてください。</div>
        </SurfaceCard>
      ) : null}

      {visibleProgress.map(({ exercise, progress }) => (
        <section key={exercise.name} style={styles.trainingCard}>
          <div style={styles.trainingHeader}>
            <div style={styles.trainingTitle}>{exercise.name}</div>
            <div
              style={{
                ...styles.rmStatusBadge,
                borderColor: `${progress.tone}55`,
                background: `${progress.tone}1F`,
                color: progress.tone,
              }}
            >
              {progress.status}
            </div>
          </div>
          <div style={styles.rmHero}>
            <div style={styles.rmHeroTop}>
              <div>
                <div style={styles.rmKicker}>推定MAX RM</div>
                <div style={styles.rmValueRow}>
                  <span style={styles.rmValue}>{progress.latest.toFixed(1)} kg</span>
                  <span style={{ ...styles.rmDelta, color: progress.tone }}>
                    {formatSigned(progress.delta, 'kg')} / {formatSigned(progress.percent, '%')}
                  </span>
                </div>
              </div>
              <div style={styles.rmHistoryCount}>履歴 {exercise.history.length}日</div>
            </div>
            <div style={styles.rmMeta}>
              {progress.note}。開始 {progress.first.toFixed(1)}kg → 最新 {progress.latest.toFixed(1)}kg
              {displaySettings.plan ? ` / 計画 ${exercise.plannedOneRm.toFixed(1)}kg` : ''}
              {displaySettings.target ? ` / 目標 ${exercise.targetOneRm.toFixed(1)}kg` : ''}
            </div>
          </div>
          <div style={styles.trainingStatGrid}>
            <div style={styles.trainingStat}>
              <div style={styles.trainingStatLabel}>BEST RM</div>
              <div style={styles.trainingStatValue}>{exercise.maxOneRm.toFixed(1)} kg</div>
            </div>
            <div style={styles.trainingStat}>
              <div style={styles.trainingStatLabel}>MAX重量</div>
              <div style={styles.trainingStatValue}>{exercise.maxWeight.toFixed(1)} kg</div>
            </div>
            <div style={styles.trainingStat}>
              <div style={styles.trainingStatLabel}>総ボリューム</div>
              <div style={styles.trainingStatValue}>{Math.round(exercise.totalVolume)} kg</div>
            </div>
            <div style={styles.trainingStat}>
              <div style={styles.trainingStatLabel}>総セット数</div>
              <div style={styles.trainingStatValue}>{exercise.totalSets}</div>
            </div>
          </div>
          <div style={styles.subCardTitle}>推定MAX RM推移</div>
          <TrendLine
            values={exercise.history.map((item) => item.oneRm)}
            labels={exercise.history.map((item) => item.date)}
            unit="kg"
            color={COLORS.healthPurple}
            chartHeight={72}
            showRange={false}
            planValues={displaySettings.plan ? exercise.history.map((item) => item.plannedOneRm) : undefined}
            targetValue={displaySettings.target ? exercise.targetOneRm : undefined}
          />
          <div style={styles.sessionRows}>
            {exercise.history.map((entry) => {
              const entryDelta = entry.oneRm - progress.first
              const entryTone =
                entryDelta > 0.25 ? COLORS.success : entryDelta < -0.25 ? COLORS.healthRed : COLORS.textSecondary
              const comparisonLabel = displaySettings.plan
                ? `計画比 ${formatSigned(entry.oneRm - entry.plannedOneRm, 'kg')}`
                : formatSigned(entryDelta, 'kg')

              return (
                <div key={`${exercise.name}-${entry.date}`} style={styles.sessionRow}>
                  <span style={styles.sessionDate}>{entry.date}</span>
                  <span style={styles.sessionText}>RM {entry.oneRm.toFixed(1)} kg</span>
                  <span style={{ ...styles.sessionText, color: entryTone }}>{comparisonLabel}</span>
                  <span style={styles.sessionText}>Sets×Vol {entry.setCount} / {Math.round(entry.totalVolume)}kg</span>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function TrendLine({
  values,
  labels,
  unit,
  color,
  chartHeight,
  showRange,
  planValues,
  targetValue,
}: {
  values: number[]
  labels: string[]
  unit: string
  color: string
  chartHeight: number
  showRange: boolean
  planValues?: number[]
  targetValue?: number
}) {
  const gradientId = useId().replace(/:/g, '')
  const width = 320
  const domainValues = [...values, ...(planValues ?? []), ...(targetValue != null ? [targetValue] : [])]
  const domain = getTrendDomain(domainValues)
  const path = makeTrendPath(values, width, chartHeight, domain.min, domain.max)
  const points = makeTrendPoints(values, width, chartHeight, domain.min, domain.max)
  const areaPath = makeTrendAreaPath(points, chartHeight)
  const planPath =
    planValues && planValues.length >= 2 ? makeTrendPath(planValues, width, chartHeight, domain.min, domain.max) : ''
  const targetY =
    targetValue != null ? makeTrendPoints([targetValue], width, chartHeight, domain.min, domain.max)[0]?.y : undefined
  const latest = values[values.length - 1] ?? 0
  const previous = values[values.length - 2]
  const rangeText = showRange ? `${Math.min(...values).toFixed(1)}〜${Math.max(...values).toFixed(1)}${unit}` : ''
  const isDown = previous != null && latest < previous
  const labelMiddle = Math.floor((labels.length - 1) / 2)

  return (
    <div style={styles.trendContainer}>
      <div style={styles.trendHeader}>
        <span style={styles.trendValue}>
          {latest.toFixed(1)}
          {unit}
        </span>
        <span style={{ ...styles.trendDelta, color: isDown ? COLORS.success : color }}>
          {calcDelta(latest, previous)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} style={{ ...styles.chartSvg, height: chartHeight }}>
        <defs>
          <linearGradient id={`${gradientId}-area`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.33, 0.66, 1].map((ratio) => {
          const y = 14 + (chartHeight - 28) * ratio

          return (
            <line
              key={ratio}
              x1={28}
              y1={y}
              x2={width - 28}
              y2={y}
              stroke={COLORS.borderStrong}
              strokeWidth="1"
              strokeDasharray="2 6"
              strokeLinecap="round"
              opacity="0.8"
            />
          )
        })}
        {targetY != null ? (
          <line
            x1={28}
            y1={targetY}
            x2={width - 28}
            y2={targetY}
            stroke={COLORS.primary}
            strokeWidth="2"
            strokeDasharray="6 8"
            strokeLinecap="round"
            opacity="0.72"
          />
        ) : null}
        {areaPath ? <path d={areaPath} fill={`url(#${gradientId}-area)`} /> : null}
        {planPath ? (
          <path
            d={planPath}
            fill="none"
            stroke={COLORS.textSecondary}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="4 7"
            opacity="0.72"
          />
        ) : null}
        {points.length >= 2 ? (
          <path d={path} fill="none" stroke={color} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
        ) : null}
        {points.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}-${index}`}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 4 : 2.4}
            fill={index === points.length - 1 ? color : COLORS.surfaceRaised}
            stroke={color}
            strokeWidth={index === points.length - 1 ? '2.4' : '1.8'}
          />
        ))}
      </svg>
      <div style={{ ...styles.chartFooter, gridTemplateColumns: `repeat(${Math.max(labels.length, 1)}, 1fr)` }}>
        {labels.map((label, index) => (
          <span key={label + index} style={styles.chartTick}>
            {index === 0 || index === labelMiddle || index === labels.length - 1 ? label : ''}
          </span>
        ))}
      </div>
      {planPath || targetY != null ? (
        <div style={styles.trendLegend}>
          {planPath ? (
            <span style={styles.trendLegendItem}>
              <span style={{ ...styles.trendLegendLine, background: COLORS.textSecondary }} />計画
            </span>
          ) : null}
          {targetY != null ? (
            <span style={styles.trendLegendItem}>
              <span style={{ ...styles.trendLegendLine, background: COLORS.primary }} />目標
            </span>
          ) : null}
        </div>
      ) : null}
      {showRange ? <div style={styles.chartRange}>{rangeText}</div> : null}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  phoneFrame: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 34,
  },
  headerMenuButton: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  headerMenuButtonActive: {
    border: '1px solid rgba(255,107,44,0.36)',
    background: 'rgba(255,107,44,0.12)',
    color: COLORS.primary,
  },
  page: {
    minHeight: '100vh',
    background: COLORS.background,
    color: COLORS.textPrimary,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    width: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
  phone: {
    width: '100%',
    maxWidth: 430,
    height: 820,
    background: COLORS.background,
    borderRadius: 34,
    overflow: 'hidden',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 28px 90px rgba(0,0,0,0.58)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  header: {
    height: 112,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '24px 18px 0',
    boxSizing: 'border-box',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: COLORS.textPrimary,
    textDecoration: 'none',
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    fontWeight: 700,
    fontSize: 32,
    lineHeight: 1,
    flexShrink: 0,
  },
  title: {
    margin: 0,
    color: COLORS.textPrimary,
    fontFamily: '"SF Pro Display", sans-serif',
    fontSize: 21,
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: 0,
  },
  headerCenter: {
    flex: '1 1 auto',
    minWidth: 0,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  moreDots: {
    display: 'block',
    fontSize: 18,
    letterSpacing: 2,
    transform: 'translateX(1px) translateY(-1px)',
  },
  tabWrap: {
    height: 36,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 2,
    margin: '14px 0',
    padding: 2,
    borderRadius: 999,
    background: COLORS.borderStrong,
    boxSizing: 'border-box',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 3,
  },
  tab: {
    border: 'none',
    borderRadius: 999,
    padding: '0 6px',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0,
    fontFamily: '"SF Pro Text", sans-serif',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  periodBar: {
    margin: '0 0 18px',
    paddingBottom: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 8,
    flexShrink: 0,
  },
  periodButton: {
    height: 38,
    padding: '0 10px',
    borderRadius: 999,
    border: `1px solid ${COLORS.border}`,
    fontWeight: 800,
    fontSize: 13,
  },
  periodButtonActive: {
    background: 'rgba(255,107,44,0.12)',
    color: COLORS.primary,
    border: '1px solid rgba(255,107,44,0.26)',
  },
  periodButtonIdle: {
    background: COLORS.surface,
    color: COLORS.textSecondary,
  },
  displaySettingsPanel: {
    marginBottom: 18,
  },
  main: {
    padding: '8px 18px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    flex: 1,
    overflowY: 'auto',
    scrollbarWidth: 'none',
    boxSizing: 'border-box',
  },
  sectionColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    textAlign: 'left',
  },
  sectionCard: {
    background: COLORS.surface,
    borderRadius: 24,
    border: `1px solid ${COLORS.borderStrong}`,
    padding: 18,
    overflow: 'hidden',
    boxShadow: '0 14px 34px rgba(0,0,0,0.32)',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  summaryCard: {
    background: COLORS.surface,
    borderRadius: 24,
    border: `1px solid ${COLORS.borderStrong}`,
    padding: 18,
    overflow: 'hidden',
    boxShadow: '0 14px 34px rgba(0,0,0,0.32)',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: 14,
    rowGap: 14,
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  },
  checkboxChip: {
    minHeight: 54,
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.surfaceRaised,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  checkboxChipActive: {
    border: '1px solid rgba(255,107,44,0.36)',
    background: 'rgba(255,107,44,0.10)',
  },
  checkboxInput: {
    width: 17,
    height: 17,
    margin: 0,
    accentColor: COLORS.primary,
    flex: '0 0 auto',
  },
  checkboxText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minWidth: 0,
  },
  checkboxLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  checkboxDescription: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exerciseSelectorHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseSelectorCopy: {
    minWidth: 0,
  },
  exerciseSelectorTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  exerciseSelectorMeta: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exerciseSelectorButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  },
  exerciseSelectorButtonActive: {
    border: '1px solid rgba(255,107,44,0.36)',
    background: 'rgba(255,107,44,0.12)',
    color: COLORS.primary,
  },
  exerciseFilterGrid: {
    marginTop: 14,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  },
  trendContainer: {
    color: COLORS.textSecondary,
    fontSize: 12,
    minWidth: 0,
  },
  trendHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trendValue: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 0,
  },
  trendDelta: {
    color: COLORS.primary,
    fontWeight: 700,
    letterSpacing: 0,
  },
  chartSvg: {
    width: '100%',
    display: 'block',
    overflow: 'visible',
  },
  chartFooter: {
    marginTop: 7,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(24px, 1fr))',
    gap: 2,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 10,
    minHeight: 12,
  },
  chartTick: {
    whiteSpace: 'nowrap',
  },
  chartRange: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  trendLegend: {
    marginTop: 7,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: 800,
  },
  trendLegendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  },
  trendLegendLine: {
    width: 16,
    height: 3,
    borderRadius: 999,
    display: 'inline-block',
  },
  macroLegend: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  legendItem: {
    fontWeight: 700,
    fontSize: 12,
  },
  macroRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  macroRow: {
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 10,
  },
  macroDate: {
    color: COLORS.textSecondary,
    fontWeight: 700,
    marginBottom: 6,
    fontSize: 11,
  },
  barTrack: {
    height: 10,
    display: 'flex',
    overflow: 'hidden',
    borderRadius: 999,
    background: COLORS.surfaceMuted,
  },
  macroSeg: {
    height: 10,
    minWidth: 0,
  },
  proteinSeg: {
    background: COLORS.healthBlue,
  },
  fatSeg: {
    background: COLORS.healthYellow,
  },
  carbSeg: {
    background: COLORS.healthGreen,
  },
  macroMeta: {
    marginTop: 6,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  macroSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    marginTop: 10,
  },
  macroSummaryItem: {
    borderRadius: 14,
    padding: '8px 9px',
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 700,
  },
  trainingCard: {
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    boxShadow: '0 14px 34px rgba(0,0,0,0.24)',
    textAlign: 'left',
  },
  emptyState: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 1.5,
  },
  trainingHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  trainingTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 850,
    color: COLORS.textPrimary,
    letterSpacing: 0,
  },
  rmStatusBadge: {
    flex: '0 0 auto',
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '-0.01em',
  },
  rmHero: {
    borderRadius: 18,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.border}`,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  rmHeroTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  rmKicker: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.03em',
  },
  rmValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  rmValue: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: '-0.06em',
  },
  rmDelta: {
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: '-0.02em',
  },
  rmHistoryCount: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 800,
    paddingTop: 4,
    flex: '0 0 auto',
  },
  rmMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 1.45,
  },
  trainingStatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  },
  trainingStat: {
    borderRadius: 14,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
    padding: 12,
    minWidth: 0,
  },
  trainingStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  trainingStatValue: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: 0,
  },
  subCardTitle: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  sessionRows: {
    marginTop: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  sessionRow: {
    display: 'grid',
    gridTemplateColumns: '42px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.15fr)',
    gap: 6,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: '10px 8px',
    background: COLORS.surfaceRaised,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sessionDate: {
    color: COLORS.textPrimary,
    fontWeight: 700,
  },
  sessionText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSpace: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
}

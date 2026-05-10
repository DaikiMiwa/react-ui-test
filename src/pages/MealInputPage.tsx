import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { AppHeader, MoreDots } from '../ui/AppHeader'
import { AppMain } from '../ui/AppMain'
import { AppShell } from '../ui/AppShell'
import { HorizontalPicker } from '../ui/HorizontalPicker'
import { IconButton } from '../ui/IconButton'
import { MacroBar, MacroInputGrid, MacroSummaryGrid, MACRO_FIELDS } from '../ui/MacroSummary'
import type { MacroKey } from '../ui/MacroSummary'
import { MetricValue } from '../ui/MetricValue'
import { SelectableCard } from '../ui/SelectableCard'
import { SegmentedControl } from '../ui/SegmentedControl'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusPill } from '../ui/StatusPill'
import { COLORS } from '../ui/tokens'

const STORAGE_KEY = 'workout-health-meals-v1'
const PRESET_STORAGE_KEY = 'workout-health-meal-presets-v1'
const DAILY_PLAN = {
  calories: 2200,
  protein: 150,
  fat: 60,
  carbs: 240,
  waterLiters: 2.5,
}
const ENTRY_MODES = ['assist', 'manual'] as const

type Meal = {
  id: string
  label: string
  timeLabel: string
  protein: number
  fat: number
  carbs: number
  memo: string
  analysis: MealAnalysis | null
  savedAt: string | null
  dirty: boolean
}

type MealAnalysis = {
  summary: string
  items: string[]
  confidence: 'Low' | 'Medium' | 'High'
}

type MacroPreset = {
  id: string
  label: string
  protein: number
  fat: number
  carbs: number
}

type DailyMealLog = {
  schemaVersion: 2
  date: string
  meals: Meal[]
  waterLiters: number
  planTargets: typeof DAILY_PLAN
}

const DEFAULT_MEALS: Meal[] = [
  {
    id: 'meal-1',
    label: 'MEAL 1',
    timeLabel: '08:10',
    protein: 34,
    fat: 12,
    carbs: 58,
    memo: 'オートミール、ギリシャヨーグルト、バナナ、プロテイン',
    analysis: {
      summary: '朝食として、主食・乳製品・プロテインをPFCへ整理しました。',
      items: ['オートミール', 'ヨーグルト', 'バナナ', 'プロテイン'],
      confidence: 'High',
    },
    savedAt: '08:18',
    dirty: false,
  },
  {
    id: 'meal-2',
    label: 'MEAL 2',
    timeLabel: '12:40',
    protein: 46,
    fat: 18,
    carbs: 72,
    memo: '鶏むね肉の定食。ご飯、味噌汁、サラダを一緒に食べた',
    analysis: {
      summary: '定食の主菜・主食・副菜をもとにPFCを推定しました。',
      items: ['鶏むね肉', 'ご飯', '味噌汁', 'サラダ'],
      confidence: 'Medium',
    },
    savedAt: '12:52',
    dirty: false,
  },
  {
    id: 'meal-3',
    label: 'MEAL 3',
    timeLabel: '18:30',
    protein: 0,
    fat: 0,
    carbs: 0,
    memo: '',
    analysis: null,
    savedAt: null,
    dirty: true,
  },
]

const MANUAL_PRESETS: MacroPreset[] = [
  { id: 'chicken-set', label: '鶏むね定食', protein: 45, fat: 11, carbs: 78 },
  { id: 'protein-snack', label: 'プロテイン軽食', protein: 32, fat: 7, carbs: 34 },
  { id: 'eating-out', label: '外食メモ', protein: 35, fat: 28, carbs: 86 },
]

function readNumericInput(value: string) {
  if (value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function calcCalories(meal: Pick<Meal, 'protein' | 'fat' | 'carbs'>) {
  return Math.round(meal.protein * 4 + meal.fat * 9 + meal.carbs * 4)
}

function formatGram(value: number) {
  return `${Math.round(value)}g`
}

function formatTime() {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function todayKey() {
  const date = new Date()
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
}

function normalizePlanTargets(item: Partial<typeof DAILY_PLAN> | undefined): typeof DAILY_PLAN {
  return {
    calories: Number.isFinite(item?.calories) ? Math.max(0, Number(item?.calories)) : DAILY_PLAN.calories,
    protein: Number.isFinite(item?.protein) ? Math.max(0, Number(item?.protein)) : DAILY_PLAN.protein,
    fat: Number.isFinite(item?.fat) ? Math.max(0, Number(item?.fat)) : DAILY_PLAN.fat,
    carbs: Number.isFinite(item?.carbs) ? Math.max(0, Number(item?.carbs)) : DAILY_PLAN.carbs,
    waterLiters: Number.isFinite(item?.waterLiters) ? Math.max(0, Number(item?.waterLiters)) : DAILY_PLAN.waterLiters,
  }
}

function normalizeMeal(item: Partial<Meal>, index: number): Meal {
  return {
    id: typeof item.id === 'string' ? item.id : `meal-${index + 1}`,
    label: typeof item.label === 'string' ? item.label : `MEAL ${index + 1}`,
    timeLabel: typeof item.timeLabel === 'string' ? item.timeLabel : formatTime(),
    protein: Number.isFinite(item.protein) ? Number(item.protein) : 0,
    fat: Number.isFinite(item.fat) ? Number(item.fat) : 0,
    carbs: Number.isFinite(item.carbs) ? Number(item.carbs) : 0,
    memo: typeof item.memo === 'string' ? item.memo : '',
    analysis: item.analysis && typeof item.analysis.summary === 'string' ? item.analysis : null,
    savedAt: typeof item.savedAt === 'string' ? item.savedAt : null,
    dirty: typeof item.dirty === 'boolean' ? item.dirty : true,
  }
}

function normalizePreset(item: Partial<MacroPreset>, index: number): MacroPreset {
  const fallback = MANUAL_PRESETS[index] || MANUAL_PRESETS[0]
  const label = typeof item.label === 'string' && item.label.trim() ? item.label.trim() : fallback.label

  return {
    id: typeof item.id === 'string' && item.id ? item.id : `preset-${index + 1}`,
    label,
    protein: Number.isFinite(item.protein) ? Math.max(0, Number(item.protein)) : fallback.protein,
    fat: Number.isFinite(item.fat) ? Math.max(0, Number(item.fat)) : fallback.fat,
    carbs: Number.isFinite(item.carbs) ? Math.max(0, Number(item.carbs)) : fallback.carbs,
  }
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word))
}

function estimateMealFromMemo(memo: string): Pick<Meal, 'protein' | 'fat' | 'carbs' | 'analysis'> {
  const text = memo.toLowerCase()
  const compactText = text.replace(/\s+/g, '')
  const items: string[] = []
  let protein = 0
  let fat = 0
  let carbs = 0

  function addFood(label: string, p: number, f: number, c: number) {
    if (!items.includes(label)) items.push(label)
    protein += p
    fat += f
    carbs += c
  }

  if (includesAny(compactText, ['鶏むね', '鶏胸', 'chickenbreast'])) addFood('鶏むね肉', 42, 5, 0)
  if (includesAny(compactText, ['鶏もも', '唐揚げ', 'からあげ'])) addFood('鶏もも/揚げ物', 32, 24, 12)
  if (includesAny(compactText, ['鮭', 'サーモン', 'salmon'])) addFood('鮭', 28, 14, 0)
  if (includesAny(compactText, ['卵', 'たまご', 'egg'])) addFood('卵', 12, 10, 1)
  if (includesAny(compactText, ['プロテイン', 'protein'])) addFood('プロテイン', 24, 2, 4)
  if (includesAny(compactText, ['ヨーグルト', 'greekyogurt', 'ギリシャヨーグルト'])) addFood('ヨーグルト', 12, 4, 10)
  if (includesAny(compactText, ['豆腐', 'tofu'])) addFood('豆腐', 14, 9, 5)
  if (includesAny(compactText, ['牛肉', 'ステーキ', 'beef'])) addFood('牛肉', 32, 22, 0)
  if (includesAny(compactText, ['豚肉', 'pork'])) addFood('豚肉', 28, 20, 0)
  if (includesAny(compactText, ['ご飯', '白米', '米', 'ライス', 'rice'])) addFood('ご飯', 6, 1, compactText.includes('大盛') ? 92 : 64)
  if (includesAny(compactText, ['玄米'])) addFood('玄米', 6, 2, 58)
  if (includesAny(compactText, ['オートミール', 'oatmeal'])) addFood('オートミール', 8, 5, 36)
  if (includesAny(compactText, ['パン', 'トースト', 'bread'])) addFood('パン', 8, 6, 46)
  if (includesAny(compactText, ['パスタ', 'pasta'])) addFood('パスタ', 14, 8, 82)
  if (includesAny(compactText, ['ラーメン'])) addFood('ラーメン', 24, 22, 82)
  if (includesAny(compactText, ['バナナ', 'banana'])) addFood('バナナ', 1, 0, 27)
  if (includesAny(compactText, ['サラダ', '野菜'])) addFood('サラダ/野菜', 3, 3, 10)
  if (includesAny(compactText, ['味噌汁', 'みそ汁'])) addFood('味噌汁', 3, 2, 6)
  if (includesAny(compactText, ['外食', '定食'])) {
    protein += 10
    fat += compactText.includes('脂質') || compactText.includes('揚げ') ? 14 : 6
    carbs += 12
  }

  if (items.length === 0 && memo.trim()) {
    protein = 25
    fat = 15
    carbs = 55
  }

  const confidence = items.length >= 3 ? 'High' : items.length >= 1 ? 'Medium' : 'Low'
  const summary = items.length
    ? `${items.join('、')}を検出してPFCへ整理しました。量が不明なものは一般的な1食量で推定しています。`
    : memo.trim()
      ? '食事内容は読み取れましたが、食材が曖昧なので一般的な1食として仮推定しました。'
      : '食べたものを入力すると、AI整理案を作成します。'

  return {
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    analysis: {
      summary,
      items: items.length ? items : ['未分類の食事'],
      confidence,
    },
  }
}

function loadInitialDailyLog(): DailyMealLog {
  if (typeof window === 'undefined') {
    return { schemaVersion: 2, date: todayKey(), meals: DEFAULT_MEALS, waterLiters: 1.6, planTargets: DAILY_PLAN }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { schemaVersion: 2, date: todayKey(), meals: DEFAULT_MEALS, waterLiters: 1.6, planTargets: DAILY_PLAN }
    }
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      const meals = parsed.map(normalizeMeal)
      return { schemaVersion: 2, date: todayKey(), meals: meals.length > 0 ? meals : DEFAULT_MEALS, waterLiters: 1.6, planTargets: DAILY_PLAN }
    }
    if (parsed && typeof parsed === 'object') {
      const date = typeof parsed.date === 'string' ? parsed.date : todayKey()
      if (date !== todayKey()) {
        return { schemaVersion: 2, date: todayKey(), meals: DEFAULT_MEALS, waterLiters: 1.6, planTargets: normalizePlanTargets(parsed.planTargets) }
      }
      const meals = Array.isArray(parsed.meals) ? parsed.meals.map(normalizeMeal) : DEFAULT_MEALS
      return {
        schemaVersion: 2,
        date,
        meals: meals.length > 0 ? meals : DEFAULT_MEALS,
        waterLiters: Number.isFinite(parsed.waterLiters) ? Math.max(0, Number(parsed.waterLiters)) : 1.6,
        planTargets: normalizePlanTargets(parsed.planTargets),
      }
    }
  } catch {
    // Fall through to demo defaults.
  }

  return { schemaVersion: 2, date: todayKey(), meals: DEFAULT_MEALS, waterLiters: 1.6, planTargets: DAILY_PLAN }
}

function loadInitialPresets() {
  if (typeof window === 'undefined') return MANUAL_PRESETS

  try {
    const stored = window.localStorage.getItem(PRESET_STORAGE_KEY)
    if (!stored) return MANUAL_PRESETS
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return MANUAL_PRESETS
    return parsed.map(normalizePreset)
  } catch {
    return MANUAL_PRESETS
  }
}

export default function MealInputPage() {
  const [dailyLog, setDailyLog] = useState<DailyMealLog>(loadInitialDailyLog)
  const [meals, setMeals] = useState<Meal[]>(() => dailyLog.meals)
  const [waterLiters, setWaterLiters] = useState(() => dailyLog.waterLiters)
  const [activeMealId, setActiveMealId] = useState(() => dailyLog.meals[0]?.id || 'meal-1')
  const [entryMode, setEntryMode] = useState<'assist' | 'manual'>('assist')
  const [manualPresets, setManualPresets] = useState<MacroPreset[]>(loadInitialPresets)
  const [editingPresets, setEditingPresets] = useState(false)
  const activeMeal = meals.find((meal) => meal.id === activeMealId) || meals[0]

  const totals = useMemo(
    () =>
      meals.reduce(
        (sum, meal) => ({
          protein: sum.protein + meal.protein,
          fat: sum.fat + meal.fat,
          carbs: sum.carbs + meal.carbs,
          calories: sum.calories + calcCalories(meal),
        }),
        { protein: 0, fat: 0, carbs: 0, calories: 0 }
      ),
    [meals]
  )
  const savedCount = meals.filter((meal) => meal.savedAt && !meal.dirty).length

  useEffect(() => {
    const nextLog: DailyMealLog = {
      schemaVersion: 2,
      date: dailyLog.date,
      meals,
      waterLiters,
      planTargets: dailyLog.planTargets,
    }
    setDailyLog(nextLog)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLog))
  }, [dailyLog.date, dailyLog.planTargets, meals, waterLiters])

  useEffect(() => {
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(manualPresets))
  }, [manualPresets])

  function updateMeal(mealId: string, updater: (meal: Meal) => Meal) {
    setMeals((currentMeals) => currentMeals.map((meal) => (meal.id === mealId ? updater(meal) : meal)))
  }

  function updateActiveMacro(key: MacroKey, value: number) {
    updateMeal(activeMeal.id, (meal) => ({
      ...meal,
      [key]: value,
      dirty: true,
    }))
  }

  function updateActiveMemo(memo: string) {
    updateMeal(activeMeal.id, (meal) => ({
      ...meal,
      memo,
      analysis: null,
      dirty: true,
    }))
  }

  function analyzeActiveMeal() {
    const estimate = estimateMealFromMemo(activeMeal.memo)
    updateMeal(activeMeal.id, (meal) => ({
      ...meal,
      protein: estimate.protein,
      fat: estimate.fat,
      carbs: estimate.carbs,
      analysis: estimate.analysis,
      dirty: true,
    }))
  }

  function applyManualPreset(preset: MacroPreset) {
    updateMeal(activeMeal.id, (meal) => ({
      ...meal,
      protein: preset.protein,
      fat: preset.fat,
      carbs: preset.carbs,
      analysis: null,
      dirty: true,
    }))
  }

  function updateManualPreset(presetId: string, patch: Partial<Omit<MacroPreset, 'id'>>) {
    setManualPresets((currentPresets) =>
      currentPresets.map((preset) => (preset.id === presetId ? { ...preset, ...patch } : preset))
    )
  }

  function addManualPreset() {
    const nextPreset: MacroPreset = {
      id: `preset-${Date.now()}`,
      label: `プリセット ${manualPresets.length + 1}`,
      protein: 30,
      fat: 10,
      carbs: 60,
    }

    setManualPresets((currentPresets) => [...currentPresets, nextPreset])
    setEditingPresets(true)
  }

  function deleteManualPreset(presetId: string) {
    setManualPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== presetId))
  }

  function saveActiveMeal() {
    updateMeal(activeMeal.id, (meal) => ({
      ...meal,
      savedAt: formatTime(),
      dirty: false,
    }))
  }

  function clearActiveMeal() {
    updateMeal(activeMeal.id, (meal) => ({
      ...meal,
      protein: 0,
      fat: 0,
      carbs: 0,
      memo: '',
      analysis: null,
      savedAt: null,
      dirty: true,
    }))
  }

  function addMeal() {
    const nextNumber = meals.length + 1
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      label: `MEAL ${nextNumber}`,
      timeLabel: formatTime(),
      protein: 0,
      fat: 0,
      carbs: 0,
      memo: '',
      analysis: null,
      savedAt: null,
      dirty: true,
    }

    setMeals((currentMeals) => [...currentMeals, newMeal])
    setActiveMealId(newMeal.id)
  }

  return (
    <AppShell>
      <AppHeader
        title="食事入力"
        subtitle={`Today · ${savedCount}/${meals.length} saved`}
        left={<IconButton to="/" ariaLabel="ホームへ戻る">‹</IconButton>}
        right={<IconButton to="/settings" ariaLabel="設定を開く"><MoreDots /></IconButton>}
      />

        <AppMain withBottomNav>
          <DailySummaryCard
            totals={totals}
            savedCount={savedCount}
            totalMeals={meals.length}
            calorieTarget={dailyLog.planTargets.calories}
            waterLiters={waterLiters}
            waterTarget={dailyLog.planTargets.waterLiters}
            onWaterChange={setWaterLiters}
          />

          <section style={styles.mealPickerSection}>
            <SectionHeader
              title="Meals"
              action={<button type="button" onClick={addMeal} style={styles.addMealButton}>+ Meal</button>}
            />
            <HorizontalPicker>
              {meals.map((meal) => (
                <MealPickerCard
                  key={meal.id}
                  meal={meal}
                  isActive={meal.id === activeMeal.id}
                  onSelect={() => setActiveMealId(meal.id)}
                />
              ))}
            </HorizontalPicker>
          </section>

          <section style={styles.editorCard}>
            <div style={styles.editorHeader}>
              <div>
                <div style={styles.kicker}>ACTIVE MEAL</div>
                <h1 style={styles.editorTitle}>{activeMeal.label}</h1>
                <div style={styles.editorSubtitle}>AI推定も手入力もOK</div>
              </div>
              <StatusPill tone={activeMeal.dirty ? 'default' : 'primary'}>
                {activeMeal.dirty ? 'Draft' : `Saved ${activeMeal.savedAt}`}
              </StatusPill>
            </div>

            <SegmentedControl
              items={ENTRY_MODES}
              value={entryMode}
              onChange={setEntryMode}
              ariaLabel="入力方法"
              getLabel={(mode) => (mode === 'assist' ? 'AI整理' : '手入力')}
              style={styles.modeSwitch}
            />

            {entryMode === 'assist' ? (
              <>
                <label style={styles.noteInputWrap}>
                  <span style={styles.inputLabel}>食べたものをそのまま入力</span>
                  <textarea
                    value={activeMeal.memo}
                    onChange={(event) => updateActiveMemo(event.target.value)}
                    placeholder="例: 鮭定食。ご飯は普通盛り、サラダ追加。脂質は控えめ"
                    style={styles.noteTextarea}
                  />
                </label>

                <div style={styles.aiActionRow}>
                  <button
                    type="button"
                    onClick={analyzeActiveMeal}
                    disabled={!activeMeal.memo.trim()}
                    style={activeMeal.memo.trim() ? styles.aiPrimaryButton : styles.aiPrimaryButtonDisabled}
                  >
                    AIでPFCを整理
                  </button>
                  <span style={styles.aiHint}>推定後も修正可</span>
                </div>

                <AiSuggestionCard meal={activeMeal} />
                <MacroSection meal={activeMeal} onChange={updateActiveMacro} helper="AI推定値を確認して、必要なら手で直せます。" />
              </>
            ) : (
              <>
                <ManualPresetChips
                  presets={manualPresets}
                  onSelect={applyManualPreset}
                  isEditing={editingPresets}
                  onToggleEdit={() => setEditingPresets((value) => !value)}
                  onAddPreset={addManualPreset}
                  onUpdatePreset={updateManualPreset}
                  onDeletePreset={deleteManualPreset}
                />
                <MacroSection meal={activeMeal} onChange={updateActiveMacro} helper="推定せずにPFCを直接入力して保存できます。" />

                <label style={styles.noteInputWrapCompact}>
                  <span style={styles.inputLabel}>食べたものメモ</span>
                  <textarea
                    value={activeMeal.memo}
                    onChange={(event) => updateActiveMemo(event.target.value)}
                    placeholder="例: 鮭定食。メモだけ残してもOK"
                    style={styles.noteTextareaCompact}
                  />
                </label>
              </>
            )}

            <div style={styles.editorActions}>
              <ActionButton onClick={clearActiveMeal}>Clear</ActionButton>
              <ActionButton onClick={saveActiveMeal} variant="primary">Save Meal</ActionButton>
            </div>
          </section>

          <section style={styles.mealLogSection}>
            <SectionHeader title="Today’s Log" action={<span style={styles.updatedText}>{totals.calories} kcal</span>} />
            <div style={styles.logStack}>
              {meals.map((meal) => (
                <MealLogCard key={meal.id} meal={meal} isActive={meal.id === activeMeal.id} onSelect={() => setActiveMealId(meal.id)} />
              ))}
            </div>
          </section>
        </AppMain>
    </AppShell>
  )
}

function DailySummaryCard({
  totals,
  savedCount,
  totalMeals,
  calorieTarget,
  waterLiters,
  waterTarget,
  onWaterChange,
}: {
  totals: { protein: number; fat: number; carbs: number; calories: number }
  savedCount: number
  totalMeals: number
  calorieTarget: number
  waterLiters: number
  waterTarget: number
  onWaterChange: (value: number) => void
}) {
  return (
    <section style={styles.summaryCard}>
      <div style={styles.summaryHeader}>
        <div>
          <p style={styles.kicker}>TODAY'S INTAKE</p>
          <MetricValue value={totals.calories} target={calorieTarget} unit="kcal" size="xl" style={styles.calorieMetric} />
        </div>
        <div style={styles.summaryBadge}>{savedCount}/{totalMeals}</div>
      </div>

      <MacroBar values={totals} style={styles.summaryMacroBar} />
      <MacroSummaryGrid values={totals} formatValue={(value) => formatGram(value)} style={styles.summaryMacroGrid} />
      <div style={styles.waterInputCard}>
        <div>
          <span style={styles.waterLabel}>WATER</span>
          <MetricValue value={waterLiters} target={waterTarget} unit="L" size="md" />
        </div>
        <div style={styles.waterActions}>
          <button type="button" onClick={() => onWaterChange(Math.round((waterLiters + 0.25) * 100) / 100)} style={styles.waterButton}>+250ml</button>
          <button type="button" onClick={() => onWaterChange(Math.round((waterLiters + 0.5) * 100) / 100)} style={styles.waterButton}>+500ml</button>
        </div>
        <label style={styles.waterDirectInput}>
          <span style={styles.waterLabel}>DIRECT</span>
          <input
            value={waterLiters}
            onChange={(event) => onWaterChange(readNumericInput(event.target.value))}
            inputMode="decimal"
            aria-label="水分 L"
            style={styles.waterNumberInput}
          />
        </label>
      </div>
    </section>
  )
}

function MealPickerCard({ meal, isActive, onSelect }: { meal: Meal; isActive: boolean; onSelect: () => void }) {
  const status = meal.dirty ? 'Draft' : 'Saved'

  return (
    <SelectableCard selected={isActive} onClick={onSelect} style={styles.mealPickerCard}>
      <span style={styles.mealPickerLabel}>{meal.label}</span>
      <span style={styles.mealPickerMeta}>{meal.timeLabel}</span>
      <span style={isActive ? styles.mealPickerStatusActive : styles.mealPickerStatus}>{status}</span>
      <span style={styles.mealPickerMacros}>
        P{Math.round(meal.protein)} F{Math.round(meal.fat)} C{Math.round(meal.carbs)}
      </span>
    </SelectableCard>
  )
}

function MacroInputs({ meal, onChange }: { meal: Meal; onChange: (key: MacroKey, value: number) => void }) {
  return <MacroInputGrid values={meal} onChange={onChange} />
}

function ManualPresetChips({
  presets,
  onSelect,
  isEditing,
  onToggleEdit,
  onAddPreset,
  onUpdatePreset,
  onDeletePreset,
}: {
  presets: MacroPreset[]
  onSelect: (preset: MacroPreset) => void
  isEditing: boolean
  onToggleEdit: () => void
  onAddPreset: () => void
  onUpdatePreset: (presetId: string, patch: Partial<Omit<MacroPreset, 'id'>>) => void
  onDeletePreset: (presetId: string) => void
}) {
  return (
    <section style={styles.manualPresetSection}>
      <div style={styles.manualPresetHeaderRow}>
        <div style={styles.manualPresetHeader}>PFCプリセット</div>
        <button
          type="button"
          onClick={onToggleEdit}
          aria-label={isEditing ? 'PFCプリセット編集を閉じる' : 'PFCプリセットを編集'}
          aria-pressed={isEditing}
          style={isEditing ? styles.manualPresetMenuActive : styles.manualPresetMenu}
        >
          <MoreDots />
        </button>
      </div>

      {presets.length > 0 ? (
        <div style={styles.manualPresetRow}>
          {presets.map((preset) => (
            <button key={preset.id} type="button" onClick={() => onSelect(preset)} style={styles.manualPresetChip}>
              <span style={styles.manualPresetLabel}>{preset.label || 'プリセット'}</span>
              <span style={styles.manualPresetMacro}>
                P{Math.round(preset.protein)} F{Math.round(preset.fat)} C{Math.round(preset.carbs)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p style={styles.presetEmpty}>プリセットはまだありません。</p>
      )}

      {isEditing ? (
        <div style={styles.presetEditorStack}>
          {presets.map((preset) => (
            <div key={preset.id} style={styles.presetEditorCard}>
              <div style={styles.presetEditorTop}>
                <label style={styles.presetNameInputWrap}>
                  <span style={styles.presetInputLabel}>Name</span>
                  <input
                    value={preset.label}
                    onChange={(event) => onUpdatePreset(preset.id, { label: event.target.value })}
                    aria-label="プリセット名"
                    style={styles.presetTextInput}
                  />
                </label>
                <button type="button" onClick={() => onDeletePreset(preset.id)} style={styles.presetDeleteButton}>
                  削除
                </button>
              </div>
              <div style={styles.presetMacroEditGrid}>
                {MACRO_FIELDS.map((field) => (
                  <label key={field.key} style={styles.presetMacroInputWrap}>
                    <span style={styles.presetInputLabel}>{field.shortLabel}</span>
                    <input
                      value={preset[field.key] || ''}
                      onChange={(event) =>
                        onUpdatePreset(preset.id, {
                          [field.key]: readNumericInput(event.target.value),
                        } as Partial<Omit<MacroPreset, 'id'>>)
                      }
                      inputMode="decimal"
                      aria-label={`${preset.label || 'プリセット'} ${field.label}`}
                      style={styles.presetMacroInput}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={onAddPreset} style={styles.presetAddButton}>
            + Preset
          </button>
        </div>
      ) : null}
    </section>
  )
}

function MacroSection({
  meal,
  onChange,
  helper,
}: {
  meal: Meal
  onChange: (key: MacroKey, value: number) => void
  helper: string
}) {
  return (
    <section style={styles.macroSection}>
      <div style={styles.macroSectionHeader}>
        <span style={styles.macroSectionTitle}>PFCを入力・調整</span>
        <span style={styles.macroSectionCalories}>{calcCalories(meal)} kcal</span>
      </div>
      <p style={styles.macroSectionHelper}>{helper}</p>
      <MacroInputs meal={meal} onChange={onChange} />
    </section>
  )
}

function AiSuggestionCard({ meal }: { meal: Meal }) {
  if (!meal.analysis) {
    return (
      <section style={styles.aiSuggestionEmpty}>
        <div style={styles.aiSuggestionHeader}>
          <span style={styles.aiSpark}>AI</span>
          <span style={styles.aiSuggestionTitle}>整理待ち</span>
        </div>
        <p style={styles.aiSuggestionText}>食事メモからPFC推定と食材リストを作ります。</p>
      </section>
    )
  }

  return (
    <section style={styles.aiSuggestionCard}>
      <div style={styles.aiSuggestionHeader}>
        <span style={styles.aiSpark}>AI</span>
        <span style={styles.aiSuggestionTitle}>整理案</span>
        <span style={styles.confidencePill}>{meal.analysis.confidence}</span>
      </div>
      <p style={styles.aiSuggestionText}>{meal.analysis.summary}</p>
      <div style={styles.aiItemRow}>
        {meal.analysis.items.map((item) => (
          <span key={item} style={styles.aiItemChip}>
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

function MealLogCard({ meal, isActive, onSelect }: { meal: Meal; isActive: boolean; onSelect: () => void }) {
  const hasMemo = meal.memo.trim().length > 0

  return (
    <button type="button" onClick={onSelect} style={isActive ? { ...styles.logCard, ...styles.logCardActive } : styles.logCard}>
      <span style={styles.logHeader}>
        <span style={styles.logTitle}>{meal.label}</span>
        <span style={meal.dirty ? styles.logStatusDraft : styles.logStatusSaved}>{meal.dirty ? 'Draft' : `Saved ${meal.savedAt}`}</span>
      </span>
      <span style={styles.logMemo}>{hasMemo ? meal.memo : '未入力'}</span>
      <span style={styles.logFooter}>
        <span>{calcCalories(meal)} kcal</span>
        <span>P {formatGram(meal.protein)}</span>
        <span>F {formatGram(meal.fat)}</span>
        <span>C {formatGram(meal.carbs)}</span>
      </span>
    </button>
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
    fontSize: 28,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
    textDecoration: 'none',
  },
  headerCenter: {
    textAlign: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: 800,
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0,
  },
  content: {
    height: 708,
    overflowY: 'auto',
    padding: '8px 18px 28px',
    boxSizing: 'border-box',
    scrollbarWidth: 'none',
  },
  summaryCard: {
    padding: 18,
    borderRadius: 24,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 20px 44px rgba(0,0,0,0.32)',
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  kicker: {
    margin: 0,
    color: COLORS.primarySoft,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.2,
  },
  calorieMetric: {
    marginTop: 8,
  },
  calorieRow: {
    marginTop: 8,
    display: 'flex',
    alignItems: 'baseline',
    gap: 5,
    flexWrap: 'wrap',
  },
  calorieValue: {
    color: COLORS.textPrimary,
    fontSize: 42,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,
  },
  calorieDivider: {
    color: COLORS.textMuted,
    fontSize: 25,
    fontWeight: 850,
  },
  calorieTarget: {
    color: COLORS.textSecondary,
    fontSize: 25,
    lineHeight: 1,
    fontWeight: 850,
    letterSpacing: 0,
  },
  calorieUnit: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: 800,
  },
  summaryBadge: {
    minWidth: 54,
    height: 34,
    padding: '0 10px',
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textSecondary,
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
    fontSize: 13,
    fontWeight: 900,
  },
  macroBar: {
    height: 10,
    marginTop: 18,
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    overflow: 'hidden',
    display: 'flex',
  },
  macroBarSegment: {
    height: '100%',
    display: 'block',
  },
  summaryMacroBar: {
    marginTop: 18,
  },
  summaryMacroGrid: {
    marginTop: 14,
  },
  waterInputCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 10,
  },
  waterLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.08em',
  },
  waterActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  waterButton: {
    height: 34,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 999,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  waterDirectInput: {
    display: 'grid',
    gap: 5,
    padding: 10,
    borderRadius: 14,
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
  },
  waterNumberInput: {
    width: '100%',
    minWidth: 0,
    border: 0,
    outline: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  summaryGrid: {
    marginTop: 14,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 9,
  },
  summaryMacro: {
    minHeight: 62,
    padding: '10px 9px',
    borderRadius: 16,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
    display: 'grid',
    gridTemplateColumns: '8px auto',
    alignContent: 'center',
    gap: '4px 7px',
    boxSizing: 'border-box',
  },
  summaryDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginTop: 5,
  },
  summaryMacroLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
  },
  summaryMacroValue: {
    gridColumn: '2',
    fontSize: 19,
    lineHeight: 1,
    fontWeight: 900,
  },
  mealPickerSection: {
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
    letterSpacing: 0,
  },
  addMealButton: {
    minHeight: 36,
    padding: '0 14px',
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  mealPicker: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(126px, 142px)',
    gap: 10,
    overflowX: 'auto',
    paddingBottom: 2,
    scrollbarWidth: 'none',
  },
  mealPickerCard: {
    minHeight: 118,
    borderRadius: 18,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    padding: 13,
    display: 'grid',
    justifyItems: 'start',
    gap: 6,
    textAlign: 'left',
    fontFamily: 'inherit',
    boxShadow: '0 16px 34px rgba(0,0,0,0.22)',
  },
  mealPickerCardActive: {
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}88`,
    boxShadow: '0 0 0 1px rgba(255,107,44,0.18), 0 18px 38px rgba(0,0,0,0.28)',
  },
  mealPickerLabel: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 900,
    letterSpacing: 0.9,
  },
  mealPickerMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
  },
  mealPickerStatus: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 900,
  },
  mealPickerStatusActive: {
    marginTop: 3,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 900,
  },
  mealPickerMacros: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  editorCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 24,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    boxShadow: '0 20px 44px rgba(0,0,0,0.30)',
  },
  editorHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  editorTitle: {
    margin: '7px 0 0',
    color: COLORS.textPrimary,
    fontSize: 27,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: 0,
  },
  editorSubtitle: {
    marginTop: 5,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 800,
  },
  editingPill: {
    padding: '7px 10px',
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.primarySoft,
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  savedPill: {
    padding: '7px 10px',
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primarySoft}66`,
    color: COLORS.primarySoft,
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  modeSwitch: {
    height: 36,
    margin: '14px 0',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 2,
    padding: 2,
    borderRadius: 999,
    background: COLORS.borderStrong,
  },
  modeTab: {
    minHeight: 0,
    borderRadius: 999,
    border: 0,
    background: 'transparent',
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
  },
  modeTabActive: {
    minHeight: 0,
    borderRadius: 999,
    border: 0,
    background: COLORS.primary,
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 800,
    fontFamily: 'inherit',
  },
  macroSection: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    background: `linear-gradient(145deg, rgba(255, 107, 44, 0.08), ${COLORS.surfaceRaised} 42%)`,
    border: `1px solid ${COLORS.primary}22`,
    textAlign: 'left',
  },
  macroSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  macroSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 900,
  },
  macroSectionCalories: {
    color: COLORS.primarySoft,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  macroSectionHelper: {
    margin: '7px 0 0',
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 1.4,
  },
  macroInputGrid: {
    marginTop: 14,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  macroInputWrap: {
    minHeight: 88,
    borderRadius: 16,
    border: `1px solid ${COLORS.primary}22`,
    background: COLORS.surfaceMuted,
    padding: 11,
    boxSizing: 'border-box',
    display: 'grid',
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left',
  },
  macroInputRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.5,
  },
  macroInputRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  macroInput: {
    minWidth: 0,
    width: '100%',
    border: 0,
    outline: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 900,
    fontFamily: 'inherit',
    letterSpacing: 0,
  },
  macroUnit: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: 800,
  },
  noteInputWrap: {
    marginTop: 18,
    minHeight: 168,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.surfaceRaised,
    padding: 13,
    boxSizing: 'border-box',
    display: 'grid',
    gap: 8,
    textAlign: 'left',
  },
  noteInputWrapCompact: {
    marginTop: 14,
    minHeight: 124,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.surfaceRaised,
    padding: 13,
    boxSizing: 'border-box',
    display: 'grid',
    gap: 8,
    textAlign: 'left',
  },
  noteTextarea: {
    width: '100%',
    minHeight: 116,
    border: 0,
    outline: 0,
    resize: 'vertical',
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 16,
    lineHeight: 1.4,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  noteTextareaCompact: {
    width: '100%',
    minHeight: 72,
    border: 0,
    outline: 0,
    resize: 'vertical',
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 1.4,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  manualPresetSection: {
    marginTop: 14,
    padding: 13,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
    textAlign: 'left',
  },
  manualPresetHeader: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.5,
  },
  manualPresetHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  manualPresetMenu: {
    width: 32,
    height: 32,
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceMuted,
    color: COLORS.textSecondary,
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'inherit',
    padding: 0,
    flexShrink: 0,
  },
  manualPresetMenuActive: {
    width: 32,
    height: 32,
    borderRadius: 999,
    border: `1px solid ${COLORS.primary}66`,
    background: COLORS.primary,
    color: COLORS.background,
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'inherit',
    padding: 0,
    flexShrink: 0,
  },
  manualPresetRow: {
    marginTop: 10,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  manualPresetChip: {
    minHeight: 46,
    padding: '8px 12px',
    borderRadius: 16,
    border: `1px solid ${COLORS.primary}33`,
    background: COLORS.surfaceMuted,
    color: COLORS.textPrimary,
    display: 'grid',
    gap: 3,
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  manualPresetLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  manualPresetMacro: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 850,
    whiteSpace: 'nowrap',
  },
  presetEmpty: {
    margin: '10px 0 0',
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
  },
  presetEditorStack: {
    marginTop: 12,
    display: 'grid',
    gap: 10,
  },
  presetEditorCard: {
    padding: 10,
    borderRadius: 16,
    border: `1px solid ${COLORS.primary}22`,
    background: COLORS.surfaceMuted,
    display: 'grid',
    gap: 9,
  },
  presetEditorTop: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 8,
    alignItems: 'end',
  },
  presetNameInputWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 5,
  },
  presetInputLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 0.4,
    lineHeight: 1,
  },
  presetTextInput: {
    minWidth: 0,
    width: '100%',
    height: 36,
    borderRadius: 12,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textPrimary,
    padding: '0 10px',
    boxSizing: 'border-box',
    outline: 0,
    fontSize: 13,
    fontWeight: 850,
    fontFamily: 'inherit',
  },
  presetDeleteButton: {
    width: 56,
    height: 36,
    borderRadius: 12,
    border: `1px solid ${COLORS.primary}33`,
    background: COLORS.surfaceRaised,
    color: COLORS.primarySoft,
    fontSize: 11,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  presetMacroEditGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 7,
  },
  presetMacroInputWrap: {
    minWidth: 0,
    height: 52,
    borderRadius: 13,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    padding: '8px 9px',
    boxSizing: 'border-box',
    display: 'grid',
    gap: 3,
  },
  presetMacroInput: {
    minWidth: 0,
    width: '100%',
    border: 0,
    outline: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 900,
    fontFamily: 'inherit',
    letterSpacing: 0,
  },
  presetAddButton: {
    minHeight: 38,
    borderRadius: 999,
    border: `1px solid ${COLORS.primary}44`,
    background: COLORS.surfaceRaised,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  aiActionRow: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 6,
    alignItems: 'stretch',
  },
  aiPrimaryButton: {
    minHeight: 42,
    borderRadius: 999,
    border: 0,
    background: COLORS.primary,
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  aiPrimaryButtonDisabled: {
    minHeight: 42,
    borderRadius: 999,
    border: 0,
    background: COLORS.surfaceMuted,
    color: COLORS.inactive,
    fontSize: 14,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  aiHint: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.35,
    textAlign: 'center',
  },
  aiSuggestionCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  aiSuggestionEmpty: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
    display: 'grid',
    gap: 8,
    textAlign: 'left',
  },
  aiSuggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  aiSpark: {
    width: 30,
    height: 24,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: COLORS.primary,
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 950,
  },
  aiSuggestionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 900,
  },
  confidencePill: {
    marginLeft: 'auto',
    padding: '5px 8px',
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    color: COLORS.primarySoft,
    fontSize: 10,
    fontWeight: 900,
  },
  aiSuggestionText: {
    margin: 0,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 1.42,
  },
  aiItemRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7,
  },
  aiItemChip: {
    padding: '7px 9px',
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 850,
  },
  editorActions: {
    marginTop: 16,
    display: 'grid',
    gridTemplateColumns: '0.72fr 1.28fr',
    gap: 10,
  },
  mealLogSection: {
    marginTop: 24,
  },
  updatedText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 800,
  },
  logStack: {
    display: 'grid',
    gap: 10,
  },
  logCard: {
    width: '100%',
    minHeight: 112,
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textPrimary,
    display: 'grid',
    gap: 9,
    textAlign: 'left',
    fontFamily: 'inherit',
    boxShadow: '0 16px 34px rgba(0,0,0,0.22)',
  },
  logCardActive: {
    border: `1px solid ${COLORS.primary}66`,
    background: COLORS.surfaceMuted,
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  logTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0.8,
  },
  logStatusDraft: {
    color: COLORS.primarySoft,
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  logStatusSaved: {
    color: COLORS.primarySoft,
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  logMemo: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },
  logFooter: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 10px',
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 850,
  },
}

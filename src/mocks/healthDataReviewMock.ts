export type BodyMetrics = {
  weight: number
  fat: number
  bmi: number
  waist: number
}

export type NutritionMetrics = {
  calories: number
  protein: number
  fat: number
  carbs: number
  water: number
}

export type TrainingSet = { weight: number; reps: number }
export type TrainingExercise = {
  name: string
  sets: TrainingSet[]
  plannedOneRm: number
  targetOneRm: number
}
export type TrainingDay = {
  date: string
  burnedCalories: number
  plannedCalories: number
  targetCalories: number
  exercises: TrainingExercise[]
}

const MOCK_DAY_COUNT = 90
const MOCK_START_DATE = new Date(2026, 1, 12)

const BODY_START: BodyMetrics = { weight: 81.8, fat: 26.8, bmi: 25.8, waist: 90.2 }
const BODY_TARGET: BodyMetrics = { weight: 77.0, fat: 23.5, bmi: 24.0, waist: 83.6 }
const NUTRITION_TARGET: NutritionMetrics = { calories: 2100, protein: 156, fat: 56, carbs: 216, water: 2.7 }
const TRAINING_TARGET_RM: Record<string, number> = {
  'Bench Press': 91,
  Squat: 124,
  Deadlift: 154,
  'Lateral Raise': 18,
  OHP: 58,
  Row: 76,
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function roundHalf(value: number) {
  return Math.round(value * 2) / 2
}

function calcOneRm(weight: number, reps: number) {
  return weight * (1 + reps / 30)
}

function plannedBodyValue(key: keyof BodyMetrics, progress: number) {
  return BODY_START[key] + (BODY_TARGET[key] - BODY_START[key]) * progress
}

const mockDates = Array.from({ length: MOCK_DAY_COUNT }, (_, index) => {
  const date = new Date(MOCK_START_DATE)
  date.setDate(MOCK_START_DATE.getDate() + index)
  return `${date.getMonth() + 1}/${date.getDate()}`
})

export const bodyTimeline = mockDates.map((date, index) => {
  const progress = index / (MOCK_DAY_COUNT - 1)
  const weeklyNoise = Math.sin(index * 0.52) * 0.18
  const weekendBounce = index % 9 === 0 ? 0.24 : 0
  const plan: BodyMetrics = {
    weight: round1(plannedBodyValue('weight', progress)),
    fat: round1(plannedBodyValue('fat', progress)),
    bmi: round1(plannedBodyValue('bmi', progress)),
    waist: round1(plannedBodyValue('waist', progress)),
  }

  return {
    date,
    weight: round1(plan.weight + weeklyNoise + weekendBounce),
    fat: round1(plan.fat + Math.sin(index * 0.41) * 0.16),
    bmi: round1(plan.bmi + Math.sin(index * 0.47) * 0.08),
    waist: round1(plan.waist + Math.sin(index * 0.36) * 0.22),
    plan,
    target: BODY_TARGET,
  }
})

export const nutritionTimeline = mockDates.map((date, index) => {
  const progress = index / (MOCK_DAY_COUNT - 1)
  const refeed = index % 13 === 6 ? 180 : 0
  const plan: NutritionMetrics = {
    calories: Math.round(2240 - progress * 150 + (index % 7 === 5 ? 100 : 0)),
    protein: Math.round(136 + progress * 20),
    fat: Math.round(62 - progress * 6 + (index % 7 === 5 ? 3 : 0)),
    carbs: Math.round(232 - progress * 18 + (index % 7 === 5 ? 24 : 0)),
    water: round1(2.1 + progress * 0.5),
  }

  return {
    date,
    calories: Math.round(plan.calories + Math.sin(index * 0.45) * 115 + refeed),
    protein: Math.round(plan.protein + Math.sin(index * 0.37) * 8),
    fat: Math.round(plan.fat + Math.sin(index * 0.31) * 5 + (refeed ? 4 : 0)),
    carbs: Math.round(plan.carbs + Math.cos(index * 0.41) * 18 + (refeed ? 26 : 0)),
    water: round1(plan.water + Math.sin(index * 0.25) * 0.2 + (index % 5 === 0 ? 0.2 : 0)),
    plan,
    target: NUTRITION_TARGET,
  }
})

function makeStrengthSets(base: number, spread = 2.5): TrainingSet[] {
  return [
    { weight: roundHalf(base), reps: 10 },
    { weight: roundHalf(base + spread), reps: 8 },
    { weight: roundHalf(base + spread * 2), reps: 6 },
  ]
}

function makeAccessorySets(base: number): TrainingSet[] {
  return [
    { weight: roundHalf(base), reps: 15 },
    { weight: roundHalf(base + 1), reps: 12 },
    { weight: roundHalf(base + 1.5), reps: 10 },
  ]
}

function estimateTopOneRm(sets: TrainingSet[]) {
  return round1(Math.max(...sets.map((set) => calcOneRm(set.weight, set.reps))))
}

function makeExercise(name: string, actualSets: TrainingSet[], plannedSets: TrainingSet[]): TrainingExercise {
  return {
    name,
    sets: actualSets,
    plannedOneRm: estimateTopOneRm(plannedSets),
    targetOneRm: TRAINING_TARGET_RM[name],
  }
}

function makeTrainingExercises(index: number): TrainingExercise[] {
  if (index % 2 !== 0) return []

  const sessionIndex = Math.floor(index / 2)
  const progress = sessionIndex / Math.max(1, Math.floor(MOCK_DAY_COUNT / 2) - 1)
  const wave = Math.sin(index * 0.34)
  const rotation = sessionIndex % 4

  if (rotation === 0) {
    const benchPlan = makeStrengthSets(56 + progress * 13)
    const squatPlan = makeStrengthSets(76 + progress * 19)

    return [
      makeExercise('Bench Press', makeStrengthSets(56 + progress * 13 + wave * 0.7), benchPlan),
      makeExercise('Squat', makeStrengthSets(76 + progress * 19 + wave * 0.9), squatPlan),
    ]
  }

  if (rotation === 1) {
    const deadliftPlan = makeStrengthSets(94 + progress * 24, 3.75)
    const lateralPlan = makeAccessorySets(8 + progress * 3)

    return [
      makeExercise('Deadlift', makeStrengthSets(94 + progress * 24 + wave * 1.1, 3.75), deadliftPlan),
      makeExercise('Lateral Raise', makeAccessorySets(8 + progress * 3 + wave * 0.25), lateralPlan),
    ]
  }

  if (rotation === 2) {
    const benchPlan = makeStrengthSets(57.5 + progress * 13.5)
    const ohpPlan = makeStrengthSets(32 + progress * 8, 2)

    return [
      makeExercise('Bench Press', makeStrengthSets(57.5 + progress * 13.5 + wave * 0.7), benchPlan),
      makeExercise('OHP', makeStrengthSets(32 + progress * 8 + wave * 0.45, 2), ohpPlan),
    ]
  }

  const squatPlan = makeStrengthSets(78 + progress * 19.5)
  const rowPlan = makeStrengthSets(42 + progress * 10, 2)

  return [
    makeExercise('Squat', makeStrengthSets(78 + progress * 19.5 + wave * 0.9), squatPlan),
    makeExercise('Row', makeStrengthSets(42 + progress * 10 + wave * 0.55, 2), rowPlan),
  ]
}

export const trainingTimeline: TrainingDay[] = mockDates.map((date, index) => {
  const isTrainingDay = index % 2 === 0
  const plannedCalories = isTrainingDay ? Math.round(520 + (index % 8) * 7) : 210
  const burnedCalories = isTrainingDay
    ? Math.round(plannedCalories + Math.sin(index * 0.42) * 42)
    : Math.round(plannedCalories - 20 + Math.sin(index * 0.37) * 24 + (index % 5) * 8)

  return {
    date,
    burnedCalories,
    plannedCalories,
    targetCalories: isTrainingDay ? 560 : 220,
    exercises: makeTrainingExercises(index),
  }
})

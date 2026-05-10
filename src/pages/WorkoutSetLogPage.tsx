import { useEffect, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { ActionButton } from '../ui/ActionButton';
import { AppHeader, MoreDots } from '../ui/AppHeader';
import { AppMain } from '../ui/AppMain';
import { AppShell } from '../ui/AppShell';
import { BottomActionBar } from '../ui/BottomActionBar';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { IconButton } from '../ui/IconButton';
import { SegmentedControl } from '../ui/SegmentedControl';
import { StatusPill } from '../ui/StatusPill';
import { COLORS } from '../ui/tokens';

const ACTIVE_SET_COLOR = COLORS.primary;
const INACTIVE_SET_COLOR = COLORS.inactive;
const EXERCISE_TABS = ['Sets', 'History'] as const;

type ActualField = 'actualWeight' | 'actualReps';

type SetItem = {
  set: number;
  planWeight: number;
  planReps: number;
  actualWeight: number | null;
  actualReps: number | null;
  done: boolean;
  skipped?: boolean;
  note: string;
};

type Exercise = {
  name: string;
  target: string;
  previous: string;
  warmupSets?: SetItem[];
  sets: SetItem[];
};

function readNumericInput(value: string) {
  return value === '' ? 0 : Number(value);
}

function createSetItem(set: number, planWeight: number, planReps: number): SetItem {
  return {
    set,
    planWeight,
    planReps,
    actualWeight: null,
    actualReps: null,
    done: false,
    note: '',
  };
}

function skipSetItem(set: SetItem): SetItem {
  if (set.done || set.skipped) return set;
  return { ...set, skipped: true };
}

const EXERCISE_LIBRARY: Exercise[] = [
  {
    name: 'Shoulder Press',
    target: 'Shoulders',
    previous: '前回 32kg × 10 · 3 sets',
    sets: [createSetItem(1, 32, 10), createSetItem(2, 32, 10), createSetItem(3, 30, 12)],
  },
  {
    name: 'Lateral Raise',
    target: 'Side Delts',
    previous: '前回 10kg × 15 · 3 sets',
    sets: [createSetItem(1, 10, 15), createSetItem(2, 10, 15), createSetItem(3, 8, 18)],
  },
  {
    name: 'Triceps Pushdown',
    target: 'Triceps',
    previous: '前回 22kg × 12 · 3 sets',
    sets: [createSetItem(1, 22, 12), createSetItem(2, 22, 12), createSetItem(3, 20, 15)],
  },
];

export default function WorkoutSetLogPage() {
  const [screen, setScreen] = useState<'list' | 'active'>('list');
  const [exerciseTab, setExerciseTab] = useState<'Sets' | 'History'>('Sets');
  const [activeExerciseName, setActiveExerciseName] = useState('Bench Press');
  const [startedExerciseNames, setStartedExerciseNames] = useState<string[]>([]);
  const [activeWarmupIndexByExercise, setActiveWarmupIndexByExercise] = useState<Record<string, number>>({});
  const [openSet, setOpenSet] = useState(1);
  const [editingWarmupIndex, setEditingWarmupIndex] = useState<number | null>(null);
  const [loggingSet, setLoggingSet] = useState<number | null>(null);
  const [editingActualSet, setEditingActualSet] = useState<number | null>(null);
  const [editingNoteSet, setEditingNoteSet] = useState<number | null>(null);
  const [restingAfterSet, setRestingAfterSet] = useState<number | null>(null);
  const [nextReadySet, setNextReadySet] = useState<number | null>(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const [pendingExerciseName, setPendingExerciseName] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showFinishSummary, setShowFinishSummary] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      name: 'Bench Press',
      target: 'Chest / Push',
      previous: '前回 65kg × 8 · 3 sets',
      warmupSets: [
        createSetItem(0, 40, 10),
        createSetItem(0, 50, 6),
      ],
      sets: [
        createSetItem(1, 60, 10),
        createSetItem(2, 65, 8),
        createSetItem(3, 67.5, 8),
        createSetItem(4, 65, 8),
      ],
    },
    {
      name: 'Incline Dumbbell Press',
      target: 'Upper Chest',
      previous: '前回 22kg × 10 · 3 sets',
      sets: [
        createSetItem(1, 22, 10),
        createSetItem(2, 22, 10),
        createSetItem(3, 20, 12),
      ],
    },
    {
      name: 'Cable Fly',
      target: 'Chest Finish',
      previous: '前回 18kg × 12 · 3 sets',
      sets: [
        createSetItem(1, 18, 12),
        createSetItem(2, 18, 12),
        createSetItem(3, 16, 15),
      ],
    },
  ]);

  const activeExercise = exercises.find((exercise) => exercise.name === activeExerciseName) || exercises[0];
  const isExerciseStarted = startedExerciseNames.includes(activeExerciseName);
  const activeWarmupIndex = activeWarmupIndexByExercise[activeExerciseName] || 0;
  const pendingExercise = pendingExerciseName ? exercises.find((exercise) => exercise.name === pendingExerciseName) : null;
  const activeExerciseIsIncomplete = isExerciseStarted && activeExercise.sets.some((set) => !set.done);
  const totalDone = exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.done).length, 0);
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const unfinishedSets = exercises.reduce(
    (sum, exercise) => sum + exercise.sets.filter((set) => !set.done && !set.skipped).length,
    0
  );
  const availableLibraryExercises = EXERCISE_LIBRARY.filter(
    (libraryExercise) => !exercises.some((exercise) => exercise.name === libraryExercise.name)
  );

  useEffect(() => {
    if (restingAfterSet == null || restSeconds <= 0) return;

    const timer = window.setTimeout(() => {
      setRestSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [restSeconds, restingAfterSet]);

  useEffect(() => {
    if (restingAfterSet == null || restSeconds !== 0) return;
    finishRest(restingAfterSet);
  }, [restSeconds, restingAfterSet]);

  function resetInteractionState({ keepWarmupEditor = false }: { keepWarmupEditor?: boolean } = {}) {
    setLoggingSet(null);
    if (!keepWarmupEditor) setEditingWarmupIndex(null);
    setEditingActualSet(null);
    setEditingNoteSet(null);
    setRestingAfterSet(null);
    setNextReadySet(null);
    setRestSeconds(0);
  }

  function ensureExerciseStarted() {
    setStartedExerciseNames((names) => (names.includes(activeExerciseName) ? names : [...names, activeExerciseName]));
  }

  function updateActiveExercise(updater: (exercise: Exercise) => Exercise) {
    setExercises((currentExercises) =>
      currentExercises.map((exercise) => (exercise.name === activeExerciseName ? updater(exercise) : exercise))
    );
  }

  function updateMainSet(setNumber: number, updater: (set: SetItem) => SetItem) {
    updateActiveExercise((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => (set.set === setNumber ? updater(set) : set)),
    }));
  }

  function updateWarmupSet(index: number, updater: (set: SetItem) => SetItem) {
    updateActiveExercise((exercise) => ({
      ...exercise,
      warmupSets: exercise.warmupSets?.map((set, warmupIndex) => (warmupIndex === index ? updater(set) : set)),
    }));
  }

  function requestExerciseActivation(exerciseName: string) {
    if (exerciseName !== activeExerciseName && activeExerciseIsIncomplete) {
      setPendingExerciseName(exerciseName);
      return;
    }

    activateExercise(exerciseName);
  }

  function activateExercise(exerciseName: string) {
    setPendingExerciseName(null);
    setActiveExerciseName(exerciseName);
    setScreen('active');
    setExerciseTab('Sets');
    resetInteractionState();
    const exercise = exercises.find((item) => item.name === exerciseName);
    const firstOpen = exercise?.sets.find((set) => !set.done && !set.skipped)?.set || 1;
    setOpenSet(firstOpen);
  }

  function completeExercise(exerciseName: string) {
    const exerciseToComplete = exercises.find((exercise) => exercise.name === exerciseName);

    setExercises((currentExercises) =>
      currentExercises.map((exercise) =>
        exercise.name === exerciseName
          ? {
              ...exercise,
              warmupSets: exercise.warmupSets?.map((set) => (set.done ? set : skipSetItem(set))),
              sets: exercise.sets.map((set) => (set.done ? set : skipSetItem(set))),
            }
          : exercise
      )
    );

    setActiveWarmupIndexByExercise((current) => ({
      ...current,
      [exerciseName]: exerciseToComplete?.warmupSets?.length || 0,
    }));
  }

  function openPendingExercise() {
    if (!pendingExerciseName) return;
    activateExercise(pendingExerciseName);
  }

  function completeCurrentExerciseAndOpenPending() {
    if (!pendingExerciseName) return;
    completeExercise(activeExerciseName);
    activateExercise(pendingExerciseName);
  }

  function startExercise() {
    const hasWarmups = Boolean(activeExercise.warmupSets?.length);
    ensureExerciseStarted();
    setEditingWarmupIndex(hasWarmups ? -1 : null);
    setActiveWarmupIndexByExercise((current) => ({
      ...current,
      [activeExerciseName]: Math.max(0, activeExercise.warmupSets?.findIndex((set) => !set.done && !set.skipped) ?? 0),
    }));
    const firstOpen = activeExercise.sets.find((set) => !set.done && !set.skipped)?.set || 1;
    setOpenSet(firstOpen);
    resetInteractionState({ keepWarmupEditor: hasWarmups });
  }

  function completeWarmupSet(targetIndex = activeWarmupIndex) {
    const warmupSets = activeExercise.warmupSets || [];
    const activeWarmup = warmupSets[targetIndex];
    if (!activeWarmup) return;

    updateWarmupSet(targetIndex, (set) => ({
      ...set,
      actualWeight: set.actualWeight ?? set.planWeight,
      actualReps: set.actualReps ?? set.planReps,
      done: true,
      skipped: false,
    }));

    setActiveWarmupIndexByExercise((current) => ({
      ...current,
      [activeExerciseName]: Math.min(warmupSets.length, targetIndex + 1),
    }));

    if (targetIndex + 1 >= warmupSets.length) {
      const firstOpen = activeExercise.sets.find((set) => !set.done && !set.skipped)?.set || 1;
      setOpenSet(firstOpen);
      setEditingWarmupIndex(null);
    }
  }

  function toggleWarmupSet(targetIndex: number) {
    const warmupSets = activeExercise.warmupSets || [];
    const targetWarmup = warmupSets[targetIndex];
    if (!targetWarmup) return;

    const nextDone = !targetWarmup.done;
    updateWarmupSet(targetIndex, (set) => ({
      ...set,
      actualWeight: nextDone ? set.actualWeight ?? set.planWeight : set.actualWeight,
      actualReps: nextDone ? set.actualReps ?? set.planReps : set.actualReps,
      done: nextDone,
      skipped: nextDone ? false : set.skipped,
    }));

    if (nextDone) {
      const nextOpenIndex = warmupSets.findIndex((set, index) => index !== targetIndex && !set.done && !set.skipped);
      setActiveWarmupIndexByExercise((current) => ({
        ...current,
        [activeExerciseName]: nextOpenIndex === -1 ? warmupSets.length : nextOpenIndex,
      }));
      if (nextOpenIndex === -1) {
        setEditingWarmupIndex(null);
      }
    } else {
      setActiveWarmupIndexByExercise((current) => ({
        ...current,
        [activeExerciseName]: targetIndex,
      }));
    }
  }

  function openWarmupEditor(index: number) {
    resetInteractionState();
    setEditingWarmupIndex(index);
  }

  function skipWarmup() {
    updateActiveExercise((exercise) => ({
      ...exercise,
      warmupSets: exercise.warmupSets?.map((set) => (set.done ? set : skipSetItem(set))),
    }));
    setActiveWarmupIndexByExercise((current) => ({
      ...current,
      [activeExerciseName]: activeExercise.warmupSets?.length || 0,
    }));
    setEditingWarmupIndex(null);
  }

  function startLogging(setNumber: number) {
    ensureExerciseStarted();

    if (loggingSet === setNumber) {
      setLoggingSet(null);
      return;
    }

    resetInteractionState();
    setOpenSet(setNumber);
    setLoggingSet(setNumber);
  }

  function completeSet(setNumber: number) {
    const completedSet = activeExercise.sets.find((set) => set.set === setNumber);
    if (!completedSet) return;

    updateMainSet(setNumber, (set) => ({
      ...set,
      actualWeight: set.actualWeight ?? set.planWeight,
      actualReps: set.actualReps ?? set.planReps,
      done: true,
      skipped: false,
    }));
    setLoggingSet(null);
    setEditingWarmupIndex(null);
    setEditingActualSet(null);
    setEditingNoteSet(null);
    setOpenSet(setNumber);
    const isLastSet = setNumber === activeExercise.sets.length;
    if (isLastSet) {
      setRestingAfterSet(null);
      setNextReadySet(null);
    } else {
      setRestingAfterSet(setNumber);
      setNextReadySet(null);
      setRestSeconds(90);
    }
  }

  function finishRest(setNumber: number) {
    setRestingAfterSet(null);
    setNextReadySet(setNumber + 1);
    setOpenSet(setNumber + 1);
    setRestSeconds(0);
  }

  function stopRest() {
    if (restingAfterSet == null) return;
    finishRest(restingAfterSet);
  }

  function adjustRest(seconds: number) {
    setRestSeconds((currentSeconds) => Math.max(0, currentSeconds + seconds));
  }

  function updateSetNote(setNumber: number, note: string) {
    updateMainSet(setNumber, (set) => ({ ...set, note }));
  }

  function updateSetActual(setNumber: number, field: ActualField, value: number) {
    updateMainSet(setNumber, (set) => ({ ...set, [field]: value }));
  }

  function addSet() {
    const lastSet = activeExercise.sets[activeExercise.sets.length - 1];
    const nextSetNumber = (lastSet?.set || 0) + 1;
    const addedSet = createSetItem(
      nextSetNumber,
      lastSet?.actualWeight ?? lastSet?.planWeight ?? 0,
      lastSet?.actualReps ?? lastSet?.planReps ?? 0
    );

    updateActiveExercise((exercise) => ({ ...exercise, sets: [...exercise.sets, addedSet] }));
    ensureExerciseStarted();
    resetInteractionState();
    setOpenSet(nextSetNumber);
    setLoggingSet(nextSetNumber);
  }

  function addExerciseFromLibrary(exercise: Exercise) {
    setExercises((currentExercises) => [...currentExercises, exercise]);
    setShowExercisePicker(false);
    setActiveExerciseName(exercise.name);
    setScreen('active');
    setExerciseTab('Sets');
    resetInteractionState();
    setOpenSet(exercise.sets.find((set) => !set.done && !set.skipped)?.set || 1);
  }

  function saveWorkoutSummary() {
    // Demo UI: future API payload is represented by current state and confirmation copy.
    setShowFinishSummary(false);
  }

  function editWarmup(index: number) {
    if (editingWarmupIndex === index) {
      setEditingWarmupIndex(null);
      return;
    }

    resetInteractionState();
    setEditingWarmupIndex(index);
  }

  function stopWarmupEdit() {
    setEditingWarmupIndex(null);
  }

  function updateWarmupActual(index: number, field: ActualField, value: number) {
    updateWarmupSet(index, (set) => ({ ...set, [field]: value }));
  }

  function goBackFromWorkout() {
    window.history.back();
  }

  return (
    <AppShell phoneStyle={styles.phoneFrame}>
      {screen === 'list' ? (
        <ExerciseListScreen
          exercises={exercises}
          totalDone={totalDone}
          totalSets={totalSets}
          activeExerciseName={activeExerciseName}
          onBack={goBackFromWorkout}
          onActivate={requestExerciseActivation}
          onOpenExercisePicker={() => setShowExercisePicker(true)}
          onOpenFinishSummary={() => setShowFinishSummary(true)}
        />
      ) : (
        <ActiveExerciseScreen
          tab={exerciseTab}
          exercise={activeExercise}
          isExerciseStarted={isExerciseStarted}
          activeWarmupIndex={activeWarmupIndex}
          openSet={openSet}
          loggingSet={loggingSet}
          editingWarmupIndex={editingWarmupIndex}
          editingActualSet={editingActualSet}
          editingNoteSet={editingNoteSet}
          restingAfterSet={restingAfterSet}
          nextReadySet={nextReadySet}
          restSeconds={restSeconds}
          onBack={() => setScreen('list')}
          onStartExercise={startExercise}
          onCompleteWarmupSet={completeWarmupSet}
          onToggleWarmupSet={toggleWarmupSet}
          onSkipWarmup={skipWarmup}
          onOpenWarmupEditor={openWarmupEditor}
          onOpenSet={setOpenSet}
          onStartLogging={startLogging}
          onCancelLogging={() => setLoggingSet(null)}
          onAddSet={addSet}
          onEditWarmup={editWarmup}
          onStopWarmupEdit={stopWarmupEdit}
          onUpdateWarmupActual={updateWarmupActual}
          onStartActualEdit={(setNumber) => {
            if (editingActualSet === setNumber) {
              setEditingActualSet(null);
              return;
            }

            resetInteractionState();
            setOpenSet(setNumber);
            setEditingActualSet(setNumber);
          }}
          onStopActualEdit={() => setEditingActualSet(null)}
          onUpdateActual={updateSetActual}
          onStartNoteEdit={(setNumber) => {
            resetInteractionState();
            setOpenSet(setNumber);
            setEditingNoteSet(setNumber);
          }}
          onStopNoteEdit={() => setEditingNoteSet(null)}
          onUpdateNote={updateSetNote}
          onCompleteSet={completeSet}
          onFinishRest={finishRest}
          onStopRest={stopRest}
          onAdjustRest={adjustRest}
          onChangeTab={setExerciseTab}
        />
      )}
      {pendingExercise ? (
        <ExerciseSwitchModal
          currentExerciseName={activeExercise.name}
          nextExerciseName={pendingExercise.name}
          onStay={() => setPendingExerciseName(null)}
          onOpenAnyway={openPendingExercise}
          onCompleteAndOpen={completeCurrentExerciseAndOpenPending}
        />
      ) : null}
      {showExercisePicker ? (
        <ExercisePickerDialog
          exercises={availableLibraryExercises}
          onAdd={addExerciseFromLibrary}
          onClose={() => setShowExercisePicker(false)}
        />
      ) : null}
      {showFinishSummary ? (
        <FinishWorkoutDialog
          totalDone={totalDone}
          totalSets={totalSets}
          unfinishedSets={unfinishedSets}
          onSave={saveWorkoutSummary}
          onClose={() => setShowFinishSummary(false)}
        />
      ) : null}
    </AppShell>
  );
}

function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack?: () => void }) {
  return (
    <AppHeader
      title={title}
      subtitle={subtitle}
      left={onBack ? <IconButton ariaLabel="種目一覧へ戻る" onClick={onBack}>‹</IconButton> : undefined}
      right={<IconButton ariaLabel="その他の操作"><MoreDots /></IconButton>}
    />
  );
}

function CountPill({
  done,
  total,
  variant,
}: {
  done: number;
  total: number;
  variant: 'session' | 'status';
}) {
  const shellStyle = variant === 'session' ? styles.progressPill : styles.statusProgress;
  const doneStyle = variant === 'session' ? styles.progressBig : styles.statusProgressDone;
  const totalStyle = variant === 'session' ? styles.progressSmall : styles.statusProgressTotal;

  return (
    <div style={shellStyle}>
      <span style={doneStyle}>{done}</span>
      <span style={totalStyle}>/{total}</span>
    </div>
  );
}

function ExerciseListScreen({
  exercises,
  totalDone,
  totalSets,
  onBack,
  onActivate,
  activeExerciseName,
  onOpenExercisePicker,
  onOpenFinishSummary,
}:{
  exercises: Exercise[];
  totalDone: number;
  totalSets: number;
  activeExerciseName: string;
  onBack: () => void;
  onActivate: (exerciseName: string) => void;
  onOpenExercisePicker: () => void;
  onOpenFinishSummary: () => void;
}) {
  return (
    <>
      <ScreenHeader title="Workout" subtitle="Push Day · Today" onBack={onBack} />

      <AppMain withBottomNav style={styles.content}>
        <section style={styles.sessionCard}>
          <div>
            <div style={styles.kicker}>TODAY'S EXERCISES</div>
            <div style={styles.sessionTitle}>Choose what’s open</div>
          </div>
          <CountPill done={totalDone} total={totalSets} variant="session" />
        </section>

        {exercises.map((exercise) => (
          <ExerciseListCard
            key={exercise.name}
            exercise={exercise}
            isActive={exercise.name === activeExerciseName}
            onActivate={() => onActivate(exercise.name)}
          />
        ))}

        <BottomActionBar>
          <ActionButton variant="ghost" onClick={onOpenExercisePicker}>＋ Exercise</ActionButton>
          <ActionButton variant="primary" onClick={onOpenFinishSummary}>Finish Workout</ActionButton>
        </BottomActionBar>
      </AppMain>
    </>
  );
}

function ExerciseListCard({ exercise, isActive, onActivate }:{
  exercise: Exercise;
  isActive: boolean;
  onActivate: () => void;
}) {
  const doneCount = exercise.sets.filter((set) => set.done).length;
  const complete = exercise.sets.every((set) => set.done || set.skipped);
  const statusColor = complete ? COLORS.success : isActive ? ACTIVE_SET_COLOR : COLORS.textSecondary;
  const statusBadgeText = `${doneCount}/${exercise.sets.length}`;
  const buttonLabel = 'Open';
  const cardStyle = isActive ? { ...styles.exerciseCard, background: COLORS.surfaceMuted, border: `1px solid ${ACTIVE_SET_COLOR}55`, boxShadow: '0 0 0 1px rgba(255,107,44,0.18)' } : styles.exerciseCard;

  return (
    <section onClick={onActivate} style={{ ...cardStyle, cursor: 'pointer' }}>
      <div style={styles.exerciseHeader}>
        <div>
          <h2 style={styles.exerciseName}>{exercise.name}</h2>
        </div>
        <StatusPill style={{ color: statusColor, borderColor: complete ? `${COLORS.success}55` : `${statusColor}55` }}>
          {statusBadgeText}
        </StatusPill>
      </div>

      <TodaySetsPanel
        sets={exercise.sets}
        buttonLabel={buttonLabel}
        onOpen={(event) => {
          event.stopPropagation();
          onActivate();
        }}
      />
    </section>
  );
}

function TodaySetsPanel({
  sets,
  buttonLabel,
  onOpen,
}: {
  sets: SetItem[];
  buttonLabel: string;
  onOpen: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div style={styles.nextPreview}>
      <div style={styles.nextPreviewLabel}>TODAY'S SETS</div>
      <div style={styles.plannedSetsRow}>
        <div style={styles.plannedSetList}>
          {sets.map((set) => (
            <PlannedSetChip key={set.set} set={set} />
          ))}
        </div>
        <button onClick={onOpen} style={{ ...styles.activateButton, background: ACTIVE_SET_COLOR }}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function ExerciseSwitchModal({
  currentExerciseName,
  nextExerciseName,
  onStay,
  onOpenAnyway,
  onCompleteAndOpen,
}: {
  currentExerciseName: string;
  nextExerciseName: string;
  onStay: () => void;
  onOpenAnyway: () => void;
  onCompleteAndOpen: () => void;
}) {
  return (
    <ConfirmDialog
      eyebrow="EXERCISE IN PROGRESS"
      title={`${currentExerciseName} is still open`}
      labelledBy="exercise-switch-title"
      actions={[
        { label: 'Skip Rest & Open', onClick: onCompleteAndOpen, variant: 'primary' },
        { label: 'Open Anyway', onClick: onOpenAnyway, variant: 'secondary' },
        { label: 'Stay', onClick: onStay, variant: 'ghost' },
      ]}
    >
      {nextExerciseName} を開きますか？未完了セットを残したまま移動するか、未完了分を skipped として残して移動できます。
    </ConfirmDialog>
  );
}

function ExercisePickerDialog({
  exercises,
  onAdd,
  onClose,
}: {
  exercises: Exercise[];
  onAdd: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  return (
    <ConfirmDialog
      eyebrow="EXERCISE LIBRARY"
      title="Add an exercise"
      actions={[{ label: 'Close', onClick: onClose, variant: 'ghost' }]}
    >
      <div style={styles.dialogStack}>
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <button key={exercise.name} type="button" onClick={() => onAdd(exercise)} style={styles.dialogOption}>
              <span style={styles.dialogOptionTitle}>{exercise.name}</span>
              <span style={styles.dialogOptionMeta}>{exercise.target} · {exercise.sets.length} sets</span>
            </button>
          ))
        ) : (
          <span style={styles.dialogEmpty}>追加できる既存種目はありません。</span>
        )}
      </div>
    </ConfirmDialog>
  );
}

function FinishWorkoutDialog({
  totalDone,
  totalSets,
  unfinishedSets,
  onSave,
  onClose,
}: {
  totalDone: number;
  totalSets: number;
  unfinishedSets: number;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <ConfirmDialog
      eyebrow="SESSION SAVE"
      title="Finish Workout"
      actions={[
        { label: 'Save Session', onClick: onSave, variant: 'primary' },
        { label: 'Keep Editing', onClick: onClose, variant: 'ghost' },
      ]}
    >
      {totalDone}/{totalSets} sets done. 未完了セットは {unfinishedSets} 件あります。保存時はplan/actual/done/skipped、休憩、メモ、未完了項目をsession payloadとして保持する想定です。
    </ConfirmDialog>
  );
}

function PlannedSetChip({ set }: { set: SetItem }) {
  return (
    <span style={set.done || set.skipped ? styles.plannedSetDone : styles.plannedSet}>
      <span style={styles.plannedSetIndex}>{set.set}</span>
      <span>{set.skipped ? 'Skipped' : `${set.planWeight}kg × ${set.planReps}`}</span>
    </span>
  );
}

function WarmupStatusRow({
  set,
  index,
  isCurrent,
  isEditing,
  onOpen,
  onToggle,
  onUpdateActual,
}: {
  set: SetItem;
  index: number;
  isCurrent: boolean;
  isEditing: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onUpdateActual: (index: number, field: ActualField, value: number) => void;
}) {
  const warmupValue = `${set.actualWeight ?? set.planWeight}kg × ${set.actualReps ?? set.planReps}`;

  return (
    <div style={styles.statusWarmupItemWrap}>
      <button
        onClick={onOpen}
        style={isCurrent ? { ...styles.warmupItemButton, color: COLORS.textPrimary } : styles.warmupItemButton}
      >
        <span style={styles.warmupLabel}>Warm-up {index + 1}</span>
        <span style={styles.warmupValue}>{set.skipped ? 'Skipped' : warmupValue}</span>
        <span
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          style={set.done ? styles.warmupCheckDone : set.skipped ? styles.warmupCheckSkipped : isCurrent ? styles.warmupCheckCurrent : styles.warmupCheck}
        >
          ✓
        </span>
      </button>
      {isEditing ? (
        <div style={styles.statusWarmupEditor}>
          <MetricInputs
            variant="compact"
            weight={set.actualWeight ?? set.planWeight}
            reps={set.actualReps ?? set.planReps}
            onWeightChange={(value) => onUpdateActual(index, 'actualWeight', value)}
            onRepsChange={(value) => onUpdateActual(index, 'actualReps', value)}
          />
        </div>
      ) : null}
    </div>
  );
}

function ActiveExerciseScreen({
  exercise,
  isExerciseStarted,
  activeWarmupIndex,
  tab,
  openSet,
  loggingSet,
  editingWarmupIndex,
  editingActualSet,
  editingNoteSet,
  restingAfterSet,
  nextReadySet,
  restSeconds,
  onBack,
  onStartExercise,
  onCompleteWarmupSet,
  onToggleWarmupSet,
  onSkipWarmup,
  onOpenWarmupEditor,
  onChangeTab,
  onOpenSet,
  onStartLogging,
  onCancelLogging,
  onAddSet,
  onEditWarmup,
  onStopWarmupEdit,
  onUpdateWarmupActual,
  onStartActualEdit,
  onStopActualEdit,
  onUpdateActual,
  onStartNoteEdit,
  onStopNoteEdit,
  onUpdateNote,
  onCompleteSet,
  onFinishRest,
  onStopRest,
  onAdjustRest,
}: {
  exercise: Exercise;
  isExerciseStarted: boolean;
  activeWarmupIndex: number;
  tab: 'Sets' | 'History';
  openSet: number;
  loggingSet: number | null;
  editingWarmupIndex: number | null;
  editingActualSet: number | null;
  editingNoteSet: number | null;
  restingAfterSet: number | null;
  nextReadySet: number | null;
  restSeconds: number;
  onBack: () => void;
  onStartExercise: () => void;
  onCompleteWarmupSet: (index?: number) => void;
  onToggleWarmupSet: (index: number) => void;
  onSkipWarmup: () => void;
  onOpenWarmupEditor: (index: number) => void;
  onChangeTab: (tab: 'Sets' | 'History') => void;
  onOpenSet: (set: number) => void;
  onStartLogging: (set: number) => void;
  onCancelLogging: () => void;
  onAddSet: () => void;
  onEditWarmup: (index: number) => void;
  onStopWarmupEdit: () => void;
  onUpdateWarmupActual: (index: number, field: ActualField, value: number) => void;
  onStartActualEdit: (set: number) => void;
  onStopActualEdit: () => void;
  onUpdateActual: (set: number, field: ActualField, value: number) => void;
  onStartNoteEdit: (set: number) => void;
  onStopNoteEdit: () => void;
  onUpdateNote: (set: number, note: string) => void;
  onCompleteSet: (set: number) => void;
  onFinishRest: (set: number) => void;
  onStopRest: () => void;
  onAdjustRest: (seconds: number) => void;
}) {
  const doneCount = exercise.sets.filter((set) => set.done).length;
  const complete = doneCount === exercise.sets.length;
  const restNextSet = restingAfterSet != null ? exercise.sets.find((set) => set.set === restingAfterSet + 1) : null;
  const restSet = restingAfterSet != null ? exercise.sets.find((set) => set.set === restingAfterSet) : null;
  const activeLoggingSet = loggingSet != null ? exercise.sets.find((set) => set.set === loggingSet) : null;
  const readySet = nextReadySet != null ? exercise.sets.find((set) => set.set === nextReadySet) : null;
  const nextSet = exercise.sets.find((set) => set.set === openSet && !set.done && !set.skipped) || exercise.sets.find((set) => !set.done && !set.skipped);
  const hasWarmupSets = Boolean(exercise.warmupSets?.length);
  const warmupSets = exercise.warmupSets || [];
  const warmupComplete = hasWarmupSets && warmupSets.every((set) => set.done || set.skipped);
  const isWarmupActive = isExerciseStarted && hasWarmupSets && !warmupComplete && activeWarmupIndex < warmupSets.length;
  const focusedSet = isExerciseStarted ? activeLoggingSet || readySet || nextSet : null;
  const hasEarlierOpenSets = focusedSet ? exercise.sets.some((set) => set.set < focusedSet.set && !set.done && !set.skipped) : false;
  const formattedRestTime = `${Math.floor(restSeconds / 60).toString().padStart(2, '0')}:${(restSeconds % 60).toString().padStart(2, '0')}`;
  const statusTitle = !isExerciseStarted
    ? 'Ready to activate'
    : isWarmupActive
      ? 'Warm-up'
    : complete
    ? 'All sets complete'
    : restingAfterSet
      ? 'Rest timer running'
      : activeLoggingSet
        ? `Set ${activeLoggingSet.set} ready`
        : readySet
          ? `Set ${readySet.set} is ready`
          : doneCount === 0
            ? 'Ready to begin'
            : nextSet
              ? `Set ${nextSet.set} is up next`
              : 'Ready';
  const statusMeta = !isExerciseStarted
    ? ''
    : isWarmupActive
      ? ''
    : hasEarlierOpenSets
    ? 'Earlier sets are still open'
    : complete
    ? ''
    : restingAfterSet && restNextSet
      ? `Next: Set ${restNextSet.set} · ${restNextSet.planWeight}kg × ${restNextSet.planReps}`
      : activeLoggingSet
        ? ''
        : readySet
          ? `${readySet.planWeight}kg × ${readySet.planReps}`
          : nextSet
            ? `${nextSet.planWeight}kg × ${nextSet.planReps}`
            : 'セットを選択してください';

  return (
    <>
      <ScreenHeader title={exercise.name} subtitle={exercise.target} onBack={onBack} />

      <AppMain withBottomNav style={styles.content}>
        <section style={styles.activeTopCard}>
          <div style={styles.activeTopCardHeader}>
            <div>
              <div style={styles.statusKicker}>WORKOUT STATUS</div>
              <div style={styles.statusTitle}>{statusTitle}</div>
              {statusMeta ? <div style={styles.statusMeta}>{statusMeta}</div> : null}
            </div>
            <CountPill done={doneCount} total={exercise.sets.length} variant="status" />
          </div>
          {!isExerciseStarted ? (
            <>
              <button onClick={onStartExercise} style={styles.statusStartButton}>Start Exercise</button>
            </>
          ) : isWarmupActive ? (
            <div style={styles.warmupPanel}>
              <div style={styles.warmupList}>
                {warmupSets.map((set, index) => {
                  return (
                    <WarmupStatusRow
                      key={`${set.planWeight}-${set.planReps}-${index}`}
                      set={set}
                      index={index}
                      isCurrent={index === activeWarmupIndex}
                      isEditing={editingWarmupIndex === index}
                      onOpen={() => onOpenWarmupEditor(index)}
                      onToggle={() => onToggleWarmupSet(index)}
                      onUpdateActual={onUpdateWarmupActual}
                    />
                  );
                })}
              </div>
              <div style={styles.warmupActions}>
                <button onClick={onSkipWarmup} style={styles.warmupSkipButton}>Skip</button>
                <button onClick={() => onCompleteWarmupSet(editingWarmupIndex != null && editingWarmupIndex >= 0 ? editingWarmupIndex : undefined)} style={styles.statusStartButton}>Done</button>
              </div>
            </div>
          ) : complete ? (
            <div style={styles.statusCompletePanel}>
              <div style={styles.statusCompleteMark}>✓</div>
              <div style={styles.statusPanelTitle}>Exercise complete</div>
            </div>
          ) : restingAfterSet && restSet ? (
            <div style={styles.activeTopRestContent}>
              <div style={styles.inlineRestTimeRow}>
                <button onClick={() => onAdjustRest(-30)} style={styles.restMiniButtonCompact}>-30s</button>
                <div style={styles.inlineRestTime}>{formattedRestTime}</div>
                <button onClick={() => onAdjustRest(30)} style={styles.restMiniButtonCompact}>+30s</button>
              </div>
              <div style={styles.inlineRestActions}>
                <button onClick={onStopRest} style={{ ...styles.restMainButton, background: COLORS.danger }}>Stop</button>
                <button onClick={() => onFinishRest(restSet.set)} style={{ ...styles.restMainButton, background: ACTIVE_SET_COLOR }}>Done</button>
              </div>
            </div>
          ) : null}
        </section>

        <SegmentedControl
          items={EXERCISE_TABS}
          value={tab}
          onChange={onChangeTab}
          ariaLabel="種目詳細タブ"
          style={styles.segmentedControl}
        />

        {tab === 'Sets' ? (
          <>
              <section style={styles.exerciseCard}>
                <div style={styles.setHeaderTitle}>{exercise.name}</div>
                <div style={styles.tableHeader}>
                  <div>SET</div>
                  <div>PLAN</div>
                  <div>ACTUAL</div>
                  <div></div>
              </div>

              <div style={styles.setList}>
                {warmupSets.length > 0 ? (
                  <WarmupSummaryRow
                    warmupSets={warmupSets}
                    canEdit={isExerciseStarted}
                    isActive={isWarmupActive}
                    isEditing={editingWarmupIndex === -1}
                    onToggle={() => onEditWarmup(-1)}
                    onStopEdit={onStopWarmupEdit}
                    onUpdateActual={onUpdateWarmupActual}
                  />
                ) : null}
                {exercise.sets.map((set) => (
                  <SetRow
                    key={set.set}
                    set={set}
                    isActiveSet={isExerciseStarted && !isWarmupActive && (openSet === set.set || loggingSet === set.set || editingActualSet === set.set || editingNoteSet === set.set || restingAfterSet === set.set)}
                    isOpen={openSet === set.set}
                    isLogging={loggingSet === set.set}
                    isEditingActual={editingActualSet === set.set}
                    isEditingNote={editingNoteSet === set.set}
                    canEdit={isExerciseStarted && !isWarmupActive}
                    hasEarlierOpenSets={exercise.sets.some((item) => item.set < set.set && !item.done && !item.skipped)}
                    onStartLogging={() => {
                      onOpenSet(set.set);
                      onStartLogging(set.set);
                    }}
                    onCancelLogging={onCancelLogging}
                    onStartActualEdit={() => onStartActualEdit(set.set)}
                    onStopActualEdit={onStopActualEdit}
                    onUpdateActual={(field, value) => onUpdateActual(set.set, field, value)}
                    onStartNoteEdit={() => onStartNoteEdit(set.set)}
                    onStopNoteEdit={onStopNoteEdit}
                    onUpdateNote={(note) => onUpdateNote(set.set, note)}
                    onCompleteSet={() => onCompleteSet(set.set)}
                  />
                ))}
              </div>

              <button onClick={onAddSet} style={{ ...styles.addSetButton, color: ACTIVE_SET_COLOR, borderColor: `${ACTIVE_SET_COLOR}33` }}>＋ Add Set</button>
            </section>
          </>
        ) : (
          <ExerciseHistoryPanel exercise={exercise} />
        )}
      </AppMain>
    </>
  );
}

function ExerciseHistoryPanel({ exercise }: { exercise: Exercise }) {
  const historySessions = ['2026.05.04', '2026.04.27', '2026.04.20'].map((date, sessionIndex) => ({
    date,
    sets: exercise.sets.map((set) => ({
      ...set,
      planWeight: Math.max(0, set.planWeight - sessionIndex * 2.5),
      actualWeight: Math.max(0, (set.actualWeight ?? set.planWeight) - sessionIndex * 2.5),
      actualReps: Math.max(1, (set.actualReps ?? set.planReps) - (sessionIndex === 2 ? 1 : 0)),
    })),
  }));

  return (
    <div style={styles.historyStack}>
      {historySessions.map((session) => (
        <section key={session.date} style={styles.historyPanel}>
          <div style={styles.historyTitle}>{session.date}</div>
          <div style={styles.tableHeader}>
            <div>SET</div>
            <div>PLAN</div>
            <div>ACTUAL</div>
            <div></div>
          </div>
          <div style={styles.setList}>
            {session.sets.map((set) => (
              <div key={set.set} style={styles.historySetRow}>
                <div style={styles.setNumber}>{set.set}</div>
                <div style={styles.planCell}>
                  <WeightReps weight={set.planWeight} reps={set.planReps} active />
                </div>
                <div style={styles.actualCellDoneActive}>
                  <WeightReps weight={set.actualWeight} reps={set.actualReps} active />
                </div>
                <div></div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function WeightReps({ weight, reps, active }: { weight: number | null; reps: number | null; active: boolean }) {
  return (
    <span style={styles.weightReps}>
      <span style={styles.weightRepsWeight}>
        <span style={active ? styles.weight : styles.weightInactive}>{weight}</span><span style={styles.unit}>kg</span>
      </span>
      <span style={styles.dot}>×</span>
      <span style={active ? styles.reps : styles.repsInactive}>{reps}</span>
    </span>
  );
}

function PanelHeader({
  label,
  color,
  actionLabel,
  onAction,
}: {
  label: string;
  color: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div style={styles.loggingHeader}>
      <div style={{ ...styles.noteLabel, color }}>{label}</div>
      <button onClick={onAction} style={styles.editNote}>{actionLabel}</button>
    </div>
  );
}

function MetricInputs({
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  variant = 'card',
}: {
  weight: number | null;
  reps: number | null;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  variant?: 'card' | 'compact';
}) {
  const inputShellStyle = variant === 'compact' ? styles.statusWarmupInput : styles.fakeInput;

  return (
    <div style={styles.inputGrid}>
      <label style={inputShellStyle}>
        <div style={styles.fakeInputLabel}>Weight</div>
        <input
          type="text"
          inputMode="decimal"
          step="0.5"
          value={weight ?? ''}
          onChange={(event) => onWeightChange(readNumericInput(event.target.value))}
          style={styles.actualInput}
        />
      </label>
      <label style={inputShellStyle}>
        <div style={styles.fakeInputLabel}>Reps</div>
        <input
          type="text"
          inputMode="numeric"
          step="1"
          value={reps ?? ''}
          onChange={(event) => onRepsChange(readNumericInput(event.target.value))}
          style={styles.actualInput}
        />
      </label>
    </div>
  );
}

function SetNoteInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (note: string) => void;
}) {
  return (
    <label style={styles.noteInputWrap}>
      <span style={styles.fakeInputLabel}>Set note</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={styles.noteTextarea}
      />
    </label>
  );
}

function WarmupSummaryRow({
  warmupSets,
  canEdit,
  isActive,
  isEditing,
  onToggle,
  onStopEdit,
  onUpdateActual,
}: {
  warmupSets: SetItem[];
  canEdit: boolean;
  isActive: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onStopEdit: () => void;
  onUpdateActual: (index: number, field: ActualField, value: number) => void;
}) {
  const doneCount = warmupSets.filter((set) => set.done).length;
  const skippedCount = warmupSets.filter((set) => set.skipped).length;
  const actualLabel = doneCount + skippedCount === warmupSets.length
    ? skippedCount > 0 ? `${skippedCount} skipped` : 'Done'
    : `${doneCount}/${warmupSets.length} done`;

  return (
    <div style={styles.setRowWrap}>
      <div onClick={canEdit ? onToggle : undefined} style={isEditing ? { ...styles.setRow, borderColor: `${ACTIVE_SET_COLOR}88`, cursor: canEdit ? 'pointer' : 'default' } : { ...styles.setRow, cursor: canEdit ? 'pointer' : 'default' }}>
        <div style={isActive || isEditing ? { ...styles.setNumber, background: ACTIVE_SET_COLOR, color: COLORS.onPrimary } : styles.setNumber}>W</div>
        <div style={styles.planCell}>
          <span style={isEditing ? styles.weight : styles.weightInactive}>{warmupSets.length}</span><span style={styles.unit}> warm-ups</span>
        </div>
        <div style={styles.actualCellDoneInactive}>
          <span style={isEditing ? styles.weight : styles.weightInactive}>{actualLabel}</span>
        </div>
        {canEdit ? <div style={isEditing ? { ...styles.editActualIndicator, background: ACTIVE_SET_COLOR, color: COLORS.onPrimary } : styles.editActualIndicator}><span style={styles.pencilIcon}>✎</span></div> : null}
      </div>

      {isEditing ? (
        <div style={styles.loggingCard}>
          <PanelHeader label="EDIT WARM-UP" color={ACTIVE_SET_COLOR} actionLabel="Done" onAction={onStopEdit} />
          <div style={styles.warmupEditList}>
            {warmupSets.map((set, index) => (
              <div key={`${set.planWeight}-${set.planReps}-${index}`} style={styles.warmupEditItem}>
                <div style={styles.warmupEditTitle}>Warm-up {index + 1}</div>
                <MetricInputs
                  weight={set.actualWeight ?? set.planWeight}
                  reps={set.actualReps ?? set.planReps}
                  onWeightChange={(value) => onUpdateActual(index, 'actualWeight', value)}
                  onRepsChange={(value) => onUpdateActual(index, 'actualReps', value)}
                />
              </div>
            ))}
          </div>
          <button onClick={onStopEdit} style={{ ...styles.completeSetButton, background: ACTIVE_SET_COLOR }}>Done Editing</button>
        </div>
      ) : null}
    </div>
  );
}

function setRowStyle({
  hasActualValue,
  isExpanded,
  rowColor,
  canEdit,
}: {
  hasActualValue: boolean;
  isExpanded: boolean;
  rowColor: string;
  canEdit: boolean;
}): CSSProperties {
  const baseStyle = hasActualValue ? styles.setRow : styles.setRowPending;
  const isActive = rowColor === ACTIVE_SET_COLOR;

  return {
    ...baseStyle,
    background: isActive ? COLORS.surfaceRaised : baseStyle.background,
    ...(isExpanded ? { borderColor: `${rowColor}88` } : {}),
    cursor: canEdit ? 'pointer' : 'default',
  };
}

function SetRow({
  set,
  setLabel,
  isActiveSet,
  isOpen,
  isLogging,
  isEditingActual,
  isEditingNote,
  canEdit,
  hasEarlierOpenSets,
  onStartLogging,
  onCancelLogging,
  onStartActualEdit,
  onStopActualEdit,
  onUpdateActual,
  onStartNoteEdit,
  onStopNoteEdit,
  onUpdateNote,
  onCompleteSet,
}: {
  set: SetItem;
  setLabel?: string;
  isActiveSet: boolean;
  isOpen: boolean;
  isLogging: boolean;
  isEditingActual: boolean;
  isEditingNote: boolean;
  canEdit: boolean;
  hasEarlierOpenSets: boolean;
  onStartLogging: () => void;
  onCancelLogging: () => void;
  onStartActualEdit: () => void;
  onStopActualEdit: () => void;
  onUpdateActual: (field: ActualField, value: number) => void;
  onStartNoteEdit: () => void;
  onStopNoteEdit: () => void;
  onUpdateNote: (note: string) => void;
  onCompleteSet: () => void;
}) {
  const rowColor = isActiveSet ? ACTIVE_SET_COLOR : INACTIVE_SET_COLOR;
  const hasActualValue = set.done || set.skipped || setLabel === 'W';
  const isExpanded = isLogging || isEditingActual || isEditingNote;
  const handleRowToggle = setLabel === 'W' || set.done ? onStartActualEdit : onStartLogging;
  const handleRowClick = canEdit ? handleRowToggle : undefined;

  return (
    <div style={styles.setRowWrap}>
      <div onClick={handleRowClick} style={setRowStyle({ hasActualValue, isExpanded, rowColor, canEdit })}>
        <button type="button" style={isActiveSet ? { ...styles.setNumber, background: rowColor, color: COLORS.onPrimary } : styles.setNumber}>{setLabel || set.set}</button>

        <button type="button" style={isActiveSet ? { ...styles.planCellButton, color: COLORS.textSecondary } : { ...styles.planCellButton, color: COLORS.inactive }}>
          <WeightReps weight={set.planWeight} reps={set.planReps} active={isActiveSet} />
        </button>

        <button
          type="button"
          style={hasActualValue ? (isActiveSet ? styles.actualCellDoneActive : styles.actualCellDoneInactive) : (isActiveSet ? styles.actualCellEmpty : styles.actualCellEmptyInactive)}
        >
          {hasActualValue ? (
            <>
              {set.skipped ? <span style={styles.emptyTextInactive}>Skipped</span> : <WeightReps weight={set.actualWeight ?? set.planWeight} reps={set.actualReps ?? set.planReps} active={isActiveSet} />}
            </>
          ) : (
            <span style={isActiveSet ? styles.emptyText : styles.emptyTextInactive}>—</span>
          )}
        </button>

        {hasActualValue ? <div style={isActiveSet ? { ...styles.editActualIndicator, background: ACTIVE_SET_COLOR, color: COLORS.onPrimary } : styles.editActualIndicator}><span style={styles.pencilIcon}>✎</span></div> : null}
      </div>

      {isEditingActual && hasActualValue && (
        <div style={styles.loggingCard}>
          <PanelHeader label="EDIT ACTUAL" color={rowColor} actionLabel="Done" onAction={onStopActualEdit} />
          <MetricInputs
            weight={set.actualWeight ?? set.planWeight}
            reps={set.actualReps ?? set.planReps}
            onWeightChange={(value) => onUpdateActual('actualWeight', value)}
            onRepsChange={(value) => onUpdateActual('actualReps', value)}
          />
          <SetNoteInput
            value={set.note}
            onChange={onUpdateNote}
            placeholder="このセットの感覚を残す"
          />
          <button onClick={onStopActualEdit} style={{ ...styles.completeSetButton, background: rowColor }}>Done Editing</button>
        </div>
      )}

      {isLogging && !set.done && !isEditingActual && (
        <div style={styles.loggingCard}>
          <PanelHeader label="READY" color={rowColor} actionLabel="Cancel" onAction={onCancelLogging} />
          {hasEarlierOpenSets ? <div style={styles.inlineWarning}>Earlier sets are still open</div> : null}
          <MetricInputs
            weight={set.actualWeight ?? set.planWeight}
            reps={set.actualReps ?? set.planReps}
            onWeightChange={(value) => onUpdateActual('actualWeight', value)}
            onRepsChange={(value) => onUpdateActual('actualReps', value)}
          />
          <SetNoteInput
            value={set.note}
            onChange={onUpdateNote}
            placeholder="例: 最後の2repが重い / フォーム安定"
          />
          <button onClick={onCompleteSet} style={{ ...styles.completeSetButton, background: rowColor }}>Complete Set</button>
        </div>
      )}

      {isEditingNote && !isLogging && (
        <div style={styles.noteCard}>
          <PanelHeader label={`SET ${set.set} NOTE`} color={rowColor} actionLabel="Done" onAction={onStopNoteEdit} />
          <textarea
            autoFocus
            value={set.note}
            onChange={(event) => onUpdateNote(event.target.value)}
            placeholder="このセットの感覚を残す"
            style={styles.noteTextarea}
          />
        </div>
      )}

      {isOpen && !isLogging && !isEditingNote && set.note && (
        <div style={styles.noteCard}>
          <PanelHeader label={`SET ${set.set} NOTE`} color={rowColor} actionLabel="Edit" onAction={onStartNoteEdit} />
          <p style={styles.noteText}>{set.note}</p>
        </div>
      )}

    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  phoneFrame: { borderRadius: 34, display: 'flex', flexDirection: 'column' },
  page: { minHeight: '100vh', background: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, boxSizing: 'border-box', color: COLORS.textPrimary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif' },
  phone: { width: '100%', maxWidth: 430, height: 820, background: COLORS.background, borderRadius: 34, overflow: 'hidden', border: `1px solid ${COLORS.border}`, boxShadow: '0 28px 90px rgba(0,0,0,0.58)', position: 'relative', display: 'flex', flexDirection: 'column' },
  header: { height: 112, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 18px 0', boxSizing: 'border-box' },
  circleButton: { width: 50, height: 50, borderRadius: 999, border: `1px solid ${COLORS.borderStrong}`, background: COLORS.surfaceRaised, color: COLORS.textPrimary, fontSize: 32, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  moreDots: { display: 'block', fontSize: 18, letterSpacing: 2, transform: 'translateX(1px) translateY(-1px)' },
  headerCenter: { textAlign: 'center' },
  title: { fontSize: 21, fontWeight: 800, letterSpacing: -0.4 },
  subtitle: { marginTop: 8, fontSize: 13, color: COLORS.textSecondary },
  content: { flex: 1, overflowY: 'auto', padding: '8px 18px 28px', boxSizing: 'border-box', scrollbarWidth: 'none' },
  sessionCard: { background: COLORS.surface, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 24, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 14px 34px rgba(0,0,0,0.32)', marginBottom: 18 },
  activeTopCard: { background: COLORS.surface, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 24, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 14px 34px rgba(0,0,0,0.32)', marginBottom: 18, position: 'sticky', top: 0, zIndex: 4 },
  activeTopCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, textAlign: 'left' },
  statusKicker: { color: COLORS.primary, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 },
  statusTitle: { marginTop: 6, fontSize: 21, fontWeight: 850, letterSpacing: -0.4, textAlign: 'left' },
  statusMeta: { marginTop: 6, color: COLORS.textSecondary, fontSize: 13, fontWeight: 750, lineHeight: 1.25 },
  statusProgress: { minWidth: 64, height: 48, borderRadius: 18, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'baseline', justifyContent: 'center', paddingTop: 11, boxSizing: 'border-box' },
  statusProgressDone: { color: COLORS.primary, fontSize: 25, fontWeight: 900, letterSpacing: -0.4 },
  statusProgressTotal: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 800 },
  statusNextPanel: { padding: '4px 0 0', display: 'grid', gridTemplateColumns: '64px 1fr 84px', alignItems: 'center', gap: 10 },
  statusNextSet: { color: COLORS.primary, fontSize: 15, fontWeight: 900 },
  statusNextLoad: { color: COLORS.textPrimary, whiteSpace: 'nowrap' },
  statusNextNumber: { fontSize: 24, fontWeight: 900, letterSpacing: -0.3 },
  statusNextUnit: { marginLeft: 2, color: COLORS.textSecondary, fontSize: 12, fontWeight: 800 },
  statusNextDivider: { margin: '0 7px', color: COLORS.textMuted, fontSize: 13, fontWeight: 900 },
  statusLogButton: { height: 36, borderRadius: 999, border: 0, background: ACTIVE_SET_COLOR, color: COLORS.onPrimary, fontSize: 13, fontWeight: 900 },
  warmupPanel: { display: 'grid', gap: 14 },
  warmupList: { display: 'grid', gap: 8 },
  statusWarmupItemWrap: { display: 'grid', gap: 8 },
  warmupItem: { display: 'grid', gridTemplateColumns: '1fr auto 24px', alignItems: 'center', gap: 10, color: COLORS.textSecondary, fontSize: 14, fontWeight: 800 },
  warmupItemButton: { display: 'grid', gridTemplateColumns: '1fr auto 24px', alignItems: 'center', gap: 10, width: '100%', border: 0, outline: 0, background: 'transparent', color: COLORS.textSecondary, fontSize: 14, fontWeight: 800, fontFamily: 'inherit', padding: 0, cursor: 'pointer' },
  statusWarmupEditor: { paddingLeft: 34 },
  statusWarmupInput: { display: 'block', background: COLORS.surfaceRaised, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 10 },
  warmupCheck: { width: 22, height: 22, borderRadius: 999, background: COLORS.surfaceRaised, color: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 },
  warmupCheckCurrent: { width: 22, height: 22, borderRadius: 999, background: 'rgba(255,107,44,0.18)', color: ACTIVE_SET_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 },
  warmupCheckDone: { width: 22, height: 22, borderRadius: 999, background: ACTIVE_SET_COLOR, color: COLORS.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 },
  warmupCheckSkipped: { width: 22, height: 22, borderRadius: 999, background: COLORS.borderStrong, color: COLORS.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 },
  warmupLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 900, letterSpacing: 0.5, textTransform: 'uppercase' },
  warmupValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: 900 },
  warmupActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  warmupSkipButton: { width: '100%', height: 42, borderRadius: 999, border: 0, background: COLORS.borderStrong, color: COLORS.textPrimary, fontSize: 15, fontWeight: 900 },
  statusStartButton: { width: '100%', height: 42, borderRadius: 999, border: 0, background: ACTIVE_SET_COLOR, color: COLORS.onPrimary, fontSize: 15, fontWeight: 900 },
  statusCompletePanel: { padding: '4px 0 0', display: 'flex', alignItems: 'center', gap: 12 },
  statusCompleteMark: { width: 34, height: 34, borderRadius: 999, background: ACTIVE_SET_COLOR, color: COLORS.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, fontFamily: 'inherit', lineHeight: 1, flexShrink: 0 },
  statusPanelTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: 900, textAlign: 'left' },
  statusPanelText: { marginTop: 4, color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.3 },
  activeTopRestContent: { padding: '2px 0 0', display: 'grid', gap: 12 },
  kicker: { color: COLORS.primary, fontSize: 12, fontWeight: 900, letterSpacing: 0.8, textAlign: 'left' },
  sessionTitle: { marginTop: 6, fontSize: 25, fontWeight: 850, letterSpacing: -0.8, textAlign: 'left' },
  nextSetLine: { marginTop: 5, color: COLORS.textPrimary, fontSize: 22, fontWeight: 850, letterSpacing: -0.4, lineHeight: 1.2, wordBreak: 'keep-all' },
  sessionMeta: { marginTop: 8, color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.25 },
  setHeaderTitle: { marginLeft: 0, textAlign: 'left', color: ACTIVE_SET_COLOR, fontSize: 20, fontWeight: 850, letterSpacing: -0.4, marginBottom: 12 },
  progressPill: { minWidth: 78, height: 58, borderRadius: 22, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'baseline', justifyContent: 'center', paddingTop: 12, boxSizing: 'border-box' },
  progressBig: { color: COLORS.primary, fontSize: 30, fontWeight: 900, letterSpacing: -1 },
  progressSmall: { color: COLORS.textSecondary, fontSize: 17, fontWeight: 800 },
  restPill: { minWidth: 84, height: 62, borderRadius: 22, background: 'rgba(255,107,44,0.12)', border: '1px solid rgba(255,107,44,0.26)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  restPillTime: { color: COLORS.primary, fontSize: 24, lineHeight: 1, fontWeight: 900, letterSpacing: -0.6 },
  restPillLabel: { marginTop: 5, color: COLORS.textSecondary, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' },
  segmentedControl: { height: 36, background: COLORS.borderStrong, borderRadius: 999, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', padding: 2, gap: 2, margin: '14px 0', position: 'sticky', top: 0, zIndex: 3 },
  listHint: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.4, margin: '14px 4px 14px' },
  exerciseCard: { background: COLORS.surfaceRaised, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 18, padding: 18, marginBottom: 18 },
  exerciseHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  exerciseAccent: { fontSize: 12, fontWeight: 900, letterSpacing: 0.8 },
  exerciseName: { margin: '5px 0 0', fontSize: 22, lineHeight: 1.05, fontWeight: 800, letterSpacing: -0.6, textAlign: 'left' },
  previousText: { marginTop: 7, color: COLORS.textSecondary, fontSize: 13, fontWeight: 650 },
  statusBadge: { border: `1px solid ${COLORS.borderStrong}`, borderRadius: 999, padding: '7px 10px', fontSize: 12, fontWeight: 800, background: COLORS.surface, whiteSpace: 'nowrap' },
  nextPreview: { background: COLORS.surfaceMuted, borderRadius: 18, padding: 13, display: 'grid', gap: 10 },
  plannedSetsContent: { minWidth: 0 },
  nextPreviewLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: 900, letterSpacing: 0.8, textAlign: 'left' },
  nextPreviewValue: { marginTop: 5, fontSize: 15, fontWeight: 800 },
  plannedSetsRow: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12 },
  plannedSetList: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, max-content))', gap: '7px 10px', alignItems: 'center' },
  plannedSet: { color: COLORS.textPrimary, fontSize: 13, fontWeight: 850, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'baseline', gap: 5 },
  plannedSetDone: { color: COLORS.inactive, fontSize: 13, fontWeight: 850, whiteSpace: 'nowrap', textDecoration: 'line-through', display: 'inline-flex', alignItems: 'baseline', gap: 5 },
  plannedSetIndex: { color: COLORS.primary, fontSize: 11, fontWeight: 900, minWidth: 14 },
  activateButton: { border: 0, borderRadius: 999, color: COLORS.onPrimary, height: 38, padding: '0 14px', fontWeight: 900, fontSize: 13 },
  tableHeader: { display: 'grid', gridTemplateColumns: '40px 1fr 1fr 34px', gap: 8, color: COLORS.textMuted, fontSize: 11, fontWeight: 900, letterSpacing: 0.8, padding: '0 4px 8px', textAlign: 'center' },
  setList: { display: 'grid', gap: 8 },
  setRow: { minHeight: 54, background: COLORS.surfaceRaised, border: '1px solid transparent', borderRadius: 14, display: 'grid', gridTemplateColumns: '40px 1fr 1fr 34px', gap: 8, alignItems: 'center', padding: '0 8px', boxSizing: 'border-box', transition: 'border-color 160ms ease, background 160ms ease' },
  setRowPending: { minHeight: 54, background: COLORS.surface, border: '1px solid transparent', borderRadius: 14, display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 8, alignItems: 'center', padding: '0 8px', boxSizing: 'border-box', transition: 'border-color 160ms ease, background 160ms ease' },
  setNumber: { width: 30, height: 30, borderRadius: 999, border: 0, background: COLORS.background, color: COLORS.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 },
  planCell: { color: COLORS.textSecondary, whiteSpace: 'nowrap', textAlign: 'center' },
  planCellButton: { color: COLORS.textSecondary, whiteSpace: 'nowrap', textAlign: 'center', border: 0, outline: 0, background: 'transparent', fontFamily: 'inherit', padding: 0 },
  actualCellDone: { border: 0, background: 'transparent', color: COLORS.textPrimary, whiteSpace: 'nowrap', textAlign: 'center', padding: 0, fontFamily: 'inherit' },
  actualCellDoneActive: { border: 0, background: 'transparent', color: COLORS.textPrimary, whiteSpace: 'nowrap', textAlign: 'center', padding: 0, fontFamily: 'inherit' },
  actualCellDoneInactive: { border: 0, background: 'transparent', color: COLORS.inactive, whiteSpace: 'nowrap', textAlign: 'center', padding: 0, fontFamily: 'inherit' },
  actualCellEmpty: { color: COLORS.primary, border: 0, background: 'transparent', padding: 0, textAlign: 'center', fontSize: 22, fontWeight: 850, fontFamily: 'inherit' },
  actualCellEmptyInactive: { color: COLORS.inactive, border: 0, background: 'transparent', padding: 0, textAlign: 'center', fontSize: 22, fontWeight: 750, fontFamily: 'inherit' },
  weightReps: { display: 'grid', gridTemplateColumns: '58px 14px 24px', alignItems: 'baseline', justifyContent: 'center' },
  weightRepsWeight: { textAlign: 'right', whiteSpace: 'nowrap' },
  weight: { fontSize: 18, fontWeight: 850, letterSpacing: -0.4 },
  weightInactive: { fontSize: 18, fontWeight: 700, letterSpacing: -0.2, color: COLORS.inactive },
  unit: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 700, marginLeft: 2 },
  dot: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  reps: { fontSize: 18, fontWeight: 850, letterSpacing: -0.4 },
  repsInactive: { fontSize: 18, fontWeight: 700, letterSpacing: -0.2, color: COLORS.inactive },
  emptyText: { fontSize: 12 },
  emptyTextInactive: { fontSize: 12, color: COLORS.inactive },
  rowActionSpacer: { width: 28, height: 28 },
  check: { width: 28, height: 28, borderRadius: 999, border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 17, fontWeight: 900, fontFamily: 'inherit', lineHeight: 1 },
  editActualButton: { width: 28, height: 28, borderRadius: 999, border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, fontFamily: 'inherit', lineHeight: 1 },
  editActualIndicator: { width: 28, height: 28, borderRadius: 999, background: COLORS.inactive, color: COLORS.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, fontFamily: 'inherit', lineHeight: 1 },
  pencilIcon: { display: 'block', transform: 'rotate(90deg)' },
  emptyCheck: { width: 28, height: 28, borderRadius: 999, border: '1px solid rgba(255,107,44,0.28)', background: 'rgba(255,107,44,0.08)', color: COLORS.primary, fontSize: 18, fontWeight: 800 },
  emptyCheckActive: { width: 28, height: 28, borderRadius: 999, border: '1px solid rgba(255,107,44,0.28)', background: 'rgba(255,107,44,0.08)', color: COLORS.primary, fontSize: 18, fontWeight: 800 },
  loggingCard: { marginTop: 7, background: COLORS.surfaceMuted, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 18, padding: 18 },
  loggingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  fakeInput: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12 },
  fakeInputLabel: { color: COLORS.inactive, fontSize: 11, fontWeight: 900, letterSpacing: 0.8 },
  fakeInputValue: { marginTop: 5, fontSize: 24, fontWeight: 850, letterSpacing: -0.6, textAlign: 'center' },
  actualInput: { marginTop: 5, width: '100%', border: 0, outline: 0, background: 'transparent', color: COLORS.textPrimary, fontSize: 24, fontWeight: 850, letterSpacing: -0.4, fontFamily: 'inherit', boxSizing: 'border-box', textAlign: 'center' },
  inlineWarning: { marginBottom: 10, color: COLORS.primary, fontSize: 12, fontWeight: 850, letterSpacing: 0.2 },
  warmupEditList: { display: 'grid', gap: 14 },
  warmupEditItem: { display: 'grid', gap: 10 },
  warmupEditTitle: { color: COLORS.primary, fontSize: 13, fontWeight: 900, letterSpacing: 0.4, textAlign: 'left' },
  noteInputWrap: { marginTop: 10, display: 'block', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 12 },
  noteTextarea: { marginTop: 8, width: '100%', minHeight: 68, resize: 'vertical', border: 0, outline: 0, background: 'transparent', color: COLORS.textPrimary, fontSize: 14, lineHeight: 1.4, fontFamily: 'inherit', boxSizing: 'border-box' },
  completeSetButton: { marginTop: 10, width: '100%', height: 42, borderRadius: 999, border: 0, color: COLORS.onPrimary, fontSize: 15, fontWeight: 900 },
  noteCard: { marginTop: 6, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: '12px 13px' },
  noteTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  noteLabel: { fontSize: 11, fontWeight: 900, letterSpacing: 0.8 },
  editNote: { border: `1px solid ${COLORS.borderStrong}`, background: COLORS.surface, color: COLORS.textSecondary, borderRadius: 999, padding: '5px 9px', fontSize: 12, fontWeight: 800 },
  noteText: { margin: '7px 0 0', color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.35 },
  inlineRestLeft: { minWidth: 0 },
  inlineRestLabel: { fontSize: 11, fontWeight: 900, letterSpacing: 0.9, textAlign: 'left' },
  inlineRestTime: { fontSize: 30, lineHeight: 1, fontWeight: 850, letterSpacing: -0.8, textAlign: 'center' },
  inlineRestTimeRow: { display: 'grid', gridTemplateColumns: '72px 1fr 72px', alignItems: 'center', columnGap: 10 },
  restMiniButtonCompact: { minWidth: 0, width: '100%', height: 32, borderRadius: 999, border: 0, background: COLORS.borderStrong, color: COLORS.textSecondary, fontSize: 12, fontWeight: 800, textAlign: 'center', padding: '0 4px' },
  inlineRestActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  restMiniButton: { height: 28, borderRadius: 999, border: `1px solid ${COLORS.borderStrong}`, background: COLORS.surface, color: COLORS.textSecondary, fontSize: 12, fontWeight: 800 },
  restMainButton: { height: 32, borderRadius: 999, border: 0, color: COLORS.onPrimary, fontSize: 13, fontWeight: 900 },
  nextReadyCard: { marginTop: 7, background: COLORS.surfaceMuted, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 18, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  nextReadyTitle: { marginTop: 4, fontSize: 24, fontWeight: 900, letterSpacing: -0.7 },
  nextReadyMeta: { marginTop: 4, color: COLORS.textSecondary, fontSize: 14, fontWeight: 800 },
  nextReadyActions: { display: 'grid', gridTemplateColumns: '1fr', gap: 7, minWidth: 96 },
  addSetButton: { width: '100%', height: 42, marginTop: 12, borderRadius: 999, border: `1px solid ${COLORS.borderStrong}`, background: COLORS.surface, fontSize: 14, fontWeight: 900 },
  completeCard: { background: COLORS.surfaceMuted, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 24, padding: 16, marginBottom: 14 },
  completeTitle: { color: ACTIVE_SET_COLOR, fontSize: 18, fontWeight: 900, textAlign: 'left' },
  completeText: { marginTop: 8, color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.4 },
  completeActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 },
  outlineAction: { height: 40, borderRadius: 999, background: COLORS.surface, fontWeight: 900, border: `1px solid ${COLORS.borderStrong}` },
  solidAction: { height: 40, borderRadius: 999, border: 0, color: COLORS.onPrimary, fontWeight: 900 },
  historyPanel: { background: COLORS.surface, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 24, padding: 18 },
  historyStack: { display: 'grid', gap: 14 },
  historyTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 900, letterSpacing: -0.5, textAlign: 'left' },
  historyLead: { margin: '8px 0 14px', color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.35 },
  historyItem: { background: COLORS.surfaceRaised, borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  historySetRow: { minHeight: 54, background: COLORS.surfaceRaised, border: '1px solid transparent', borderRadius: 14, display: 'grid', gridTemplateColumns: '40px 1fr 1fr 34px', gap: 8, alignItems: 'center', padding: '0 8px', boxSizing: 'border-box' },
  historyName: { fontSize: 15, fontWeight: 900 },
  historyMeta: { marginTop: 5, color: COLORS.textSecondary, fontSize: 13 },
  historyBadge: { color: COLORS.textSecondary, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 999, padding: '5px 9px', fontSize: 12, fontWeight: 800 },
  modalOverlay: { position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.64)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, boxSizing: 'border-box', backdropFilter: 'blur(8px)' },
  modalCard: { width: '100%', background: COLORS.surfaceRaised, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 24, padding: 18, boxShadow: '0 24px 70px rgba(0,0,0,0.5)' },
  modalKicker: { color: COLORS.primary, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 },
  modalTitle: { margin: '8px 0 0', color: COLORS.textPrimary, fontSize: 24, lineHeight: 1.05, fontWeight: 900, letterSpacing: -0.7 },
  modalText: { margin: '12px 0 0', color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.45 },
  modalActions: { marginTop: 16, display: 'grid', gap: 10 },
  modalButton: { width: '100%' },
  dialogStack: { display: 'grid', gap: 8 },
  dialogOption: { width: '100%', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 16, background: COLORS.surface, color: COLORS.textPrimary, padding: 12, display: 'grid', gap: 4, textAlign: 'left', fontFamily: 'inherit' },
  dialogOptionTitle: { fontSize: 15, fontWeight: 900 },
  dialogOptionMeta: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 750 },
  dialogEmpty: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 750 },
  setRowWrap: {},
};

import { useState } from 'react';
import type { CSSProperties } from 'react';

type SetItem = {
  set: number;
  planWeight: number;
  planReps: number;
  actualWeight: number | null;
  actualReps: number | null;
  done: boolean;
  note: string;
};

type Exercise = {
  name: string;
  target: string;
  accent: string;
  previous: string;
  sets: SetItem[];
};

export default function WorkoutSetLogPage() {
  const [screen, setScreen] = useState<'list' | 'active'>('list');
  const [activeExerciseName, setActiveExerciseName] = useState('Bench Press');
  const [openSet, setOpenSet] = useState(1);
  const [loggingSet, setLoggingSet] = useState<number | null>(null);
  const [restingAfterSet, setRestingAfterSet] = useState<number | null>(null);
  const [nextReadySet, setNextReadySet] = useState<number | null>(null);

  const exercises: Exercise[] = [
    {
      name: 'Bench Press',
      target: 'Chest / Push',
      accent: '#ff6b2c',
      previous: '前回 65kg × 8 · 3 sets',
      sets: [
        { set: 1, planWeight: 60, planReps: 10, actualWeight: 60, actualReps: 10, done: true, note: '肩の違和感なし。フォームは安定。' },
        { set: 2, planWeight: 65, planReps: 8, actualWeight: 65, actualReps: 8, done: true, note: '予定通り。次回も同重量でOK。' },
        { set: 3, planWeight: 67.5, planReps: 8, actualWeight: null, actualReps: null, done: false, note: 'メインセット。無理なら65kgに落とす。' },
        { set: 4, planWeight: 65, planReps: 8, actualWeight: null, actualReps: null, done: false, note: '余力があれば実施。' },
      ],
    },
    {
      name: 'Incline Dumbbell Press',
      target: 'Upper Chest',
      accent: '#f59e0b',
      previous: '前回 22kg × 10 · 3 sets',
      sets: [
        { set: 1, planWeight: 22, planReps: 10, actualWeight: null, actualReps: null, done: false, note: '胸上部を意識。' },
        { set: 2, planWeight: 22, planReps: 10, actualWeight: null, actualReps: null, done: false, note: '反動を使わない。' },
        { set: 3, planWeight: 20, planReps: 12, actualWeight: null, actualReps: null, done: false, note: '軽めで丁寧に。' },
      ],
    },
    {
      name: 'Cable Fly',
      target: 'Chest Finish',
      accent: '#fb7185',
      previous: '前回 18kg × 12 · 3 sets',
      sets: [
        { set: 1, planWeight: 18, planReps: 12, actualWeight: null, actualReps: null, done: false, note: '収縮で1秒止める。' },
        { set: 2, planWeight: 18, planReps: 12, actualWeight: null, actualReps: null, done: false, note: '肘の角度を固定。' },
        { set: 3, planWeight: 16, planReps: 15, actualWeight: null, actualReps: null, done: false, note: 'パンプ狙い。' },
      ],
    },
  ];

  const activeExercise = exercises.find((exercise) => exercise.name === activeExerciseName) || exercises[0];
  const totalDone = exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.done).length, 0);
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

  function activateExercise(exerciseName: string) {
    setActiveExerciseName(exerciseName);
    setScreen('active');
    setLoggingSet(null);
    setRestingAfterSet(null);
    setNextReadySet(null);
    const exercise = exercises.find((item) => item.name === exerciseName);
    const firstOpen = exercise?.sets.find((set) => !set.done)?.set || 1;
    setOpenSet(firstOpen);
  }

  function completeSet(setNumber: number) {
    setLoggingSet(null);
    setOpenSet(setNumber);
    const isLastSet = setNumber === activeExercise.sets.length;
    if (isLastSet) {
      setRestingAfterSet(null);
      setNextReadySet(null);
    } else {
      setRestingAfterSet(setNumber);
      setNextReadySet(null);
    }
  }

  function finishRest(setNumber: number) {
    setRestingAfterSet(null);
    setNextReadySet(setNumber + 1);
    setOpenSet(setNumber + 1);
  }

  return (
    <div style={styles.page}>
      <div style={styles.phone}>
        {screen === 'list' ? (
          <ExerciseListScreen
            exercises={exercises}
            totalDone={totalDone}
            totalSets={totalSets}
            onActivate={activateExercise}
          />
        ) : (
          <ActiveExerciseScreen
            exercise={activeExercise}
            openSet={openSet}
            loggingSet={loggingSet}
            restingAfterSet={restingAfterSet}
            nextReadySet={nextReadySet}
            onBack={() => setScreen('list')}
            onOpenSet={setOpenSet}
            onStartLogging={setLoggingSet}
            onCancelLogging={() => setLoggingSet(null)}
            onCompleteSet={completeSet}
            onFinishRest={finishRest}
            onStopRest={() => setRestingAfterSet(null)}
            onAddRest={(setNumber) => setRestingAfterSet(setNumber - 1)}
          />
        )}
      </div>
    </div>
  );
}

function ExerciseListScreen({ exercises, totalDone, totalSets, onActivate }:{
  exercises: Exercise[];
  totalDone: number;
  totalSets: number;
  onActivate: (exerciseName: string) => void;
}) {
  return (
    <>
      <header style={styles.header}>
        <button style={styles.circleButton}>‹</button>
        <div style={styles.headerCenter}>
          <div style={styles.title}>Workout</div>
          <div style={styles.subtitle}>Push Day · Today</div>
        </div>
        <button style={styles.circleButton}><span style={styles.moreDots}>•••</span></button>
      </header>

      <main style={styles.content}>
        <section style={styles.sessionCard}>
          <div>
            <div style={styles.kicker}>TODAY'S EXERCISES</div>
            <div style={styles.sessionTitle}>Choose what’s open</div>
            <div style={styles.sessionMeta}>器具の空き状況に合わせて種目を選択</div>
          </div>
          <div style={styles.progressPill}>
            <span style={styles.progressBig}>{totalDone}</span>
            <span style={styles.progressSmall}>/{totalSets}</span>
          </div>
        </section>

        <div style={styles.listHint}>種目を選んでActivateすると、その種目のセット入力画面へ移動します。</div>

        {exercises.map((exercise) => (
          <ExerciseListCard key={exercise.name} exercise={exercise} onActivate={() => onActivate(exercise.name)} />
        ))}
      </main>

      <footer style={styles.bottomBar}>
        <button style={styles.secondaryButton}>＋ Exercise</button>
        <button style={styles.primaryButton}>Finish Workout</button>
      </footer>
    </>
  );
}

function ExerciseListCard({ exercise, onActivate }:{
  exercise: Exercise;
  onActivate: () => void;
}) {
  const doneCount = exercise.sets.filter((set) => set.done).length;
  const nextSet = exercise.sets.find((set) => !set.done);
  const complete = doneCount === exercise.sets.length;

  return (
    <section style={styles.exerciseCard}>
      <div style={styles.exerciseHeader}>
        <div>
          <div style={{ ...styles.exerciseAccent, color: exercise.accent }}>{exercise.target}</div>
          <h2 style={styles.exerciseName}>{exercise.name}</h2>
          <div style={styles.previousText}>{exercise.previous}</div>
        </div>
        <div style={{ ...styles.statusBadge, color: complete ? '#34d399' : exercise.accent, borderColor: complete ? '#34d39955' : `${exercise.accent}55` }}>
          {complete ? 'Done' : `${doneCount}/${exercise.sets.length}`}
        </div>
      </div>

      <div style={styles.nextPreview}>
        <div>
          <div style={styles.nextPreviewLabel}>{complete ? 'COMPLETED' : 'NEXT SET'}</div>
          <div style={styles.nextPreviewValue}>{complete ? 'All planned sets logged' : `Set ${nextSet?.set} · ${nextSet?.planWeight}kg × ${nextSet?.planReps}`}</div>
        </div>
        <button onClick={onActivate} style={{ ...styles.activateButton, background: exercise.accent }}>
          {complete ? 'Review' : 'Activate'}
        </button>
      </div>
    </section>
  );
}

function ActiveExerciseScreen({
  exercise,
  openSet,
  loggingSet,
  restingAfterSet,
  nextReadySet,
  onBack,
  onOpenSet,
  onStartLogging,
  onCancelLogging,
  onCompleteSet,
  onFinishRest,
  onStopRest,
  onAddRest,
}: {
  exercise: Exercise;
  openSet: number;
  loggingSet: number | null;
  restingAfterSet: number | null;
  nextReadySet: number | null;
  onBack: () => void;
  onOpenSet: (set: number) => void;
  onStartLogging: (set: number) => void;
  onCancelLogging: () => void;
  onCompleteSet: (set: number) => void;
  onFinishRest: (set: number) => void;
  onStopRest: () => void;
  onAddRest: (set: number) => void;
}) {
  const doneCount = exercise.sets.filter((set) => set.done).length;
  const complete = doneCount === exercise.sets.length;
  const currentSet = exercise.sets.find((set) => set.set === openSet) || exercise.sets[0];

  return (
    <>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.circleButton}>‹</button>
        <div style={styles.headerCenter}>
          <div style={styles.title}>{exercise.name}</div>
          <div style={styles.subtitle}>{exercise.target}</div>
        </div>
        <button style={styles.circleButton}><span style={styles.moreDots}>•••</span></button>
      </header>

      <main style={styles.content}>
        <section style={styles.activeTopCard}>
          <div>
            <div style={{ ...styles.kicker, color: exercise.accent }}>{restingAfterSet ? 'RESTING' : complete ? 'EXERCISE COMPLETE' : 'ACTIVE EXERCISE'}</div>
            <div style={styles.sessionTitle}>{restingAfterSet ? `After Set ${restingAfterSet}` : complete ? `${exercise.name} Done` : `Set ${currentSet.set}`}</div>
            <div style={styles.sessionMeta}>{restingAfterSet ? '休憩中でも次セットはいつでも入力可能' : complete ? `${doneCount}/${exercise.sets.length} sets logged` : `${currentSet.planWeight}kg × ${currentSet.planReps}`}</div>
          </div>
          <div style={restingAfterSet ? styles.restPill : styles.progressPill}>
            {restingAfterSet ? (
              <>
                <span style={styles.restPillTime}>01:24</span>
                <span style={styles.restPillLabel}>rest</span>
              </>
            ) : (
              <>
                <span style={{ ...styles.progressBig, color: exercise.accent }}>{doneCount}</span>
                <span style={styles.progressSmall}>/{exercise.sets.length}</span>
              </>
            )}
          </div>
        </section>

        {complete && (
          <section style={styles.completeCard}>
            <div style={styles.completeTitle}>Exercise Complete</div>
            <div style={styles.completeText}>予定セットが完了しました。追加セットを行うか、一覧に戻って次の種目を選べます。</div>
            <div style={styles.completeActions}>
              <button style={{ ...styles.outlineAction, color: exercise.accent, borderColor: `${exercise.accent}44` }}>＋ Add Set</button>
              <button onClick={onBack} style={{ ...styles.solidAction, background: exercise.accent }}>Back to List</button>
            </div>
          </section>
        )}

        <section style={styles.exerciseCard}>
          <div style={styles.tableHeader}>
            <div>SET</div>
            <div>PLAN</div>
            <div>ACTUAL</div>
            <div></div>
          </div>

          <div style={styles.setList}>
            {exercise.sets.map((set) => (
              <SetRow
                key={set.set}
                set={set}
                accent={exercise.accent}
                isOpen={openSet === set.set}
                isLogging={loggingSet === set.set}
                isResting={restingAfterSet === set.set}
                isNextReady={nextReadySet === set.set}
                hasNextSet={set.set < exercise.sets.length}
                onOpen={() => onOpenSet(set.set)}
                onStartLogging={() => {
                  onOpenSet(set.set);
                  onStartLogging(set.set);
                }}
                onCancelLogging={onCancelLogging}
                onCompleteSet={() => onCompleteSet(set.set)}
                onFinishRest={() => onFinishRest(set.set)}
                onStopRest={onStopRest}
                onAddRest={() => onAddRest(set.set)}
              />
            ))}
          </div>

          <button style={{ ...styles.addSetButton, color: exercise.accent, borderColor: `${exercise.accent}33` }}>＋ Add Set</button>
        </section>
      </main>
    </>
  );
}

function SetRow({
  set,
  accent,
  isOpen,
  isLogging,
  isResting,
  isNextReady,
  hasNextSet,
  onOpen,
  onStartLogging,
  onCancelLogging,
  onCompleteSet,
  onFinishRest,
  onStopRest,
  onAddRest,
}: {
  set: SetItem;
  accent: string;
  isOpen: boolean;
  isLogging: boolean;
  isResting: boolean;
  isNextReady: boolean;
  hasNextSet: boolean;
  onOpen: () => void;
  onStartLogging: () => void;
  onCancelLogging: () => void;
  onCompleteSet: () => void;
  onFinishRest: () => void;
  onStopRest: () => void;
  onAddRest: () => void;
}) {
  return (
    <div style={styles.setRowWrap}>
      <div style={isOpen || isLogging ? { ...styles.setRow, borderColor: `${accent}88` } : styles.setRow}>
        <button onClick={onOpen} style={isOpen || isLogging ? { ...styles.setNumber, background: accent, color: '#fff' } : styles.setNumber}>{set.set}</button>

        <div style={styles.planCell}>
          <span style={styles.weight}>{set.planWeight}</span><span style={styles.unit}>kg</span><span style={styles.dot}>×</span><span style={styles.reps}>{set.planReps}</span>
        </div>

        <button onClick={set.done ? onOpen : onStartLogging} style={set.done ? styles.actualCellDone : styles.actualCellEmpty}>
          {set.done ? <><span style={styles.weight}>{set.actualWeight}</span><span style={styles.unit}>kg</span><span style={styles.dot}>×</span><span style={styles.reps}>{set.actualReps}</span></> : <span style={styles.emptyText}>Log Set</span>}
        </button>

        <button onClick={set.done ? onOpen : onStartLogging} style={set.done ? { ...styles.check, background: accent } : styles.emptyCheck}>{set.done ? '✓' : '+'}</button>
      </div>

      {isLogging && !set.done && (
        <div style={styles.loggingCard}>
          <div style={styles.loggingHeader}>
            <div style={{ ...styles.noteLabel, color: accent }}>SET {set.set} LOGGING</div>
            <button onClick={onCancelLogging} style={styles.editNote}>Cancel</button>
          </div>
          <div style={styles.inputGrid}>
            <div style={styles.fakeInput}>
              <div style={styles.fakeInputLabel}>Weight</div>
              <div style={styles.fakeInputValue}>{set.planWeight}<span> kg</span></div>
            </div>
            <div style={styles.fakeInput}>
              <div style={styles.fakeInputLabel}>Reps</div>
              <div style={styles.fakeInputValue}>{set.planReps}</div>
            </div>
          </div>
          <button onClick={onCompleteSet} style={{ ...styles.completeSetButton, background: accent }}>Complete Set</button>
        </div>
      )}

      {isOpen && !isLogging && (
        <div style={styles.noteCard}>
          <div style={styles.noteTopRow}>
            <div style={{ ...styles.noteLabel, color: accent }}>SET {set.set} NOTE</div>
            <button style={styles.editNote}>Edit</button>
          </div>
          <p style={styles.noteText}>{set.note}</p>
        </div>
      )}

      {isResting && (
        <div style={{ ...styles.inlineRestCard, borderColor: `${accent}40` }}>
          <div>
            <div style={{ ...styles.inlineRestLabel, color: accent }}>REST AFTER SET {set.set}</div>
            <div style={styles.inlineRestTime}>01:24</div>
            <div style={styles.inlineRestHint}>次のセットはいつでも入力できます</div>
          </div>
          <div style={styles.inlineRestActions}>
            <button style={styles.restMiniButton}>+30s</button>
            <button style={styles.restMiniButton}>+60s</button>
            <button onClick={onStopRest} style={{ ...styles.restMainButton, background: '#3f3f46' }}>Stop</button>
            <button onClick={onFinishRest} style={{ ...styles.restMainButton, background: accent }}>Done</button>
          </div>
        </div>
      )}

      {isNextReady && !set.done && (
        <div style={{ ...styles.nextReadyCard, borderColor: `${accent}40` }}>
          <div>
            <div style={{ ...styles.inlineRestLabel, color: accent }}>NEXT SET READY</div>
            <div style={styles.nextReadyTitle}>Set {set.set}</div>
            <div style={styles.nextReadyMeta}>{set.planWeight}kg × {set.planReps}</div>
          </div>
          <div style={styles.nextReadyActions}>
            <button onClick={onStartLogging} style={{ ...styles.restMainButton, background: accent }}>Log Set</button>
            <button onClick={onAddRest} style={styles.restMiniButton}>Add Rest</button>
          </div>
        </div>
      )}

      {!hasNextSet && set.done && isResting && null}
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  page: { minHeight: '100vh', background: '#050506', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, boxSizing: 'border-box', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif' },
  phone: { width: '100%', maxWidth: 430, height: 820, background: 'radial-gradient(circle at top right, rgba(255,107,44,0.16), transparent 30%), #050506', borderRadius: 34, overflow: 'hidden', border: '1px solid #1f1f23', boxShadow: '0 28px 90px rgba(0,0,0,0.58)', position: 'relative', display: 'flex', flexDirection: 'column' },
  header: { height: 112, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 18px 0', boxSizing: 'border-box' },
  circleButton: { width: 50, height: 50, borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 32, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  moreDots: { display: 'block', fontSize: 18, letterSpacing: 2, transform: 'translateX(1px) translateY(-1px)' },
  headerCenter: { textAlign: 'center' },
  title: { fontSize: 21, fontWeight: 800, letterSpacing: -0.4 },
  subtitle: { marginTop: 8, fontSize: 13, color: '#a1a1aa' },
  content: { flex: 1, overflowY: 'auto', padding: '8px 18px 112px', boxSizing: 'border-box', scrollbarWidth: 'none' },
  sessionCard: { background: 'linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 30, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 18px 45px rgba(0,0,0,0.36)' },
  activeTopCard: { background: 'linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 30, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 18px 45px rgba(0,0,0,0.36)', marginBottom: 16 },
  kicker: { color: '#ff6b2c', fontSize: 12, fontWeight: 900, letterSpacing: 0.8 },
  sessionTitle: { marginTop: 6, fontSize: 25, fontWeight: 850, letterSpacing: -0.8 },
  sessionMeta: { marginTop: 8, color: '#a1a1aa', fontSize: 13, lineHeight: 1.25 },
  progressPill: { minWidth: 78, height: 58, borderRadius: 22, background: '#101012', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'baseline', justifyContent: 'center', paddingTop: 12, boxSizing: 'border-box' },
  progressBig: { color: '#ff6b2c', fontSize: 30, fontWeight: 900, letterSpacing: -1 },
  progressSmall: { color: '#a1a1aa', fontSize: 17, fontWeight: 800 },
  restPill: { minWidth: 84, height: 62, borderRadius: 22, background: 'rgba(255,107,44,0.12)', border: '1px solid rgba(255,107,44,0.26)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  restPillTime: { color: '#ffb38a', fontSize: 24, lineHeight: 1, fontWeight: 900, letterSpacing: -0.6 },
  restPillLabel: { marginTop: 5, color: '#a1a1aa', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' },
  listHint: { color: '#a1a1aa', fontSize: 14, lineHeight: 1.4, margin: '14px 4px 14px' },
  exerciseCard: { background: '#1c1c1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 16, marginBottom: 14 },
  exerciseHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  exerciseAccent: { fontSize: 12, fontWeight: 900, letterSpacing: 0.8 },
  exerciseName: { margin: '5px 0 0', fontSize: 22, lineHeight: 1.05, fontWeight: 800, letterSpacing: -0.6 },
  previousText: { marginTop: 7, color: '#a1a1aa', fontSize: 13, fontWeight: 650 },
  statusBadge: { border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '7px 10px', fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,0.04)', whiteSpace: 'nowrap' },
  nextPreview: { background: '#2a2a2e', borderRadius: 20, padding: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  nextPreviewLabel: { color: '#8b8b94', fontSize: 11, fontWeight: 900, letterSpacing: 0.8 },
  nextPreviewValue: { marginTop: 5, fontSize: 15, fontWeight: 800 },
  activateButton: { border: 0, borderRadius: 999, color: '#fff', height: 38, padding: '0 14px', fontWeight: 900, fontSize: 13 },
  tableHeader: { display: 'grid', gridTemplateColumns: '40px 1fr 1fr 34px', gap: 8, color: '#7c7c84', fontSize: 11, fontWeight: 900, letterSpacing: 0.8, padding: '0 4px 8px' },
  setList: { display: 'grid', gap: 8 },
  setRow: { minHeight: 54, background: '#2a2a2e', border: '1px solid transparent', borderRadius: 18, display: 'grid', gridTemplateColumns: '40px 1fr 1fr 34px', gap: 8, alignItems: 'center', padding: '0 8px', boxSizing: 'border-box', transition: 'border-color 160ms ease, background 160ms ease' },
  setNumber: { width: 30, height: 30, borderRadius: 999, border: 0, background: '#141416', color: '#d4d4d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 },
  planCell: { color: '#d4d4d8', whiteSpace: 'nowrap' },
  actualCellDone: { border: 0, background: 'transparent', color: '#fff', whiteSpace: 'nowrap', textAlign: 'left', padding: 0, fontFamily: 'inherit' },
  actualCellEmpty: { color: '#ffb38a', border: '1px dashed rgba(255,107,44,0.32)', background: 'rgba(255,107,44,0.06)', borderRadius: 12, padding: '8px 6px', textAlign: 'center', fontSize: 12, fontWeight: 800, fontFamily: 'inherit' },
  weight: { fontSize: 18, fontWeight: 850, letterSpacing: -0.4 },
  unit: { color: '#a1a1aa', fontSize: 12, fontWeight: 700, marginLeft: 2 },
  dot: { color: '#71717a', margin: '0 5px', fontSize: 13 },
  reps: { fontSize: 18, fontWeight: 850, letterSpacing: -0.4 },
  emptyText: { fontSize: 12 },
  check: { width: 28, height: 28, borderRadius: 999, border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 17, fontWeight: 900 },
  emptyCheck: { width: 28, height: 28, borderRadius: 999, border: '1px solid rgba(255,107,44,0.28)', background: 'rgba(255,107,44,0.08)', color: '#ffb38a', fontSize: 18, fontWeight: 800 },
  loggingCard: { marginTop: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 12 },
  loggingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  fakeInput: { background: '#101012', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 12 },
  fakeInputLabel: { color: '#8b8b94', fontSize: 11, fontWeight: 900, letterSpacing: 0.8 },
  fakeInputValue: { marginTop: 5, fontSize: 24, fontWeight: 850, letterSpacing: -0.6 },
  completeSetButton: { marginTop: 10, width: '100%', height: 42, borderRadius: 999, border: 0, color: '#fff', fontSize: 15, fontWeight: 900 },
  noteCard: { marginTop: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '12px 13px' },
  noteTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  noteLabel: { fontSize: 11, fontWeight: 900, letterSpacing: 0.8 },
  editNote: { border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.06)', color: '#d4d4d8', borderRadius: 999, padding: '5px 9px', fontSize: 12, fontWeight: 800 },
  noteText: { margin: '7px 0 0', color: '#e4e4e7', fontSize: 14, lineHeight: 1.35 },
  inlineRestCard: { marginTop: 7, background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.035))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  inlineRestLabel: { fontSize: 11, fontWeight: 900, letterSpacing: 0.9 },
  inlineRestTime: { marginTop: 3, fontSize: 30, lineHeight: 1, fontWeight: 850, letterSpacing: -0.8 },
  inlineRestHint: { marginTop: 5, color: '#a1a1aa', fontSize: 12 },
  inlineRestActions: { display: 'grid', gridTemplateColumns: '1fr', gap: 6, minWidth: 76 },
  restMiniButton: { height: 28, borderRadius: 999, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.06)', color: '#d4d4d8', fontSize: 12, fontWeight: 800 },
  restMainButton: { height: 32, borderRadius: 999, border: 0, color: '#fff', fontSize: 13, fontWeight: 900 },
  nextReadyCard: { marginTop: 7, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: 18, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  nextReadyTitle: { marginTop: 4, fontSize: 24, fontWeight: 900, letterSpacing: -0.7 },
  nextReadyMeta: { marginTop: 4, color: '#d4d4d8', fontSize: 14, fontWeight: 800 },
  nextReadyActions: { display: 'grid', gridTemplateColumns: '1fr', gap: 7, minWidth: 96 },
  addSetButton: { width: '100%', height: 42, marginTop: 12, borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', fontSize: 14, fontWeight: 900 },
  completeCard: { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: 24, padding: 16, marginBottom: 14 },
  completeTitle: { color: '#34d399', fontSize: 18, fontWeight: 900 },
  completeText: { marginTop: 8, color: '#e4e4e7', fontSize: 14, lineHeight: 1.4 },
  completeActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 },
  outlineAction: { height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.04)', fontWeight: 900, border: '1px solid rgba(255,255,255,0.12)' },
  solidAction: { height: 40, borderRadius: 999, border: 0, color: '#fff', fontWeight: 900 },
  bottomBar: { position: 'absolute', left: 18, right: 18, bottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 18, background: 'linear-gradient(to top, #050506 68%, rgba(5,5,6,0))', zIndex: 10 },
  secondaryButton: { height: 50, borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.08)', color: '#ffb38a', fontSize: 16, fontWeight: 800 },
  primaryButton: { height: 50, borderRadius: 999, border: 0, background: '#ff6b2c', color: '#fff', fontSize: 16, fontWeight: 900, boxShadow: '0 12px 28px rgba(255,107,44,0.28)' },
  setRowWrap: {},
};

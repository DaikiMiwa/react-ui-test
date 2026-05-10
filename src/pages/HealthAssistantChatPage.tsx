import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { AppHeader, MoreDots } from '../ui/AppHeader'
import { AppShell } from '../ui/AppShell'
import { IconButton } from '../ui/IconButton'
import { SegmentedControl } from '../ui/SegmentedControl'
import { COLORS } from '../ui/tokens'

type MealItem = {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

type MealAnalysis = {
  id: number;
  mealName: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence: '高め' | 'ふつう';
  note: string;
  items: MealItem[];
  added: boolean;
}

type TextMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

type MealMessage = {
  id: number;
  role: 'meal';
  analysis: MealAnalysis;
  time: string;
}

type WorkoutLogAnalysis = {
  id: number;
  exercise: string;
  phase: 'ウォームアップ' | '本セット';
  setLabel: string;
  plannedWeight: number;
  plannedReps: number;
  actualWeight: number;
  actualReps: number;
  restMinutes: number;
  note: string;
  nextSuggestion: string;
  added: boolean;
}

type WorkoutMessage = {
  id: number;
  role: 'workout';
  analysis: WorkoutLogAnalysis;
  time: string;
}

type GoalPlanAnalysis = {
  id: number;
  goalLabel: string;
  horizon: string;
  primaryMetric: string;
  baseline: string;
  target: string;
  weeklyFocus: string;
  dailyAction: string;
  phases: string[];
  checkpoints: string[];
  added: boolean;
}

type PlanMessage = {
  id: number;
  role: 'plan';
  analysis: GoalPlanAnalysis;
  time: string;
}

type ChatMessage = TextMessage | MealMessage | WorkoutMessage | PlanMessage
type AssistantMode = 'normal' | 'plan-chat' | 'training'

const ASSISTANT_MODES: readonly AssistantMode[] = ['normal', 'plan-chat', 'training'] as const

export default function HealthAssistantChat() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('normal');
  const [warmupChecked, setWarmupChecked] = useState([true, true]);
  const [warmupSkipped, setWarmupSkipped] = useState(false);
  const [exerciseSwitchDecision, setExerciseSwitchDecision] = useState<'stay' | 'complete' | 'open'>('stay');
  const chatRef = useRef<HTMLElement | null>(null);
  const setOneAnalysis = makeWorkoutLogAnalysis('Bench Press 60kg 10回できました', 2);
  const setFourAnalysis = makeWorkoutLogAnalysis('Bench Press 65kg 8回できました', 3);
  const inclineSetOneAnalysis = makeWorkoutLogAnalysis('Incline Dumbbell Press 22kg 10回できました', 4);
  const normalLunchAnalysis = makeMealAnalysis('昼に鶏むね肉、ご飯、サラダを食べた', 5);
  const isWarmupComplete = warmupSkipped || warmupChecked.every(Boolean);

  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking, assistantMode]);

  function submitQuestion(event?: FormEvent<HTMLFormElement>, quickText?: string) {
    event?.preventDefault();
    const text = (quickText || draft).trim();
    if (!text || isThinking) return;

    const now = formatMessageTime();
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text,
      time: now,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setIsThinking(true);

    const isPlanningChat = assistantMode === 'plan-chat';
    const isTrainingChat = assistantMode === 'training';
    const workoutAnalysis = isTrainingChat ? makeWorkoutLogAnalysis(text, Date.now() + 3) : null;
    const goalPlanAnalysis = workoutAnalysis || !isPlanningChat ? null : makeGoalPlanAnalysis(text, Date.now() + 4);
    const mealAnalysis = workoutAnalysis || goalPlanAnalysis || isPlanningChat || isTrainingChat ? null : makeMealAnalysis(text, Date.now() + 2);

    window.setTimeout(() => {
      const responseTime = formatMessageTime();
      const assistantMessage: TextMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: workoutAnalysis
          ? 'セット実績を解析しました。内容を確認して、問題なければワークアウトログに追加してください。'
          : goalPlanAnalysis
          ? '目標を実行計画に分解しました。方向性が合っていれば、週間プランと今日のメニューへ落とし込みます。'
          : mealAnalysis
          ? '食事内容を解析しました。内容を確認して、問題なければ食事に追加してください。'
          : makeAssistantReply(text, assistantMode),
        time: responseTime,
      };
      const nextMessages: ChatMessage[] = workoutAnalysis
        ? [assistantMessage, { id: workoutAnalysis.id, role: 'workout', analysis: workoutAnalysis, time: responseTime }]
        : goalPlanAnalysis
        ? [assistantMessage, { id: goalPlanAnalysis.id, role: 'plan', analysis: goalPlanAnalysis, time: responseTime }]
        : mealAnalysis
        ? [assistantMessage, { id: mealAnalysis.id, role: 'meal', analysis: mealAnalysis, time: responseTime }]
        : [assistantMessage];

      setMessages((current) => [...current, ...nextMessages]);
      setIsThinking(false);
    }, 520);
  }

  function sendQuickAction(text: string) {
    submitQuestion(undefined, text);
  }

  function toggleWarmup(index: number) {
    setWarmupSkipped(false);
    setWarmupChecked((current) => current.map((checked, warmupIndex) => (warmupIndex === index ? !checked : checked)));
  }

  function skipWarmup() {
    setWarmupSkipped(true);
    setWarmupChecked([false, false]);
  }

  function addMealToLog(analysisId: number) {
    const target = messages.find((message) => message.role === 'meal' && message.analysis.id === analysisId);
    if (!target || target.role !== 'meal' || target.analysis.added) return;

    setMessages((current) => [
      ...current.map((message) =>
        message.role === 'meal' && message.analysis.id === analysisId
          ? { ...message, analysis: { ...message.analysis, added: true } }
          : message
      ),
      {
        id: Date.now(),
        role: 'assistant',
        text: `${target.analysis.mealName}を食事ログに追加しました。今日の摂取量に${target.analysis.calories}kcalを反映しています。`,
        time: formatMessageTime(),
      },
    ]);
  }

  function addWorkoutToLog(analysisId: number) {
    const target = messages.find((message) => message.role === 'workout' && message.analysis.id === analysisId);
    if (!target || target.role !== 'workout' || target.analysis.added) return;

    setMessages((current) => [
      ...current.map((message) =>
        message.role === 'workout' && message.analysis.id === analysisId
          ? { ...message, analysis: { ...message.analysis, added: true } }
          : message
      ),
      {
        id: Date.now(),
        role: 'assistant',
        text: `${target.analysis.exercise} ${target.analysis.setLabel}を記録しました。${target.analysis.restMinutes}分休んだら、${target.analysis.nextSuggestion}に進みましょう。`,
        time: formatMessageTime(),
      },
    ]);
  }

  function addPlanToLog(analysisId: number) {
    const target = messages.find((message) => message.role === 'plan' && message.analysis.id === analysisId);
    if (!target || target.role !== 'plan' || target.analysis.added) return;

    setMessages((current) => [
      ...current.map((message) =>
        message.role === 'plan' && message.analysis.id === analysisId
          ? { ...message, analysis: { ...message.analysis, added: true } }
          : message
      ),
      {
        id: Date.now(),
        role: 'assistant',
        text: `${target.analysis.goalLabel}を計画に追加しました。まずは${target.analysis.weeklyFocus}として、今日から「${target.analysis.dailyAction}」を実行タスクに置きます。`,
        time: formatMessageTime(),
      },
    ]);
  }

  return (
    <AppShell>
      <AppHeader
        title="ヘルスアシスタント"
        left={<IconButton to="/" ariaLabel="ホームへ戻る">‹</IconButton>}
        right={<IconButton ariaLabel="その他の操作"><MoreDots /></IconButton>}
      />

        <div style={styles.modeSwitchWrap}>
          <SegmentedControl
            items={ASSISTANT_MODES}
            value={assistantMode}
            onChange={setAssistantMode}
            ariaLabel="アシスタントの表示切り替え"
            getLabel={getAssistantModeLabel}
          />
        </div>

        <main ref={chatRef} style={styles.chat}>
          {assistantMode === 'normal' ? (
          <>
            <NormalChatIntro onStartPlanning={() => setAssistantMode('plan-chat')} onOpenTraining={() => setAssistantMode('training')} />

            <UserTurn time="12:10">体重の推移は？</UserTurn>
            <AssistantText>
              直近12週間はゆるやかに下がっています。週平均では78.4kgから77.3kgまで落ちていて、急落ではなく継続しやすいペースです。
            </AssistantText>
            <WeightTrendCard />

            <UserTurn time="12:24">昼に鶏むね肉、ご飯、サラダを食べた</UserTurn>
            <AssistantText>
              昼食を整理しました。PFCを確認して、問題なければ食事ログに追加できます。
            </AssistantText>
            {normalLunchAnalysis ? (
              <MealAnalysisCard analysis={{ ...normalLunchAnalysis, added: true }} onAdd={() => undefined} />
            ) : null}

            <UserTurn time="12:32">これまでの実績データはどう？</UserTurn>
            <AssistantText>
              ベンチプレスは前回よりピークセットが伸びています。体重は下げながら重量を維持できているので、今のところ良い流れです。
            </AssistantText>
            <PerformanceDataCard />

            <UserTurn time="12:36">目標達成できるかな？</UserTurn>
            <AssistantText>
              現在のペースなら、ベンチ100kgは到達可能性があります。ただし後半は伸びが鈍るので、4週ごとの見直しが前提です。
            </AssistantText>
            <GoalOutlookCard onStartPlanning={() => setAssistantMode('plan-chat')} />

            <div style={styles.quickActions}>
              <button type="button" onClick={() => sendQuickAction('夕食でたんぱく質をあと54g取りたい')} style={styles.chip}>夕食相談</button>
              <button type="button" onClick={() => sendQuickAction('今週の体重とトレーニング実績を見て')} style={styles.chip}>実績データ</button>
              <button type="button" onClick={() => sendQuickAction('昼ごはんに鶏むね肉、ご飯、サラダを食べた')} style={styles.chip}>食事追加</button>
            </div>

            {messages.filter(isNormalModeMessage).map((message) => {
              if (message.role === 'user') {
                return (
                  <div key={message.id}>
                    <div style={styles.userBubbleSmall}>{message.text}</div>
                    <div style={styles.timeRight}>{message.time}</div>
                  </div>
                );
              }

              if (message.role === 'meal') {
                return <MealAnalysisCard key={message.id} analysis={message.analysis} onAdd={() => addMealToLog(message.analysis.id)} />;
              }

              if (message.role === 'assistant') {
                return <AssistantText key={message.id}>{message.text}</AssistantText>;
              }

              return null;
            })}

            {isThinking ? <TypingIndicator /> : null}
          </>
          ) : assistantMode === 'training' ? (
          <>
          <ActivePlanStrip onStartPlanning={() => setAssistantMode('plan-chat')} />

          <UserTurn time="18:42">ジム着きました。トレーニング始めます！</UserTurn>

          <AssistantText>
            今日はPush Dayです。予定はBench Press、Incline Dumbbell Press、Cable Flyです。まず空いている種目を選びましょう。
          </AssistantText>

          <WorkoutCoachCard
            title="種目選択"
            status="SELECT"
            exercise="Push Day"
            focusValue="Bench Press"
            hint="ベンチが空いていればここから。埋まっていたらIncline Dumbbell PressかCable Flyから始めます。"
            steps={WORKOUT_PLAN.map((exercise) => exercise.name)}
            activeIndex={0}
          />

          <UserTurn time="18:43">Bench Press空いてます。これからやります。</UserTurn>

          <AssistantText>
            ではBench Pressから始めます。ウォームアップを終えたらカード内でチェックしてください。2つ揃うと本セットに進めます。
          </AssistantText>

          <WarmupChecklistCard
            checked={warmupChecked}
            skipped={warmupSkipped}
            onToggle={toggleWarmup}
            onSkip={skipWarmup}
          />

          <AssistantText>
            {isWarmupComplete
              ? warmupSkipped
                ? 'ウォームアップをスキップしました。ここから本セットに入ります。Set 1は60kg × 10回です。'
                : 'ウォームアップ完了です。ここから本セットに入ります。Set 1は60kg × 10回でいきましょう。'
              : '未完了のウォームアップがあります。時間や器具の都合があれば、カード内のスキップで本セットへ進めます。'}
          </AssistantText>

          <WorkoutCoachCard
            title="Set 1 開始"
            status="NEXT SET"
            exercise="Bench Press"
            focusValue="60kg × 10"
            hint="予定どおりできたら、実績をそのまま話してください。"
            steps={benchPressSteps()}
            activeIndex={2}
          />

          <UserTurn time="18:55">Bench Press 60kg 10回できました。</UserTurn>

          {setOneAnalysis ? <WorkoutAnalysisCard analysis={{ ...setOneAnalysis, added: true }} onAdd={() => undefined} /> : null}

          <AssistantText>
            Set 1を記録しました。予定達成です。3分休憩しましょう。
          </AssistantText>

          <RestCoachCard setLabel="Set 1" nextLabel="Set 2 65kg × 8" minutes={3} />

          <UserTurn time="18:58">休憩終わりました。</UserTurn>

          <AssistantText>
            Set 2に進みます。65kg × 8回です。1回目からフォームを固めていきましょう。
          </AssistantText>

          <WorkoutCoachCard
            title="Set 2 開始"
            status="NEXT SET"
            exercise="Bench Press"
            focusValue="65kg × 8"
            hint="Set 1を達成しているので、Workoutページの計画どおり65kgへ進みます。"
            steps={benchPressSteps()}
            activeIndex={3}
          />

          <UserTurn time="19:02">65kg 8回いけました。</UserTurn>

          <AssistantText>
            Set 2も達成です。3分休憩して、次は67.5kg × 8回に進みます。
          </AssistantText>

          <RestCoachCard setLabel="Set 2" nextLabel="Set 3 67.5kg × 8" minutes={3} />

          <UserTurn time="19:05">Incline Dumbbell Pressが空いたので、先にそっちやっていいですか？</UserTurn>

          <AssistantText>
            Bench PressはまだSet 3とSet 4が未完了です。種目を切り替える前に、記録タブと同じ確認をします。
          </AssistantText>

          <ExerciseSwitchGuardCard
            currentExerciseName="Bench Press"
            nextExerciseName="Incline Dumbbell Press"
            openSets={['Set 3 67.5kg × 8', 'Set 4 65kg × 8']}
            decision={exerciseSwitchDecision}
            onDecision={setExerciseSwitchDecision}
          />

          <UserTurn time="19:06">Bench Pressを続けます。</UserTurn>

          <AssistantText>
            了解です。Bench Pressを続けます。Set 3は67.5kg × 8回。今日の一番重いセットなので、ラックアウトから丁寧にいきましょう。
          </AssistantText>

          <WorkoutCoachCard
            title="Set 3 開始"
            status="HEAVY"
            exercise="Bench Press"
            focusValue="67.5kg × 8"
            hint="この種目のピークセットです。無理なら回数優先で止めてください。"
            steps={benchPressSteps()}
            activeIndex={4}
          />

          <UserTurn time="19:10">67.5kg 8回できました。</UserTurn>

          <AssistantText>
            素晴らしいです。Set 3も達成です。3分休んだら、最後は65kg × 8回で締めます。
          </AssistantText>

          <RestCoachCard setLabel="Set 3" nextLabel="Set 4 65kg × 8" minutes={3} />

          <UserTurn time="19:13">休憩終わりました。</UserTurn>

          <AssistantText>
            最終セットです。Set 4は65kg × 8回。ここまでのフォームを崩さずに終えましょう。
          </AssistantText>

          <WorkoutCoachCard
            title="最終セット開始"
            status="FINAL"
            exercise="Bench Press"
            focusValue="65kg × 8"
            hint="終わったら実績を話してください。このセットでBench Pressは完了です。"
            steps={benchPressSteps()}
            activeIndex={5}
          />

          <UserTurn time="19:17">Bench Press 65kg 8回できました。</UserTurn>

          {setFourAnalysis ? (
            <WorkoutAnalysisCard
              analysis={{ ...setFourAnalysis, setLabel: 'Set 4', nextSuggestion: 'Incline Dumbbell Press Set 1 22kg × 10回', added: true }}
              onAdd={() => undefined}
            />
          ) : null}

          <AssistantText>
            最終セットを記録しました。Bench Pressは完了です。次はIncline Dumbbell Pressに進みましょう。
          </AssistantText>

          <ExerciseCompleteCard />

          <UserTurn time="19:19">Incline Dumbbell Press空いてます。</UserTurn>

          <AssistantText>
            では次種目に入ります。Incline Dumbbell Pressはウォームアップなしで、Set 1から22kg × 10回です。
          </AssistantText>

          <WorkoutCoachCard
            title="次種目開始"
            status="NEXT EXERCISE"
            exercise="Incline Dumbbell Press"
            focusValue="22kg × 10"
            hint="Bench Press後なので、肩甲骨の位置を作ってから始めましょう。"
            steps={inclineSteps()}
            activeIndex={0}
          />

          <UserTurn time="19:23">Incline Dumbbell Press 22kg 10回できました。</UserTurn>

          {inclineSetOneAnalysis ? (
            <WorkoutAnalysisCard
              analysis={{ ...inclineSetOneAnalysis, added: true }}
              onAdd={() => undefined}
            />
          ) : null}

          <AssistantText>
            Incline Dumbbell Press Set 1を記録しました。予定達成です。2分休憩して、Set 2も22kg × 10回で進みます。
          </AssistantText>

          <RestCoachCard setLabel="Incline Set 1" nextLabel="Set 2 22kg × 10" minutes={2} />

          <UserTurn time="19:25">休憩完了。次いきます。</UserTurn>

          <AssistantText>
            Set 2開始です。22kg × 10回。前セットと同じ重量なので、胸上部に乗っている感覚を優先しましょう。
          </AssistantText>

          <WorkoutCoachCard
            title="Set 2 開始"
            status="NEXT SET"
            exercise="Incline Dumbbell Press"
            focusValue="22kg × 10"
            hint="同重量の2セット目です。きつければ8回で止めて記録して大丈夫です。"
            steps={inclineSteps()}
            activeIndex={1}
          />

          <div style={styles.quickActions}>
            <button type="button" onClick={() => setAssistantMode('plan-chat')} style={styles.chip}>目標相談へ</button>
            <button type="button" onClick={() => sendQuickAction('ジム着きました。トレーニング始めます！')} style={styles.chip}>トレ開始</button>
            <button type="button" onClick={() => sendQuickAction('ベンチプレス62.5kgを8回できました')} style={styles.chip}>セット記録</button>
            <button type="button" onClick={() => sendQuickAction('昼ごはんに鶏むね肉、ご飯、サラダを食べた')} style={styles.chip}>食事も追加</button>
          </div>

          {messages.filter((message) => message.role !== 'plan').map((message) => (
            message.role === 'user' ? (
              <div key={message.id}>
                <div style={styles.userBubbleSmall}>{message.text}</div>
                <div style={styles.timeRight}>{message.time}</div>
              </div>
            ) : message.role === 'meal' ? (
              <MealAnalysisCard key={message.id} analysis={message.analysis} onAdd={() => addMealToLog(message.analysis.id)} />
            ) : message.role === 'workout' ? (
              <WorkoutAnalysisCard key={message.id} analysis={message.analysis} onAdd={() => addWorkoutToLog(message.analysis.id)} />
            ) : (
              <AssistantText key={message.id}>{message.text}</AssistantText>
            )
          ))}

          {isThinking ? (
            <div style={styles.assistantRow}>
              <div style={styles.sparkle}>✦</div>
              <div style={styles.typingBubble}>
                <span style={styles.typingDot} />
                <span style={styles.typingDot} />
                <span style={styles.typingDot} />
              </div>
            </div>
          ) : null}
          </>
          ) : (
          <>
            <AssistantText>
              長期目標を、現実的な週次プランと今日の実行タスクに分解します。期間、現在地、使える日数、避けたい制約をそのまま話してください。
            </AssistantText>

            <PlanningIntakeCard />

            <div style={styles.quickActions}>
              <button type="button" onClick={() => sendQuickAction('6ヶ月でベンチプレス100kgを上げたい')} style={styles.chip}>ベンチ100kg</button>
              <button type="button" onClick={() => sendQuickAction('3ヶ月で体重を5kg減らしたい')} style={styles.chip}>減量計画</button>
              <button type="button" onClick={() => sendQuickAction('体脂肪率を10%にしたい')} style={styles.chip}>体脂肪10%</button>
            </div>

            {messages.filter((message) => message.role === 'plan' || ((message.role === 'assistant' || message.role === 'user') && isGoalPlanningText(message.text.toLowerCase()))).map((message) => {
              if (message.role === 'user') {
                return (
                  <div key={message.id}>
                    <div style={styles.userBubbleSmall}>{message.text}</div>
                    <div style={styles.timeRight}>{message.time}</div>
                  </div>
                );
              }

              if (message.role === 'plan') {
                return <GoalPlanCard key={message.id} analysis={message.analysis} onAdd={() => addPlanToLog(message.analysis.id)} />;
              }

              if (message.role === 'assistant') {
                return <AssistantText key={message.id}>{message.text}</AssistantText>;
              }

              return null;
            })}

            {isThinking ? (
              <div style={styles.assistantRow}>
                <div style={styles.sparkle}>✦</div>
                <div style={styles.typingBubble}>
                  <span style={styles.typingDot} />
                  <span style={styles.typingDot} />
                  <span style={styles.typingDot} />
                </div>
              </div>
            ) : null}
          </>
          )}
        </main>

        <form style={styles.inputBarWrap} onSubmit={submitQuestion}>
          <div style={styles.inputBar}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={isThinking}
              placeholder={getInputPlaceholder(assistantMode)}
              style={styles.askInput}
            />
            <button type="button" style={styles.mic}>⌕</button>
            <button type="submit" disabled={!draft.trim() || isThinking} style={draft.trim() && !isThinking ? styles.send : styles.sendDisabled}>↑</button>
          </div>
        </form>
    </AppShell>
  );
}

function formatMessageTime() {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function getAssistantModeLabel(mode: AssistantMode) {
  if (mode === 'plan-chat') return '計画相談';
  if (mode === 'training') return 'トレーニング';
  return '通常';
}

function makeAssistantReply(question: string, mode: AssistantMode = 'normal') {
  const normalized = question.toLowerCase();

  if (mode === 'plan-chat') {
    return '目標を計画にするには、期間、現在値、到達したい数値、週に使える日数があると精度が上がります。「6ヶ月でベンチ100kg」のように送ってください。';
  }

  if (isGoalPlanningText(normalized)) {
    return 'これは計画相談で扱う内容です。上の「計画相談」に切り替えると、目標を期間、現在地、週次フェーズ、今日の実行タスクに分解できます。';
  }

  if (mode === 'normal' && (normalized.includes('達成') || normalized.includes('できるかな') || normalized.includes('間に合'))) {
    return '今の推定1RM、体重推移、食事ログを見る限り、目標は現実的です。通常モードでは達成見込みを確認でき、細かい計画修正は計画相談で詰められます。';
  }

  if (mode === 'normal' && isTrainingIntentText(normalized)) {
    return 'トレーニング中のセット進行や器具の空き状況は、上の「トレーニング」に切り替えると流れに沿って案内できます。通常では食事、体調、過去実績データの相談を扱います。';
  }

  if (normalized.includes('空') || normalized.includes('あい') || normalized.includes('埋ま') || normalized.includes('使え')) {
    return `今日の予定は${WORKOUT_PLAN.map((exercise) => exercise.name).join('、')}です。空いている器具を教えてください。Bench Pressが空いていなければ、Incline Dumbbell PressかCable Flyから始める順番に組み替えます。`;
  }

  if (normalized.includes('ジム') || normalized.includes('トレーニング') || normalized.includes('筋トレ') || normalized.includes('workout')) {
    return '今日はPush Dayです。Bench Pressから始めましょう。ウォームアップはカード内でチェックし、完了したらSet 1の60kg × 10回へ進みます。';
  }

  if (normalized.includes('sleep') || normalized.includes('睡眠')) {
    return '睡眠は全体的に安定しています。体重が大きく崩れていないので、強めに運動した日の翌日の回復具合を見ると、より判断しやすくなります。';
  }

  if (normalized.includes('fat') || normalized.includes('body') || normalized.includes('体脂肪')) {
    return '体脂肪率と比べると、体重はやや下がりつつ、体脂肪率は狭い範囲で推移しています。急な変化というより、安定した変化に見えます。';
  }

  if (normalized.includes('week') || normalized.includes('summary') || normalized.includes('週') || normalized.includes('サマリー')) {
    return '今週は安定しています。体重は77kg台で推移していて、最新値は77.8kgです。5月からの長い流れでは、まだ少し下向きです。';
  }

  if (normalized.includes('推移') || normalized.includes('グラフ') || normalized.includes('実績') || normalized.includes('データ')) {
    return '通常モードでは体重推移、食事ログ、過去のトレーニング実績をまとめて確認できます。直近12週間の体重はゆるやかに下向きで、ベンチの推定1RMは上向きです。';
  }

  if (normalized.includes('goal') || normalized.includes('70') || normalized.includes('目標')) {
    return '目標は70.0kgに設定されています。今のペースなら、1日ごとの上下に反応しすぎず、週平均を少しずつ下げていくのがよさそうです。';
  }

  if (normalized.includes('weight') || normalized.includes('trend') || normalized.includes('体重') || normalized.includes('傾向')) {
    return '体重は全体として安定しつつ、3ヶ月で少し下がっています。最新値は7月の低い時期より少し上ですが、5月上旬よりは低い水準です。';
  }

  return '体重、体脂肪率、睡眠、週間の変化を一緒に確認できます。トレンド、比較、最近の変化について聞いてみてください。';
}

function getInputPlaceholder(mode: AssistantMode) {
  if (mode === 'plan-chat') return '期間・目標・現在地を話す...';
  if (mode === 'training') return '器具状況・セット実績を話す...';
  return '食事・体調・実績データを話す...';
}

const WORKOUT_PLAN = [
  {
    name: 'Bench Press',
    aliases: ['ベンチ', 'bench'],
    warmups: [
      { label: 'Warmup 1', weight: 40, reps: 10 },
      { label: 'Warmup 2', weight: 50, reps: 6 },
    ],
    sets: [
      { label: 'Set 1', weight: 60, reps: 10 },
      { label: 'Set 2', weight: 65, reps: 8 },
      { label: 'Set 3', weight: 67.5, reps: 8 },
      { label: 'Set 4', weight: 65, reps: 8 },
    ],
  },
  {
    name: 'Incline Dumbbell Press',
    aliases: ['インクライン', 'incline'],
    warmups: [],
    sets: [
      { label: 'Set 1', weight: 22, reps: 10 },
      { label: 'Set 2', weight: 22, reps: 10 },
      { label: 'Set 3', weight: 20, reps: 12 },
    ],
  },
  {
    name: 'Cable Fly',
    aliases: ['ケーブル', 'フライ', 'fly'],
    warmups: [],
    sets: [
      { label: 'Set 1', weight: 18, reps: 12 },
      { label: 'Set 2', weight: 18, reps: 12 },
      { label: 'Set 3', weight: 16, reps: 15 },
    ],
  },
] as const;

type PlannedWorkoutSet = (typeof WORKOUT_PLAN)[number]['sets'][number] | (typeof WORKOUT_PLAN)[number]['warmups'][number];

function makeWorkoutLogAnalysis(text: string, id: number): WorkoutLogAnalysis | null {
  const normalized = text.toLowerCase();
  const workoutWords = ['kg', 'キロ', 'きろ', '回', 'レップ', 'rep', 'でき', '挙が', 'ベンチ', 'プレス', 'スクワット', 'デッド'];
  if (!workoutWords.some((word) => normalized.includes(word))) return null;

  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|キロ|きろ)/i);
  const repsMatch = text.match(/(\d+)\s*(?:回|レップ|rep|reps)/i);
  if (!weightMatch || !repsMatch) return null;

  const actualWeight = Number(weightMatch[1]);
  const actualReps = Number(repsMatch[1]);
  const exercise = inferWorkoutExercise(text);
  const plannedStep = findClosestPlannedStep(exercise.name, actualWeight, actualReps);
  const nextStep = findNextPlannedStep(exercise.name, plannedStep.label);
  const isWarmup = plannedStep.label.includes('Warmup');
  const plannedAchieved = actualWeight >= plannedStep.weight && actualReps >= plannedStep.reps;

  return {
    id,
    exercise: exercise.name,
    phase: isWarmup ? 'ウォームアップ' : '本セット',
    setLabel: plannedStep.label,
    plannedWeight: plannedStep.weight,
    plannedReps: plannedStep.reps,
    actualWeight,
    actualReps,
    restMinutes: isWarmup ? 1 : plannedAchieved ? 3 : 4,
    note: plannedAchieved
      ? `Workoutページの計画 ${plannedStep.weight}kg × ${plannedStep.reps}回 に対して達成です。`
      : `Workoutページの計画 ${plannedStep.weight}kg × ${plannedStep.reps}回 に対して少し未達です。次はフォーム優先で進めましょう。`,
    nextSuggestion: nextStep ? `${nextStep.label} ${nextStep.weight}kg × ${nextStep.reps}回` : '次の種目',
    added: false,
  };
}

function inferWorkoutExercise(text: string) {
  const normalized = text.toLowerCase();
  return WORKOUT_PLAN.find((exercise) => exercise.aliases.some((alias) => normalized.includes(alias))) || WORKOUT_PLAN[0];
}

function findClosestPlannedStep(exerciseName: string, actualWeight: number, actualReps: number): PlannedWorkoutSet {
  const exercise = WORKOUT_PLAN.find((item) => item.name === exerciseName) || WORKOUT_PLAN[0];
  const allSteps = [...exercise.warmups, ...exercise.sets];
  return allSteps.reduce((closest, step) => {
    const closestScore = Math.abs(closest.weight - actualWeight) * 2 + Math.abs(closest.reps - actualReps);
    const stepScore = Math.abs(step.weight - actualWeight) * 2 + Math.abs(step.reps - actualReps);
    return stepScore < closestScore ? step : closest;
  }, allSteps[0]);
}

function findNextPlannedStep(exerciseName: string, currentLabel: string): PlannedWorkoutSet | null {
  const exerciseIndex = WORKOUT_PLAN.findIndex((item) => item.name === exerciseName);
  const exercise = WORKOUT_PLAN[exerciseIndex] || WORKOUT_PLAN[0];
  const allSteps = [...exercise.warmups, ...exercise.sets];
  const currentIndex = allSteps.findIndex((step) => step.label === currentLabel);
  if (currentIndex >= 0 && currentIndex + 1 < allSteps.length) return allSteps[currentIndex + 1];

  const nextExercise = WORKOUT_PLAN[exerciseIndex + 1];
  if (!nextExercise) return null;
  return nextExercise.sets[0];
}

const FOOD_LIBRARY: Array<MealItem & { keywords: string[]; baseGrams?: number }> = [
  { name: 'ご飯', amount: '150g', calories: 252, protein: 3.8, fat: 0.5, carbs: 55.7, keywords: ['ご飯', '白米', 'ライス'], baseGrams: 150 },
  { name: '鮭', amount: '1切れ', calories: 155, protein: 22.3, fat: 6.8, carbs: 0.1, keywords: ['鮭', 'サーモン'] },
  { name: '味噌汁', amount: '1杯', calories: 45, protein: 3.1, fat: 1.4, carbs: 5.2, keywords: ['味噌汁', 'みそ汁'] },
  { name: '卵', amount: '1個', calories: 76, protein: 6.2, fat: 5.2, carbs: 0.2, keywords: ['卵', 'たまご', '玉子'] },
  { name: '納豆', amount: '1パック', calories: 90, protein: 7.4, fat: 4.5, carbs: 5.4, keywords: ['納豆'] },
  { name: 'サラダ', amount: '1皿', calories: 80, protein: 2.2, fat: 4.8, carbs: 8.4, keywords: ['サラダ'] },
  { name: '鶏むね肉', amount: '120g', calories: 190, protein: 27.5, fat: 7.0, carbs: 0.0, keywords: ['鶏むね', '鶏胸', 'チキン'] },
  { name: 'プロテイン', amount: '1杯', calories: 120, protein: 22.0, fat: 1.5, carbs: 4.0, keywords: ['プロテイン'] },
  { name: 'バナナ', amount: '1本', calories: 93, protein: 1.1, fat: 0.2, carbs: 22.5, keywords: ['バナナ'] },
  { name: 'ヨーグルト', amount: '100g', calories: 62, protein: 3.6, fat: 3.0, carbs: 4.9, keywords: ['ヨーグルト'] },
  { name: 'トースト', amount: '1枚', calories: 158, protein: 5.6, fat: 2.5, carbs: 28.0, keywords: ['トースト', 'パン'] },
];

function makeMealAnalysis(text: string, id: number): MealAnalysis | null {
  const normalized = text.toLowerCase();
  const mealWords = ['食べ', '飲ん', '朝ごはん', '朝食', '昼ごはん', '昼食', '夕食', '晩ごはん', '夜ごはん', 'ごはん'];
  const matchedItems = FOOD_LIBRARY
    .filter((food) => food.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())))
    .map((food) => withDetectedAmount(food, text));

  if (matchedItems.length === 0 && !mealWords.some((word) => normalized.includes(word))) return null;

  const items = matchedItems.length > 0
    ? matchedItems
    : [{ name: '食事内容', amount: '標準量', calories: 520, protein: 24, fat: 16, carbs: 68 }];

  const totals = items.reduce(
    (sum, item) => ({
      calories: sum.calories + item.calories,
      protein: sum.protein + item.protein,
      fat: sum.fat + item.fat,
      carbs: sum.carbs + item.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return {
    id,
    mealName: inferMealName(normalized),
    calories: Math.round(totals.calories),
    protein: roundMacro(totals.protein),
    fat: roundMacro(totals.fat),
    carbs: roundMacro(totals.carbs),
    confidence: matchedItems.length >= 2 ? '高め' : 'ふつう',
    note: matchedItems.length > 0 ? '量が不明な食材は標準量で推定しています。' : '食品名が少ないため、標準的な食事量として仮推定しています。',
    items,
    added: false,
  };
}

function withDetectedAmount(food: MealItem & { keywords: string[]; baseGrams?: number }, text: string): MealItem {
  if (!food.baseGrams) return food;

  const keywordPattern = food.keywords.join('|');
  const match = text.match(new RegExp(`(?:${keywordPattern})\\s*(\\d{2,3})\\s*g`, 'i'));
  if (!match) return food;

  const grams = Number(match[1]);
  const scale = grams / food.baseGrams;
  return {
    ...food,
    amount: `${grams}g`,
    calories: food.calories * scale,
    protein: food.protein * scale,
    fat: food.fat * scale,
    carbs: food.carbs * scale,
  };
}

function inferMealName(text: string) {
  if (text.includes('朝')) return '朝食';
  if (text.includes('昼')) return '昼食';
  if (text.includes('夜') || text.includes('夕') || text.includes('晩')) return '夕食';
  if (text.includes('間食') || text.includes('おやつ')) return '間食';
  return '食事';
}

function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

function isNormalModeMessage(message: ChatMessage) {
  if (message.role === 'meal') return true;
  if (message.role === 'workout' || message.role === 'plan') return false;
  return !isGoalPlanningText(message.text.toLowerCase()) && !isTrainingIntentText(message.text.toLowerCase());
}

function isTrainingIntentText(text: string) {
  const trainingWords = ['ジム', 'workout', 'セット', 'rep', 'reps', 'ベンチ空', 'ラック', '空いて', '空い', '休憩', 'kg', 'キロ'];
  return trainingWords.some((word) => text.includes(word));
}

function makeGoalPlanAnalysis(text: string, id: number): GoalPlanAnalysis | null {
  const normalized = text.toLowerCase();
  if (!isGoalPlanningText(normalized)) return null;

  const horizon = inferGoalHorizon(text);

  if (normalized.includes('ベンチ') || normalized.includes('bench')) {
    const targetWeight = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|キロ|きろ)/i)?.[1] || '100';
    return {
      id,
      goalLabel: `ベンチプレス${targetWeight}kg`,
      horizon,
      primaryMetric: '1RM / 推定1RM',
      baseline: '現在 67.5kg × 8 から推定',
      target: `${targetWeight}kg single`,
      weeklyFocus: '週2回のベンチ練習とPush Dayの漸進',
      dailyAction: '次回Bench Pressを予定どおり記録し、RPEと失敗回数を残す',
      phases: ['フォーム固定', 'ボリューム増加', '高重量慣れ', 'ピーキング'],
      checkpoints: ['毎週: 推定1RM更新', '4週ごと: デロード判定', '最終4週: シングル練習'],
      added: false,
    };
  }

  if (normalized.includes('体脂肪') || normalized.includes('body fat')) {
    const targetFat = text.match(/(\d+(?:\.\d+)?)\s*%/)?.[1] || '10';
    return {
      id,
      goalLabel: `体脂肪率${targetFat}%`,
      horizon,
      primaryMetric: '体脂肪率 / 週平均体重',
      baseline: '現在値をHealthデータから確認',
      target: `${targetFat}%`,
      weeklyFocus: '週平均体重を見ながら食事と筋トレ量を調整',
      dailyAction: 'たんぱく質150gと摂取カロリーを食事ログに残す',
      phases: ['現状把握', '緩やかな減量', '停滞調整', '維持への移行'],
      checkpoints: ['毎日: 体重と食事', '毎週: 週平均と腹囲感', '2週停滞: カロリー再設定'],
      added: false,
    };
  }

  return {
    id,
    goalLabel: '体重減量',
    horizon,
    primaryMetric: '週平均体重',
    baseline: '現在の体重トレンドから開始',
    target: inferWeightLossTarget(text),
    weeklyFocus: '週0.4から0.7kgのペースで落とす',
    dailyAction: '夕食までの残りカロリーとPFCをチャットで調整する',
    phases: ['摂取量の見える化', '減量ペース作り', '停滞時の微調整', 'リバウンド予防'],
    checkpoints: ['毎日: 体重と食事', '毎週: 週平均差分', '4週ごと: 継続可能性確認'],
    added: false,
  };
}

function isGoalPlanningText(text: string) {
  const goalWords = ['目標', '計画', 'プラン', 'ヶ月', 'カ月', 'month', 'までに', '減ら', '落と', '上げ', '挙げ', 'したい', 'する', '達成', '目指'];
  const metricWords = ['ベンチ', 'bench', '体重', '減量', '体脂肪', 'kg', 'キロ', '%'];
  return goalWords.some((word) => text.includes(word)) && metricWords.some((word) => text.includes(word));
}

function inferGoalHorizon(text: string) {
  const monthMatch = text.match(/(\d+)\s*(?:ヶ月|カ月|か月|ヵ月|month|months)/i);
  if (monthMatch) return `${monthMatch[1]}ヶ月`;

  const weekMatch = text.match(/(\d+)\s*(?:週|weeks?)/i);
  if (weekMatch) return `${weekMatch[1]}週間`;

  return '12週間';
}

function inferWeightLossTarget(text: string) {
  const lossMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|キロ|きろ).*(?:減|落)/i);
  if (lossMatch) return `-${lossMatch[1]}kg`;

  if (text.toLowerCase().includes('xxx')) return '指定kg分の減量';

  const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|キロ|きろ)/i);
  if (kgMatch) return `${kgMatch[1]}kg`;

  return '目標体重まで';
}

function AssistantText({ children }: { children: string }) {
  return (
    <div style={styles.assistantRow}>
      <div style={styles.sparkle}>✦</div>
      <p style={styles.assistantText}>{children}</p>
    </div>
  );
}

function UserTurn({ children, time }: { children: string; time: string }) {
  return (
    <div>
      <div style={styles.userBubble}>{children}</div>
      <div style={styles.timeRight}>{time}</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={styles.assistantRow}>
      <div style={styles.sparkle}>✦</div>
      <div style={styles.typingBubble}>
        <span style={styles.typingDot} />
        <span style={styles.typingDot} />
        <span style={styles.typingDot} />
      </div>
    </div>
  );
}

function NormalChatIntro({ onStartPlanning, onOpenTraining }: { onStartPlanning: () => void; onOpenTraining: () => void }) {
  const stats = [
    { label: '体重', value: '77.8kg', detail: '週平均 -0.3kg' },
    { label: 'たんぱく質', value: '96 / 150g', detail: '夕食で調整' },
    { label: '直近実績', value: 'BP 67.5×8', detail: '前回ピーク' },
  ];

  return (
    <>
      <AssistantText>
        通常モードでは食事、体調、体重や過去のトレーニング実績をまとめて相談できます。トレーニング中の進行は専用モードに分けています。
      </AssistantText>

      <section style={styles.normalOverviewCard}>
        <div style={styles.workoutHeader}>
          <span style={styles.workoutAiSpark}>AI</span>
          <span style={styles.workoutTitle}>今日の状況</span>
          <span style={styles.workoutStatusPill}>NORMAL</span>
        </div>

        <div style={styles.normalStatGrid}>
          {stats.map((stat) => (
            <div key={stat.label} style={styles.normalStat}>
              <span style={styles.workoutMetricLabel}>{stat.label}</span>
              <strong style={styles.normalStatValue}>{stat.value}</strong>
              <span style={styles.workoutHint}>{stat.detail}</span>
            </div>
          ))}
        </div>

        <div style={styles.normalActionRow}>
          <button type="button" style={styles.normalActionButton} onClick={onStartPlanning}>計画相談</button>
          <button type="button" style={styles.normalSecondaryButton} onClick={onOpenTraining}>トレーニング</button>
        </div>
      </section>
    </>
  );
}

function WeightTrendCard() {
  const points = [78.4, 78.2, 78.0, 77.9, 77.6, 77.7, 77.5, 77.4, 77.6, 77.3, 77.2, 77.3];
  const min = Math.min(...points) - 0.2;
  const max = Math.max(...points) + 0.2;
  const chart = { left: 42, right: 248, top: 20, bottom: 102 };
  const yTicks = [78.5, 78.0, 77.5, 77.0];
  const xTicks = [
    { index: 0, label: 'W1' },
    { index: 5, label: 'W6' },
    { index: 11, label: 'W12' },
  ];
  const getX = (index: number) => chart.left + (index / (points.length - 1)) * (chart.right - chart.left);
  const getY = (point: number) => chart.bottom - ((point - min) / (max - min)) * (chart.bottom - chart.top);
  const path = points
    .map((point, index) => {
      const x = getX(index);
      const y = getY(point);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <section style={styles.normalInsightCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>体重推移</span>
        <span style={styles.workoutStatusPill}>12 weeks</span>
      </div>

      <div style={styles.weightChartPanel}>
        <svg viewBox="0 0 270 132" style={styles.weightChartSvg} aria-label="体重推移グラフ">
          <text x="6" y="14" fill={COLORS.textMuted} fontSize="10" fontWeight="800">kg</text>
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <path d={`M ${chart.left} ${y.toFixed(1)} H ${chart.right}`} stroke={COLORS.borderStrong} strokeWidth="1" opacity="0.75" />
                <text x="6" y={y + 4} fill={COLORS.textSecondary} fontSize="10" fontWeight="800">{tick.toFixed(1)}</text>
              </g>
            );
          })}
          <path d={`M ${chart.left} ${chart.top} V ${chart.bottom} H ${chart.right}`} stroke={COLORS.borderStrong} strokeWidth="1.2" />
          {xTicks.map((tick) => {
            const x = getX(tick.index);
            return (
              <g key={tick.label}>
                <path d={`M ${x.toFixed(1)} ${chart.bottom} V ${chart.bottom + 5}`} stroke={COLORS.borderStrong} strokeWidth="1" />
                <text x={x} y="124" textAnchor="middle" fill={COLORS.textSecondary} fontSize="10" fontWeight="800">{tick.label}</text>
              </g>
            );
          })}
          <path d={path} fill="none" stroke={COLORS.primary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => {
            const x = getX(index);
            const y = getY(point);
            return <circle key={`${point}-${index}`} cx={x} cy={y} r={index === points.length - 1 ? 5 : 3} fill={index === points.length - 1 ? COLORS.primarySoft : COLORS.primary} />;
          })}
          <text x={getX(points.length - 1) - 2} y={getY(points[points.length - 1]) - 10} textAnchor="end" fill={COLORS.primarySoft} fontSize="10" fontWeight="900">
            77.3kg
          </text>
        </svg>
      </div>

      <div style={styles.normalMetricGrid}>
        <div style={styles.normalMiniMetric}>
          <span style={styles.workoutMetricLabel}>START</span>
          <strong style={styles.normalMiniValue}>78.4kg</strong>
        </div>
        <div style={styles.normalMiniMetric}>
          <span style={styles.workoutMetricLabel}>LATEST</span>
          <strong style={styles.normalMiniValue}>77.3kg</strong>
        </div>
        <div style={styles.normalMiniMetric}>
          <span style={styles.workoutMetricLabel}>TREND</span>
          <strong style={styles.normalMiniValue}>-1.1kg</strong>
        </div>
      </div>
    </section>
  );
}

function PerformanceDataCard() {
  const rows = [
    { label: 'Bench Press', value: '67.5kg × 8', detail: '推定1RM 85.5kg' },
    { label: '総セット', value: '10 sets', detail: 'Push Day完了率 100%' },
    { label: '食事連携', value: 'P 96g', detail: '残り54g' },
  ];

  return (
    <section style={styles.normalInsightCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>実績データ</span>
        <span style={styles.workoutStatusPill}>INSIGHT</span>
      </div>

      <div style={styles.performanceList}>
        {rows.map((row) => (
          <div key={row.label} style={styles.performanceRow}>
            <span style={styles.performanceText}>
              <strong style={styles.performanceTitle}>{row.label}</strong>
              <span style={styles.workoutHint}>{row.detail}</span>
            </span>
            <strong style={styles.performanceValue}>{row.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function GoalOutlookCard({ onStartPlanning }: { onStartPlanning: () => void }) {
  return (
    <section style={styles.normalInsightCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>目標達成見込み</span>
        <span style={styles.completePill}>ON TRACK</span>
      </div>

      <div style={styles.goalOutlookPanel}>
        <span style={styles.workoutMeta}>BENCH 100KG</span>
        <strong style={styles.goalOutlookValue}>72%</strong>
        <span style={styles.workoutHint}>今の推定1RMと体重トレンドなら、6ヶ月計画としては現実的です。停滞したらボリューム週と回復週を調整します。</span>
      </div>

      <div style={styles.goalOutlookGrid}>
        <span style={styles.goalSignalGood}>重量は上向き</span>
        <span style={styles.goalSignalGood}>体重は急落なし</span>
        <span style={styles.goalSignalWarn}>睡眠不足週は注意</span>
      </div>

      <ActionButton onClick={onStartPlanning} variant="primary" style={styles.mealAddButton}>
        計画相談で見直す
      </ActionButton>
    </section>
  );
}

function ActivePlanStrip({ onStartPlanning }: { onStartPlanning: () => void }) {
  return (
    <section style={styles.activePlanStrip}>
      <div style={styles.activePlanMain}>
        <span style={styles.workoutMeta}>ACTIVE PLAN</span>
        <strong style={styles.activePlanTitle}>ベンチプレス100kg</strong>
        <span style={styles.workoutHint}>今日: Bench Pressの実績とRPEを残す</span>
      </div>
      <button type="button" style={styles.activePlanButton} onClick={onStartPlanning}>
        相談
      </button>
    </section>
  );
}

function PlanningIntakeCard() {
  const items = [
    { label: '目標', value: 'ベンチ100kg / 体重-5kg / 体脂肪10%' },
    { label: '期間', value: '3ヶ月 / 6ヶ月 / 大会日まで' },
    { label: '現在地', value: '今の重量・体重・体脂肪率' },
    { label: '制約', value: '週の日数・器具・ケガ・食事条件' },
  ];

  return (
    <section style={styles.planIntakeCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>計画相談</span>
        <span style={styles.workoutStatusPill}>DRAFT</span>
      </div>

      <div style={styles.planIntakeGrid}>
        {items.map((item) => (
          <div key={item.label} style={styles.planIntakeItem}>
            <span style={styles.workoutMetricLabel}>{item.label}</span>
            <strong style={styles.planMetricValue}>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function MealAnalysisCard({ analysis, onAdd }: { analysis: MealAnalysis; onAdd: () => void }) {
  const macroTotal = analysis.protein + analysis.fat + analysis.carbs;
  const macroValues = [
    { label: 'P', value: analysis.protein, color: COLORS.protein },
    { label: 'F', value: analysis.fat, color: COLORS.fat },
    { label: 'C', value: analysis.carbs, color: COLORS.carbs },
  ];

  return (
    <section style={styles.mealCard}>
      <div style={styles.mealSuggestionHeader}>
        <span style={styles.mealAiSpark}>AI</span>
        <span style={styles.mealSuggestionTitle}>整理案</span>
        <span style={analysis.added ? styles.mealSavedPill : styles.mealConfidencePill}>
          {analysis.added ? '追加済み' : analysis.confidence}
        </span>
      </div>

      <p style={styles.mealSuggestionText}>{analysis.note}</p>

      <div style={styles.mealItemChips}>
        {analysis.items.map((item) => (
          <span key={`${item.name}-${item.amount}`} style={styles.mealItemChip}>
            {item.name} · {item.amount}
          </span>
        ))}
      </div>

      <div style={styles.mealMacroPanel}>
        <div style={styles.mealMacroHeader}>
          <span style={styles.mealMacroTitle}>{analysis.mealName}のPFC推定</span>
          <span style={styles.mealMacroCalories}>{analysis.calories} kcal</span>
        </div>

        <div style={styles.mealMacroBar} aria-hidden="true">
          {macroValues.map((macro) => {
            const width = macroTotal > 0 ? (macro.value / macroTotal) * 100 : 0;
            return <span key={macro.label} style={{ ...styles.mealMacroBarSegment, width: `${width}%`, background: macro.color }} />;
          })}
        </div>

        <div style={styles.mealMacroGrid}>
          {macroValues.map((macro) => (
            <div key={macro.label} style={styles.mealMacroCell}>
              <span style={{ ...styles.mealMacroDot, background: macro.color }} />
              <span style={styles.mealMacroLabel}>{macro.label}</span>
              <strong style={styles.mealMacroValue}>{Math.round(macro.value)}g</strong>
            </div>
          ))}
        </div>
      </div>

      <ActionButton onClick={onAdd} disabled={analysis.added} variant={analysis.added ? 'secondary' : 'primary'} style={styles.mealAddButton}>
        {analysis.added ? '食事ログに追加済み' : '食事ログに追加'}
      </ActionButton>
    </section>
  );
}

function benchPressSteps() {
  return [...WORKOUT_PLAN[0].warmups, ...WORKOUT_PLAN[0].sets].map((step) => `${step.weight}kg × ${step.reps}`);
}

function inclineSteps() {
  return WORKOUT_PLAN[1].sets.map((step) => `${step.weight}kg × ${step.reps}`);
}

function WarmupChecklistCard({
  checked,
  skipped,
  onToggle,
  onSkip,
}: {
  checked: boolean[];
  skipped: boolean;
  onToggle: (index: number) => void;
  onSkip: () => void;
}) {
  const warmups = WORKOUT_PLAN[0].warmups;
  const completedCount = skipped ? warmups.length : checked.filter(Boolean).length;
  const isComplete = skipped || completedCount === warmups.length;

  return (
    <section style={styles.workoutCoachCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>ウォームアップ</span>
        <span style={isComplete ? styles.completePill : styles.workoutStatusPill}>
          {skipped ? 'SKIPPED' : isComplete ? 'DONE' : `${completedCount}/${warmups.length}`}
        </span>
      </div>

      <div style={styles.warmupChecklist}>
        {warmups.map((warmup, index) => {
          const isChecked = !skipped && checked[index];
          return (
            <label key={warmup.label} style={isChecked ? styles.warmupCheckRowDone : styles.warmupCheckRow}>
              <input
                type="checkbox"
                checked={isChecked}
                disabled={skipped}
                onChange={() => onToggle(index)}
                style={styles.warmupCheckbox}
              />
              <span style={styles.warmupCheckText}>
                <span style={styles.workoutMeta}>{warmup.label.toUpperCase()}</span>
                <strong style={styles.warmupCheckValue}>{warmup.weight}kg × {warmup.reps}</strong>
                <span style={styles.warmupCheckHint}>{isChecked ? '完了済み' : '終わったらチェック'}</span>
              </span>
            </label>
          );
        })}
      </div>

      <div style={styles.warmupActionRow}>
        <button type="button" style={styles.warmupSkipButton} onClick={onSkip} disabled={skipped}>
          スキップ
        </button>
        <span style={styles.workoutHint}>
          {isComplete ? '本セットへ進めます。' : '完了した行にチェックしてください。'}
        </span>
      </div>
    </section>
  );
}

function WorkoutCoachCard({
  title,
  status,
  exercise,
  focusValue,
  hint,
  steps,
  activeIndex,
}: {
  title: string;
  status: string;
  exercise: string;
  focusValue: string;
  hint: string;
  steps: readonly string[];
  activeIndex: number;
}) {
  return (
    <section style={styles.workoutCoachCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>{title}</span>
        <span style={styles.workoutStatusPill}>{status}</span>
      </div>

      <div style={styles.workoutFocusPanel}>
        <span style={styles.workoutMeta}>{exercise.toUpperCase()}</span>
        <strong style={styles.workoutFocusValue}>{focusValue}</strong>
        <span style={styles.workoutHint}>{hint}</span>
      </div>

      <div style={styles.workoutStepList}>
        {steps.map((step, index) => (
          <span key={`${title}-${step}`} style={index === activeIndex ? styles.workoutStepActive : styles.workoutStep}>
            {step}
          </span>
        ))}
      </div>
    </section>
  );
}

function RestCoachCard({ setLabel, nextLabel, minutes }: { setLabel: string; nextLabel: string; minutes: number }) {
  return (
    <section style={styles.restCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>休憩開始</span>
        <span style={styles.workoutStatusPill}>REST</span>
      </div>

      <div style={styles.restPanel}>
        <span style={styles.workoutMeta}>{setLabel} COMPLETE</span>
        <strong style={styles.restValue}>{minutes}:00</strong>
        <span style={styles.workoutHint}>休憩後は{nextLabel}です。終わったら「休憩完了」と送ってください。</span>
      </div>
    </section>
  );
}

function ExerciseCompleteCard() {
  return (
    <section style={styles.completeCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>種目完了</span>
        <span style={styles.completePill}>DONE</span>
      </div>

      <div style={styles.completePanel}>
        <span style={styles.workoutMeta}>BENCH PRESS</span>
        <strong style={styles.completeTitle}>4 / 4 sets complete</strong>
        <span style={styles.workoutHint}>次の種目候補はIncline Dumbbell Pressです。ベンチ周りが混んでいればCable Flyへ入れ替えます。</span>
      </div>
    </section>
  );
}

function ExerciseSwitchGuardCard({
  currentExerciseName,
  nextExerciseName,
  openSets,
  decision,
  onDecision,
}: {
  currentExerciseName: string;
  nextExerciseName: string;
  openSets: string[];
  decision: 'stay' | 'complete' | 'open';
  onDecision: (decision: 'stay' | 'complete' | 'open') => void;
}) {
  const decisionText = {
    stay: `${currentExerciseName}を続けます。未完了セットを先に片付けます。`,
    complete: `${currentExerciseName}を完了扱いにして、${nextExerciseName}を開きます。`,
    open: `未完了セットを残したまま、${nextExerciseName}を開きます。`,
  }[decision];

  return (
    <section style={styles.guardCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>種目切替の確認</span>
        <span style={styles.guardPill}>CHECK</span>
      </div>

      <div style={styles.guardPanel}>
        <span style={styles.workoutMeta}>EXERCISE IN PROGRESS</span>
        <strong style={styles.guardTitle}>{currentExerciseName} is still open</strong>
        <span style={styles.workoutHint}>
          {nextExerciseName}を始める前に、未完了セットをどう扱うか選んでください。
        </span>
      </div>

      <div style={styles.guardOpenList}>
        {openSets.map((set) => (
          <span key={set} style={styles.guardOpenSet}>{set}</span>
        ))}
      </div>

      <div style={styles.guardActions}>
        <button type="button" style={decision === 'complete' ? styles.guardActionActive : styles.guardAction} onClick={() => onDecision('complete')}>
          Complete & Open
        </button>
        <button type="button" style={decision === 'open' ? styles.guardActionActive : styles.guardAction} onClick={() => onDecision('open')}>
          Open Anyway
        </button>
        <button type="button" style={decision === 'stay' ? styles.guardActionActive : styles.guardAction} onClick={() => onDecision('stay')}>
          Stay
        </button>
      </div>

      <p style={styles.guardDecision}>{decisionText}</p>
    </section>
  );
}

function GoalPlanCard({ analysis, onAdd }: { analysis: GoalPlanAnalysis; onAdd: () => void }) {
  return (
    <section style={styles.planCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>計画案</span>
        <span style={analysis.added ? styles.mealSavedPill : styles.workoutStatusPill}>
          {analysis.added ? '追加済み' : analysis.horizon}
        </span>
      </div>

      <div style={styles.planHeroPanel}>
        <span style={styles.workoutMeta}>GOAL</span>
        <strong style={styles.planGoal}>{analysis.goalLabel}</strong>
        <span style={styles.workoutHint}>{analysis.primaryMetric}を追いながら、日々の記録に変換します。</span>
      </div>

      <div style={styles.planMetricGrid}>
        <div style={styles.planMetric}>
          <span style={styles.workoutMetricLabel}>現在地</span>
          <strong style={styles.planMetricValue}>{analysis.baseline}</strong>
        </div>
        <div style={styles.planMetric}>
          <span style={styles.workoutMetricLabel}>到達点</span>
          <strong style={styles.planMetricValue}>{analysis.target}</strong>
        </div>
      </div>

      <div style={styles.planRoadmap}>
        {analysis.phases.map((phase, index) => (
          <span key={phase} style={index === 0 ? styles.planPhaseActive : styles.planPhase}>
            <span style={styles.planPhaseIndex}>{index + 1}</span>
            {phase}
          </span>
        ))}
      </div>

      <div style={styles.planActionPanel}>
        <span style={styles.workoutMeta}>NEXT ACTION</span>
        <strong style={styles.workoutNextText}>{analysis.weeklyFocus}</strong>
        <span style={styles.workoutHint}>{analysis.dailyAction}</span>
      </div>

      <div style={styles.planCheckpointList}>
        {analysis.checkpoints.map((checkpoint) => (
          <span key={checkpoint} style={styles.planCheckpoint}>{checkpoint}</span>
        ))}
      </div>

      <ActionButton onClick={onAdd} disabled={analysis.added} variant={analysis.added ? 'secondary' : 'primary'} style={styles.mealAddButton}>
        {analysis.added ? '実行計画に追加済み' : '実行計画に追加'}
      </ActionButton>
    </section>
  );
}

function WorkoutAnalysisCard({ analysis, onAdd }: { analysis: WorkoutLogAnalysis; onAdd: () => void }) {
  const volume = Math.round(analysis.actualWeight * analysis.actualReps);

  return (
    <section style={styles.workoutCard}>
      <div style={styles.workoutHeader}>
        <span style={styles.workoutAiSpark}>AI</span>
        <span style={styles.workoutTitle}>セット解析</span>
        <span style={analysis.added ? styles.mealSavedPill : styles.workoutStatusPill}>
          {analysis.added ? '記録済み' : analysis.phase}
        </span>
      </div>

      <p style={styles.mealSuggestionText}>{analysis.note}</p>

      <div style={styles.workoutMetricGrid}>
        <div style={styles.workoutMetric}>
          <span style={styles.workoutMetricLabel}>ACTUAL</span>
          <strong style={styles.workoutMetricValue}>{analysis.actualWeight}kg</strong>
          <span style={styles.workoutMetricSub}>{analysis.actualReps} reps</span>
        </div>
        <div style={styles.workoutMetric}>
          <span style={styles.workoutMetricLabel}>VOLUME</span>
          <strong style={styles.workoutMetricValue}>{volume}</strong>
          <span style={styles.workoutMetricSub}>kg</span>
        </div>
        <div style={styles.workoutMetric}>
          <span style={styles.workoutMetricLabel}>REST</span>
          <strong style={styles.workoutMetricValue}>{analysis.restMinutes}</strong>
          <span style={styles.workoutMetricSub}>min</span>
        </div>
      </div>

      <div style={styles.workoutNextPanel}>
        <span style={styles.workoutMeta}>{analysis.exercise} · {analysis.setLabel}</span>
        <strong style={styles.workoutNextText}>
          次は{analysis.nextSuggestion}を提案
        </strong>
      </div>

      <ActionButton onClick={onAdd} disabled={analysis.added} variant={analysis.added ? 'secondary' : 'primary'} style={styles.mealAddButton}>
        {analysis.added ? 'ワークアウトログに追加済み' : 'ワークアウトログに追加'}
      </ActionButton>
    </section>
  );
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
    fontSize: 32,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
  },
  moreDots: {
    display: 'block',
    fontSize: 18,
    letterSpacing: 2,
    transform: 'translateX(1px) translateY(-1px)',
  },
  headerCenter: { textAlign: 'center' },
  title: { fontSize: 21, fontWeight: 800, letterSpacing: -0.4 },
  modeSwitchWrap: {
    padding: '0 18px 8px',
    boxSizing: 'border-box',
  },
  chat: {
    height: 596,
    overflowY: 'auto',
    padding: '8px 18px 182px',
    boxSizing: 'border-box',
    scrollbarWidth: 'none',
  },
  userBubble: {
    margin: '18px 0 0 auto',
    width: 'fit-content',
    maxWidth: 260,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: '24px 24px 8px 24px',
    padding: '14px 16px',
    fontSize: 17,
    lineHeight: 1.25,
    boxShadow: '0 12px 32px rgba(0,0,0,0.32)',
    wordBreak: 'break-word',
    textAlign: 'left',
  },
  userBubbleSmall: {
    margin: '14px 0 0 auto',
    width: 'fit-content',
    maxWidth: 260,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: '22px 22px 8px 22px',
    padding: '12px 16px',
    fontSize: 16,
    wordBreak: 'break-word',
    textAlign: 'left',
  },
  timeRight: { textAlign: 'right', color: COLORS.textMuted, fontSize: 12, marginTop: 5, marginBottom: 18 },
  assistantRow: {
    display: 'grid',
    gridTemplateColumns: '30px 1fr',
    gap: 10,
    alignItems: 'start',
    marginTop: 18,
    textAlign: 'left',
  },
  sparkle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: COLORS.primary,
    color: COLORS.onPrimary,
    fontSize: 18,
  },
  assistantText: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.28,
    letterSpacing: -0.2,
    textAlign: 'left',
    wordBreak: 'break-word',
  },
  typingBubble: {
    width: 64,
    height: 34,
    borderRadius: 999,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: COLORS.textSecondary,
    display: 'block',
  },
  mealCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  mealSuggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mealAiSpark: {
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
  mealSuggestionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 900,
  },
  mealConfidencePill: {
    marginLeft: 'auto',
    padding: '5px 8px',
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    color: COLORS.primarySoft,
    fontSize: 10,
    fontWeight: 900,
  },
  mealSavedPill: {
    marginLeft: 'auto',
    padding: '5px 8px',
    borderRadius: 999,
    background: 'rgba(71,209,108,0.12)',
    color: COLORS.success,
    fontSize: 10,
    fontWeight: 900,
  },
  mealSuggestionText: {
    margin: 0,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 1.42,
  },
  mealItemChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7,
  },
  mealItemChip: {
    padding: '7px 9px',
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 850,
  },
  mealMacroPanel: {
    marginTop: 4,
    padding: 14,
    borderRadius: 18,
    background: `linear-gradient(145deg, rgba(255, 107, 44, 0.08), ${COLORS.surfaceRaised} 42%)`,
    border: `1px solid ${COLORS.primary}22`,
  },
  mealMacroHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  mealMacroTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 900,
  },
  mealMacroCalories: {
    color: COLORS.primarySoft,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  mealMacroBar: {
    height: 10,
    marginTop: 14,
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    overflow: 'hidden',
    display: 'flex',
  },
  mealMacroBarSegment: {
    height: '100%',
    display: 'block',
  },
  mealMacroGrid: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  mealMacroCell: {
    minHeight: 58,
    padding: '9px 8px',
    borderRadius: 16,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}22`,
    display: 'grid',
    gridTemplateColumns: '8px auto',
    alignContent: 'center',
    gap: '4px 7px',
    boxSizing: 'border-box',
  },
  mealMacroDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginTop: 5,
  },
  mealMacroLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
  },
  mealMacroValue: {
    gridColumn: '2',
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 900,
  },
  mealAddButton: {
    marginTop: 2,
    width: '100%',
  },
  normalOverviewCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  normalStatGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 8,
  },
  normalStat: {
    minHeight: 66,
    padding: '10px 12px',
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    gap: 4,
    boxSizing: 'border-box',
  },
  normalStatValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: -0.3,
  },
  normalActionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  normalActionButton: {
    height: 40,
    border: 0,
    borderRadius: 999,
    background: COLORS.primary,
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  normalSecondaryButton: {
    height: 40,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 999,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  normalInsightCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  weightChartPanel: {
    padding: 10,
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
  },
  weightChartSvg: {
    width: '100%',
    height: 132,
    display: 'block',
  },
  normalMetricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  normalMiniMetric: {
    minHeight: 58,
    padding: '9px 8px',
    borderRadius: 14,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}22`,
    display: 'grid',
    alignContent: 'center',
    gap: 4,
    boxSizing: 'border-box',
  },
  normalMiniValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: -0.2,
  },
  performanceList: {
    display: 'grid',
    gap: 8,
  },
  performanceRow: {
    minHeight: 58,
    padding: '10px 12px',
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: 10,
    boxSizing: 'border-box',
  },
  performanceText: {
    minWidth: 0,
    display: 'grid',
    gap: 4,
  },
  performanceTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 1.1,
    fontWeight: 950,
  },
  performanceValue: {
    color: COLORS.primarySoft,
    fontSize: 14,
    lineHeight: 1,
    fontWeight: 950,
    whiteSpace: 'nowrap',
  },
  goalOutlookPanel: {
    padding: 14,
    borderRadius: 16,
    background: `linear-gradient(145deg, rgba(71, 209, 108, 0.12), ${COLORS.surface} 54%)`,
    border: `1px solid ${COLORS.success}33`,
    display: 'grid',
    gap: 6,
  },
  goalOutlookValue: {
    color: COLORS.success,
    fontSize: 42,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: -0.8,
  },
  goalOutlookGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7,
  },
  goalSignalGood: {
    padding: '7px 9px',
    borderRadius: 999,
    background: 'rgba(71,209,108,0.12)',
    border: `1px solid ${COLORS.success}44`,
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 850,
  },
  goalSignalWarn: {
    padding: '7px 9px',
    borderRadius: 999,
    background: 'rgba(255,159,10,0.12)',
    border: `1px solid ${COLORS.warning}44`,
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: 850,
  },
  activePlanStrip: {
    margin: '0 0 18px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gridTemplateColumns: '1fr 74px',
    alignItems: 'center',
    gap: 12,
    textAlign: 'left',
  },
  activePlanMain: {
    minWidth: 0,
    display: 'grid',
    gap: 4,
  },
  activePlanTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 1.1,
    fontWeight: 950,
    letterSpacing: -0.2,
  },
  activePlanButton: {
    height: 38,
    border: 0,
    borderRadius: 999,
    background: COLORS.primary,
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  planOverview: {
    display: 'grid',
    gap: 12,
    paddingBottom: 24,
  },
  planSummaryCard: {
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  planProgressTrack: {
    height: 10,
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    overflow: 'hidden',
  },
  planProgressFill: {
    height: '100%',
    borderRadius: 999,
    background: COLORS.primary,
    display: 'block',
  },
  planTaskList: {
    display: 'grid',
    gap: 8,
  },
  planTaskRow: {
    minHeight: 46,
    padding: '9px 10px',
    borderRadius: 14,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    gridTemplateColumns: '24px 1fr',
    alignItems: 'center',
    gap: 9,
    boxSizing: 'border-box',
  },
  planTaskIndex: {
    width: 24,
    height: 24,
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    color: COLORS.textSecondary,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 950,
  },
  planTaskIndexActive: {
    width: 24,
    height: 24,
    borderRadius: 999,
    background: COLORS.primary,
    color: COLORS.onPrimary,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 950,
  },
  planTaskText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 1.25,
    fontWeight: 850,
    textAlign: 'left',
  },
  planOverviewActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  planOverviewButton: {
    minWidth: 0,
    width: '100%',
  },
  planIntakeCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  planIntakeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  planIntakeItem: {
    minHeight: 76,
    padding: '10px 9px',
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    alignContent: 'center',
    gap: 6,
    boxSizing: 'border-box',
  },
  workoutCoachCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  workoutCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  planCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  planHeroPanel: {
    padding: 14,
    borderRadius: 16,
    background: `linear-gradient(145deg, rgba(255, 107, 44, 0.12), ${COLORS.surface} 54%)`,
    border: `1px solid ${COLORS.primary}33`,
    display: 'grid',
    gap: 6,
  },
  planGoal: {
    color: COLORS.textPrimary,
    fontSize: 27,
    lineHeight: 1.05,
    fontWeight: 950,
    letterSpacing: -0.5,
  },
  planMetricGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  planOverviewAction: {
    minHeight: 52,
    border: 0,
    borderRadius: 999,
    background: COLORS.primary,
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  planOverviewSecondaryAction: {
    minHeight: 52,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 999,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  planMetric: {
    minHeight: 84,
    padding: '11px 10px',
    borderRadius: 16,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}22`,
    display: 'grid',
    alignContent: 'center',
    gap: 6,
    boxSizing: 'border-box',
  },
  planMetricValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 1.18,
    fontWeight: 900,
    wordBreak: 'break-word',
  },
  planRoadmap: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  planPhase: {
    minHeight: 42,
    padding: '9px 10px',
    borderRadius: 14,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12,
    fontWeight: 900,
    boxSizing: 'border-box',
  },
  planPhaseActive: {
    minHeight: 42,
    padding: '9px 10px',
    borderRadius: 14,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}66`,
    color: COLORS.textPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12,
    fontWeight: 900,
    boxSizing: 'border-box',
  },
  planPhaseIndex: {
    width: 20,
    height: 20,
    borderRadius: 999,
    background: COLORS.primary,
    color: COLORS.onPrimary,
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    fontSize: 10,
    fontWeight: 950,
  },
  planActionPanel: {
    padding: 12,
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    gap: 5,
  },
  planCheckpointList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7,
  },
  planCheckpoint: {
    padding: '7px 9px',
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 850,
  },
  restCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}44`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  completeCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.success}55`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  guardCard: {
    margin: '12px 0 22px 40px',
    padding: 14,
    borderRadius: 18,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.primary}55`,
    display: 'grid',
    gap: 10,
    textAlign: 'left',
  },
  workoutHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  workoutAiSpark: {
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
  workoutTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 900,
  },
  workoutStatusPill: {
    marginLeft: 'auto',
    padding: '5px 8px',
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    color: COLORS.primarySoft,
    fontSize: 10,
    fontWeight: 900,
  },
  workoutFocusPanel: {
    padding: 14,
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.primary}22`,
    display: 'grid',
    gap: 5,
  },
  workoutMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.6,
  },
  workoutFocusValue: {
    color: COLORS.textPrimary,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: -0.8,
  },
  restPanel: {
    padding: 14,
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.primary}22`,
    display: 'grid',
    gap: 5,
  },
  restValue: {
    color: COLORS.primarySoft,
    fontSize: 34,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: -0.8,
  },
  completePanel: {
    padding: 14,
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.success}33`,
    display: 'grid',
    gap: 5,
  },
  completeTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 1.08,
    fontWeight: 950,
    letterSpacing: -0.4,
  },
  completePill: {
    marginLeft: 'auto',
    padding: '5px 8px',
    borderRadius: 999,
    background: 'rgba(71,209,108,0.12)',
    color: COLORS.success,
    fontSize: 10,
    fontWeight: 900,
  },
  guardPill: {
    marginLeft: 'auto',
    padding: '5px 8px',
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    color: COLORS.primarySoft,
    fontSize: 10,
    fontWeight: 900,
  },
  guardPanel: {
    padding: 14,
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.primary}22`,
    display: 'grid',
    gap: 5,
  },
  guardTitle: {
    color: COLORS.textPrimary,
    fontSize: 21,
    lineHeight: 1.08,
    fontWeight: 950,
    letterSpacing: -0.4,
  },
  guardOpenList: {
    display: 'grid',
    gap: 7,
  },
  guardOpenSet: {
    padding: '9px 10px',
    borderRadius: 14,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 900,
  },
  guardActions: {
    display: 'grid',
    gap: 8,
  },
  guardAction: {
    minHeight: 40,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 999,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  guardActionActive: {
    minHeight: 40,
    border: `1px solid ${COLORS.primary}66`,
    borderRadius: 999,
    background: COLORS.surfaceMuted,
    color: COLORS.primarySoft,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  guardDecision: {
    margin: 0,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 1.35,
    fontWeight: 750,
  },
  workoutHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 1.35,
  },
  workoutStepList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
  },
  workoutStep: {
    padding: '9px 10px',
    borderRadius: 14,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 900,
    textAlign: 'center',
  },
  workoutStepActive: {
    padding: '9px 10px',
    borderRadius: 14,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}66`,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 900,
    textAlign: 'center',
  },
  warmupChecklist: {
    display: 'grid',
    gap: 8,
  },
  warmupCheckRow: {
    minHeight: 66,
    padding: '10px 12px',
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    gridTemplateColumns: '28px 1fr',
    alignItems: 'center',
    gap: 10,
    boxSizing: 'border-box',
  },
  warmupCheckRowDone: {
    minHeight: 66,
    padding: '10px 12px',
    borderRadius: 16,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}66`,
    display: 'grid',
    gridTemplateColumns: '28px 1fr',
    alignItems: 'center',
    gap: 10,
    boxSizing: 'border-box',
  },
  warmupCheckbox: {
    width: 22,
    height: 22,
    accentColor: COLORS.primary,
  },
  warmupCheckText: {
    minWidth: 0,
    display: 'grid',
    gap: 4,
  },
  warmupCheckValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: -0.3,
  },
  warmupCheckHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
  },
  warmupActionRow: {
    minHeight: 38,
    display: 'grid',
    gridTemplateColumns: '82px 1fr',
    gap: 10,
    alignItems: 'center',
  },
  warmupSkipButton: {
    height: 38,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 999,
    background: COLORS.surface,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 900,
    fontFamily: 'inherit',
  },
  workoutMetricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  workoutMetric: {
    minHeight: 72,
    padding: '10px 8px',
    borderRadius: 16,
    background: COLORS.surfaceMuted,
    border: `1px solid ${COLORS.primary}22`,
    display: 'grid',
    alignContent: 'center',
    gap: 4,
    boxSizing: 'border-box',
  },
  workoutMetricLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 0.5,
  },
  workoutMetricValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: -0.4,
  },
  workoutMetricSub: {
    color: COLORS.primarySoft,
    fontSize: 11,
    fontWeight: 850,
  },
  workoutNextPanel: {
    padding: 12,
    borderRadius: 16,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    display: 'grid',
    gap: 5,
  },
  workoutNextText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 1.25,
    fontWeight: 900,
  },
  bigCard: {
    margin: '12px 0 20px 0',
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 20px 44px rgba(0,0,0,0.34)',
  },
  chartCardHeader: {
    padding: '18px 18px 8px',
    marginBottom: 0,
  },
  mealAnalysisCard: {
    margin: '12px 0 20px 38px',
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 24,
    padding: 16,
    boxShadow: '0 20px 44px rgba(0,0,0,0.34)',
    textAlign: 'left',
  },
  mealAnalysisNote: {
    margin: '12px 0 0',
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 1.45,
  },
  mealAnalysisItems: {
    marginTop: 12,
    display: 'grid',
    gap: 8,
  },
  mealAnalysisItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '9px 10px',
    borderRadius: 14,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.border}`,
  },
  mealAnalysisItemName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 900,
  },
  mealAnalysisItemMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  mealAnalysisAction: {
    width: '100%',
    marginTop: 12,
  },
  cardTitleBlock: { textAlign: 'left' },
  metricName: { color: COLORS.primary, fontSize: 17, fontWeight: 800, textAlign: 'left' },
  cardPeriod: { color: COLORS.textSecondary, marginTop: 9, fontSize: 14, textAlign: 'left' },
  headerPill: {
    marginTop: 1,
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.textSecondary,
    padding: '6px 9px',
    fontSize: 11,
    fontWeight: 850,
    letterSpacing: 0.4,
    whiteSpace: 'nowrap',
  },
  averageBox: { textAlign: 'right' },
  averageLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: 800, letterSpacing: 0.8 },
  averageValue: { fontSize: 30, fontWeight: 700, letterSpacing: -1 },
  kg: { color: COLORS.textSecondary, fontSize: 16, fontWeight: 600 },
  chartSvg: { width: '100%', height: 150, display: 'block', padding: '0 10px', boxSizing: 'border-box' },
  statsStrip: {
    margin: '10px 12px 12px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    background: COLORS.surfaceRaised,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
  },
  miniStat: { padding: '14px 10px', borderRight: `1px solid ${COLORS.borderStrong}` },
  miniLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 },
  miniValue: { fontSize: 22, fontWeight: 800, letterSpacing: -0.5 },
  miniUnit: { color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 },
  miniSub: { marginTop: 5, fontSize: 12 },
  quickActions: {
    margin: '12px 0 0 0',
    display: 'flex',
    gap: 7,
    overflow: 'hidden',
  },
  chip: {
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    color: COLORS.primary,
    borderRadius: 999,
    padding: '9px 11px',
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  compareCard: {
    margin: '12px 0 0 0',
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderStrong}`,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 20px 44px rgba(0,0,0,0.34)',
  },
  compareHead: {
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr',
    gap: 12,
    alignItems: 'center',
    padding: '14px 16px 10px',
  },
  compareTitlePurple: { color: COLORS.primary, fontWeight: 800, fontSize: 14 },
  compareTitlePink: { color: COLORS.success, fontWeight: 800, fontSize: 14 },
  compareSub: { color: COLORS.textPrimary, fontSize: 12, marginTop: 5 },
  divider: { height: 36, background: COLORS.borderStrong },
  compareStatsStrip: {
    margin: '10px 12px 12px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    background: COLORS.surfaceRaised,
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
  },
  compareStat: {
    padding: '10px 10px 11px',
    borderRight: `1px solid ${COLORS.borderStrong}`,
    textAlign: 'center',
  },
  compareStatLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 },
  compareStatValue: { fontSize: 20, fontWeight: 850, letterSpacing: -0.5 },
  compareStatUnit: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 650 },
  compareStatSub: { marginTop: 1, fontSize: 12 },
  compareSvg: { width: '100%', height: 140, display: 'block', padding: '0 10px', boxSizing: 'border-box' },
  inputBarWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 92,
    zIndex: 4,
    display: 'grid',
    gridTemplateColumns: '1fr',
    alignItems: 'center',
  },
  inputBar: {
    height: 48,
    borderRadius: 999,
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surfaceRaised,
    backdropFilter: 'blur(24px)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px 0 18px',
    boxSizing: 'border-box',
  },
  askInput: {
    flex: 1,
    minWidth: 0,
    border: 0,
    outline: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'inherit',
  },
  placeholder: { flex: 1, color: COLORS.textSecondary, fontSize: 15 },
  mic: {
    border: 0,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: 20,
    marginRight: 8,
    padding: 0,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: 999,
    border: 0,
    background: COLORS.primary,
    color: COLORS.onPrimary,
    fontSize: 20,
    fontWeight: 800,
  },
  sendDisabled: {
    width: 36,
    height: 36,
    borderRadius: 999,
    border: 0,
    background: COLORS.surfaceMuted,
    color: COLORS.inactive,
    fontSize: 20,
    fontWeight: 800,
  },
};

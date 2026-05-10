---
version: alpha
name: Workout Health UI
description: Dark mobile health and workout interface for Apple Health-style home summaries, data review, workout set logging, warmups, rest, and history with a high-contrast training-focused visual system.
colors:
  primary: "#FF6B2C"
  on-primary: "#FFFFFF"
  background: "#050506"
  surface: "#101012"
  surface-raised: "#1C1C1F"
  surface-muted: "#2A2A2E"
  border: "#1B1B1E"
  border-strong: "#2F2F35"
  text-primary: "#FFFFFF"
  text-secondary: "#A1A1AA"
  text-muted: "#7C7C84"
  inactive: "#8A8A93"
  success: "#47D16C"
  danger: "#C5162E"
  health-red: "#FF375F"
  health-orange: "#FF9F0A"
  health-yellow: "#FFD60A"
  health-green: "#32D74B"
  health-blue: "#64D2FF"
  health-purple: "#BF5AF2"
  nutrition-protein: "#FF6B2C"
  nutrition-fat: "#FFB15C"
  nutrition-carbs: "#FF8A6A"
  nutrition-saved: "#FFB38A"
typography:
  display:
    fontFamily: SF Pro Display
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: -0.04em
  title:
    fontFamily: SF Pro Display
    fontSize: 1.35rem
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: -0.03em
  section:
    fontFamily: SF Pro Text
    fontSize: 0.82rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.08em
  body:
    fontFamily: SF Pro Text
    fontSize: 0.95rem
    fontWeight: 500
    lineHeight: 1.45
  meta:
    fontFamily: SF Pro Text
    fontSize: 0.72rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.08em
  metric:
    fontFamily: SF Pro Display
    fontSize: 1.6rem
    fontWeight: 800
    lineHeight: 1
    letterSpacing: -0.04em
rounded:
  sm: 10px
  md: 14px
  lg: 18px
  xl: 24px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 18px
  xl: 24px
  page-x: 18px
  phone-max: 430px
screens:
  home:
    intent: "Daily training and nutrition cockpit for deciding exactly what workout to do, exactly what to eat, how far today has progressed, and which action to take next. It should serve the app workflow rather than imitate Apple Health."
    layout: "Centered 430px by 820px phone frame matching the chat screen, with a fixed iOS-like header, scrollable action-oriented content, a dominant today plan card that immediately shows training and meal focus cards, separate training and meal progress sections, task lists, direct CTAs, and an absolute bottom navigation bar."
    visualRules: "Use the same black phone shell, 24px device radius, raised dark cards, strong card borders, deep shadows, and orange primary accent as the chat page. Use secondary category colors only to clarify data signals or destinations."
    interactionRules: "Primary actions should let users start workout logging and decide the next meal. Secondary actions should support reviewing progress data or asking the AI coach. The active bottom tab uses a muted gray selected surface while inactive tabs stay transparent and subdued."
  meal-input:
    intent: "Fast meal logging screen for saving each meal as MEAL 1, MEAL 2, and so on with P/F/C grams plus a natural-language food memo."
    layout: "Centered 430px by 820px phone frame with the shared header, a daily PFC summary, horizontal meal picker, active meal editor, and today's saved meal log in one scrollable column."
    visualRules: "Reuse the Workout dark surfaces, orange active state, and strong numeric hierarchy. Keep meal logging orange-based: P/F/C use orange-family tonal differences instead of green, yellow, and blue category colors."
    interactionRules: "Selecting a meal changes the active editor. Save Meal commits the current PFC and memo, while + Meal appends a new draft meal without leaving the screen."
  calendar-log:
    intent: "Month-based calendar surface for seeing upcoming training and meal plans as well as whether each day has completed meal and training records, then filling missing meals, sets, and daily notes without losing the selected date context."
    layout: "Centered 430px by 820px phone frame with shared header, a raised month calendar, selected-day summary, and date-context content that changes automatically: past days show actual editors, today shows direct input links, and future days show the plan panel."
    visualRules: "Use the Workout dark surfaces and restrained orange status dots. Planned meals and training appear as outlined dots, completed records appear as filled dots, selected days use surface-muted with a primary border, and future plan labels stay small enough to preserve calendar density."
    interactionRules: "Tapping a day changes the selected date and loads that day's mock log and plan. Future days must only show planned training and meals because actual records cannot exist yet. Today must show direct actions into the dedicated meal and workout input screens. Past days must show actual records only, with a secondary meal/training switch inside the actual editor. The meal editor must preserve meal picker, P/F/C inputs, memo, Draft/Saved state, and Save Meal action. The training editor must preserve exercise selection, set rows, planned vs actual values, done checks, + Set, and Complete actions."
  health-assistant-chat:
    intent: "Assistant hub split into three adjacent modes: Normal for food, body condition, weight trend graphs, historical performance-data conversation, meal parsing, and goal-achievability checks; Plan Chat for long-range RM and bodyweight goal planning; and Training for live workout guidance and set logging. Goals such as bench press milestones, bodyweight change, or body-fat targets belong in Plan Chat before being stored as active plan data."
    layout: "Centered 430px by 820px phone frame with the shared header, a compact top segmented switch for Normal / Plan Chat / Training with enough horizontal tab padding for Japanese labels, scrollable mode-specific content, assistant analysis cards aligned to assistant text, right-aligned human bubbles, quick prompt chips, goal-planning cards, and a fixed bottom natural-language input in all modes."
    visualRules: "Follow Workout colors. Training-mode cards use background, surface, surface-raised, surface-muted, border, border-strong, primary, text, and success only. Do not introduce coach-specific category colors for workout guidance."
    interactionRules: "The top segmented switch is the primary boundary between normal chat, planning chat, and live training. Normal handles meals, body condition, weight trends with chart cards, historical workout-performance analysis, natural-language meal logging cards, and goal-achievability checks; it should redirect active workout progression to Training and goal-plan creation to Plan Chat. Weight trend cards must include a visible y-axis label in kg, y-axis tick labels, x-axis month/day date labels, baseline axes, grid lines, the plotted data line, and a latest-value callout. Plan Chat should first ask for missing slots such as target, deadline, baseline, weekly availability, training frequency, plate increment, and constraints. Once slots are filled, the app should deterministically calculate estimated RM, training max, rounded working weights, RM milestones, date-stamped planned sessions, bodyweight milestones, daily rules, adjustment rules, and reschedule options. Bodyweight planning must start from calories: estimate maintenance calories, set a daily deficit, derive P/F/C grams, then translate those macros into per-meal menus. RM plans and bodyweight plans are stored separately but can be shown together before registration.実績による更新は次回セッションだけの調整を提案し、予定変更は今日へ移動 / 次回に統合 / スキップの選択にする。Full replan is a separate Plan Chat action after confirmation. Training guidance must read from the same planned Push Day structure as WorkoutSetLogPage: Bench Press warmups and sets, then Incline Dumbbell Press, then Cable Fly. The visible Training flow should cover workout start, exercise instruction, exercise selection, warmup start, warmup completion, each set start, each set result, rest start, rest completion, final set completion, exercise completion, next-exercise proposal, next-exercise availability confirmation, and the first set flow for the next exercise. Warmups should be represented as a checklist inside the assistant card; assistant copy should tell the user to check completed rows instead of sending a completion message. Checking every warmup completes the warmup block, and the skip action allows the user to bypass warmups and proceed to the first working set. If the user attempts to start another exercise while the current exercise has incomplete working sets, Training must mirror WorkoutSetLogPage's pending-exercise guard: show an in-chat confirmation with Complete & Open, Open Anyway, and Stay options before changing the active exercise. Training should also guard earlier-set skips, rest adjustments, under-target set results, unfinished workout ending, and equipment-driven reordering with explicit AI cards before mutating the session plan."
components:
  header-bar:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    typography: "{typography.title}"
    height: "112px"
  set-table-header:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    typography: "{typography.section}"
    padding: "{spacing.sm}"
  metric-chip:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    typography: "{typography.metric}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  metric-value:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.metric}"
    rounded: "0px"
    padding: "0px"
  stats-strip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  field-shell:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  macro-summary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
  selectable-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  selectable-card-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  confirm-dialog:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  fixed-input-bar:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.md}"
  overflow-menu:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
  empty-state:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  chart-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  app-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    padding: "0px"
  phone-frame:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    rounded: "0px"
    width: "{spacing.phone-max}"
  home-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.page-x}"
  home-hero-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  home-command-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  home-focus-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  home-favorite-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  home-signal-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  home-workout-plan-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  home-coach-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  home-highlight-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  home-quick-link:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  home-tab-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  home-tab-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.inactive}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  session-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  exercise-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  exercise-card-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  tab-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "10px"
  tab-inactive:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "10px"
  set-row-active:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  set-row-inactive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.inactive}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  warmup-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  warmup-card-active:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  logging-card:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  note-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  rest-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  goal-plan-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  assistant-mode-switch:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "2px 12px"
  normal-overview-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  normal-insight-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  weight-trend-chart:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
  goal-outlook-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  active-plan-strip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  plan-summary-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  plan-intake-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  plan-builder-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  plan-session-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  plan-rule-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  calorie-pfc-plan-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-menu-plan-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  goal-plan-hero:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  goal-plan-phase:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  goal-plan-phase-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  data-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    rounded: "0px"
    padding: "0px"
  data-section-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  data-summary-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  data-metric-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  data-display-settings:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  data-display-settings-trigger:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "0px"
  data-checkbox-chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  data-exercise-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  data-exercise-selector-trigger:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "0px"
  data-rm-progress-card:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  data-rm-status-badge:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "6px"
  data-trend-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  data-tab:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "10px"
  data-tab-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "10px"
  data-period-chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
  data-chart-weight:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.health-red}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  data-chart-calorie:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.health-orange}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  data-chart-energy:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.health-yellow}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  data-chart-body-composition:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.health-purple}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  data-chart-water:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.health-blue}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  data-chart-recovery:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.health-green}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  next-ready-card:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.success}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  history-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  history-row:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  complete-state:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.success}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  secondary-action:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "12px"
  ghost-action:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "10px"
  danger-action:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "12px"
  meal-summary-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  meal-picker-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-picker-card-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-editor-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  meal-entry-mode:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  meal-manual-preset:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.nutrition-protein}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-manual-preset-editor:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-macro-input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-macro-protein:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.nutrition-protein}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-macro-fat:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.nutrition-fat}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-macro-carbs:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.nutrition-carbs}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-saved-state:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.nutrition-saved}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  meal-note-input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-ai-suggestion:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-log-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  meal-save-action:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
    padding: "12px"
  calendar-month-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  calendar-day-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  calendar-day-cell-selected:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  calendar-day-dot-meal:
    backgroundColor: "{colors.nutrition-saved}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
    padding: "0px"
  calendar-day-dot-training:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
    padding: "0px"
  calendar-plan-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  calendar-plan-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  calendar-retro-editor:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  assistant-workout-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  assistant-workout-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  assistant-workout-active-step:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  assistant-warmup-check-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  assistant-warmup-check-row-done:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  assistant-warmup-skip-action:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  assistant-exercise-switch-guard:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  assistant-exercise-switch-action:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  assistant-exercise-switch-action-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  bottom-bar:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
---

## Overview

Workout Health UI は、筋トレ、食事、身体データ、AIコーチを同じ計画データの上で扱うモバイルUIです。黒に近い背景、厚みのあるカード、オレンジのアクティブカラーで、ジム環境でも情報の優先順位が崩れない設計にします。

このドキュメントは、上部front matterのデザイントークンを機械可読な正本とし、本文で画面意図、共通コンポーネント、状態モデル、レビュー観点を説明します。実装変更時は、まず該当する画面章を確認し、必要ならfront matterの `screens` / `components` / tokens と本文を同じ作業で更新します。

Workout Set Log は、筋トレ中に片手で「次に何をするか」「今どこまで終わったか」を迷わず判断するための中核画面です。リスト画面は種目選択とワークアウト全体の進行確認、アクティブ画面は1種目ごとのセット記録、ウォームアップ、休憩、履歴確認に集中します。

このデザインの主役は装飾ではなく、判断速度です。強いコントラスト、太い数値、丸みのある操作面、状態ごとの色差で、疲労下でも誤タップや読み間違いを減らします。

## Product Model

このUIは将来のバックエンド/API連携を前提に設計します。ローカル状態やモックデータはデモUIのための仮実装であり、最終的にはホーム、食事入力、ワークアウト記録、データ確認、チャットが同じユーザー実績データと計画データを参照します。

今日の画面に表示する目標値や進行予定は、ユーザーが事前に定義した計画を正とします。Push Day、目標セット数、食事目標、PFC、カロリー、休憩時間、長期目標は画面ごとの固定値ではなく、計画データから派生する表示として扱います。

ワークアウト記録は、各セットで `actual` を入力する体験を主にします。予定どおり完了するショートカットは残してもよいですが、仕様上の正本は実績重量、実績回数、メモ、休憩、未達時の調整提案をセット単位で保存することです。

開発順序は、まず機能を網羅したデモUIを完成させ、その後にバックエンド/API実装へ移ります。デモUI段階では、実データ連携よりも「必要な画面、状態、確認カード、入力導線、例外フローが揃っているか」を優先してレビューします。

### Product Data Decisions

- データの最終的な正本はバックエンドDBです。フロントエンドの `localStorage`、画面内state、固定mock、生成mockはデモUI用の代替データとして扱います。
- `today summary` はバックエンドの当日ログと当日計画から集計します。ホームのセット完了数、たんぱく質、摂取カロリー、保存済みmeal数、次アクションは固定値ではなく、食事保存、セット実績、計画状態と連動します。
- カロリー、PFC、セット数、休憩時間などの目標値は、画面側の定数ではなく事前定義された計画を正にします。現在の `2200kcal` などの数値はデモ用サンプルであり、実装時は計画APIから受け取ります。
- トレーニング予定がない日は `trainingOffDay` として扱い、ホームとWorkout画面の主状態に `今日はオフ` を表示します。空のセット一覧や `0/0` のような進捗表示だけで済ませず、休養日であることをユーザーが迷わない文言にします。
- 休憩時間は種目・セット・フェーズごとに計画へ定義します。Workout画面とTraining chatは同じ休憩定義を参照し、AIは未達、疲労、ユーザー申告に応じて延長や調整を提案できます。
- セット完了フローは `actualWeight` と `actualReps` の入力または確認を先に置き、その後に `Complete Set` で保存します。予定値入力ショートカットは補助操作として残せますが、保存される正本はactualです。
- MVPのセット記録では `RPE` / `RIR` は入力項目に含めません。AI調整はactual重量、actual回数、未達/完了状態、セットメモ、休憩ログから判断します。将来拡張できる余地は残してよいですが、初期UIでは出しません。
- `Finish Workout` は workout session を保存する操作です。保存対象には開始/終了時刻、実施種目、各セットのplan/actual/done/skipped、ウォームアップ状態、休憩ログ、メモ、途中終了理由、未完了項目を含めます。
- `+ Exercise` は既存種目ライブラリから当日のセッションへ追加する操作です。デモUIでは候補選択までを見せ、バックエンド実装時は追加種目も当日計画との差分として保存します。
- ウォームアップの `Skip` は完了扱いにせず、`skipped` として履歴へ残します。集計では本セット完了数に混ぜず、後から振り返れる補助ログとして扱います。
- 過去ログは自由編集OKです。過去日の食事、トレーニング、日別メモ、体重、水分はCalendar Logから編集できます。MVPでは編集制限や承認フローを置かず、将来バックエンドで修正履歴を持てるデータ設計にします。
- 水分入力はMeal Inputに含めます。日次サマリーに水分実績/目標を追加し、meal保存とは独立して当日の水分量を更新できるようにします。Data Reviewの水分トレンドはこの日次水分ログを参照します。
- 体重入力は追加必須の身体ログです。MVPではCalendar LogまたはHomeの当日入力から `bodyWeight` を保存し、Data Reviewの体重推移、AIの目標達成見込み、Plan Chatの減量計画に反映します。
- チャットの「食事に追加」「ワークアウトに追加」「計画に追加」は、最終的には各ドメインデータへ実際に反映します。デモUIでは反映済み状態、確認カード、関連画面への変化が見えることを優先します。
- Training chat はデモUI段階では機能網羅の会話例として固定シナリオを許容します。バックエンド/API実装段階では、Workout session state と同じ状態機械に接続し、途中入力に応じて本当に分岐します。
- Plan Chatで作成した目標や計画は、最終的には plan として保存し、Active Plan、今日のメニュー、Data Review の目標線、Settings の計画管理に反映します。デモUI段階では保存されたように見える計画カードで十分です。
- Data Review の期間は、デモUI中は固定mockでもよいですが、アプリ実装では実日付ベースで当日を含む履歴を取得します。
- Settings は、計画と連携設定を管理する画面です。目標値、単位、休憩時間、通知、データ連携、AI設定、食事プリセット、ワークアウトテンプレート、種目ライブラリ、アカウント/同期状態を扱います。
- 仕様が実装とずれた場合は `DESIGN.md` を正本にします。実装差分が必要な場合は、UI修正と同じタスクで `DESIGN.md` も更新します。

## Colors

カラーパレットはダークトーンを基盤に、アクティブ状態だけを `primary` のオレンジで強く浮かせます。種目ごとの色分けは行わず、色は状態の意味を伝えるために使います。

- `background` はページ全体とスマホ枠の基調色です。限りなく黒に近い `#050506` を使い、カードの面を浮かせます。
- `surface`, `surface-raised`, `surface-muted` はカード階層です。リストカード、ログ入力、休憩カードなどで段差を作ります。
- `primary` はアクティブセット、`RESTING`、タブ選択、重要CTAに使います。Workout画面では `#FF6B2C` が現在のアクティブセット色です。
- `nutrition-protein`, `nutrition-fat`, `nutrition-carbs`, `nutrition-saved` は食事入力画面だけで使うオレンジ系トーンです。P/F/Cの識別は色相を散らさず、オレンジの濃淡、ラベル、配置で行います。
- `inactive` は未アクティブまたは優先度の低いセット行に使います。現在値は `#8A8A93` です。
- `success` は次セット準備完了や完了状態の補助表現に限定します。
- `danger` は休憩停止や破壊的操作のみに使い、通常のログ導線では使いません。
- `health-red`, `health-orange`, `health-yellow`, `health-green`, `health-blue`, `health-purple` はデータ確認画面のヘルスカテゴリ色です。Apple Health のように指標カテゴリをすばやく見分ける用途に限定し、カード背景や大面積の塗りには使いません。

実装で `rgba(255,255,255,0.08)` のような半透明境界を使う場合も、DESIGN.md のトークンではhex値を基準にし、透明度はコンポーネントの文脈で補足します。

## Typography

タイポグラフィは iOS ライクなサンセリフを前提に、数値と状態ラベルをすばやく読めるようにします。画面内では英語ラベルと日本語説明が混在するため、太さと字間で役割を分けます。

- `display` はワークアウト名や大きな状態表示に使います。詰まった字間で、スポーツアプリらしい密度を出します。
- `title` は種目名、カードタイトル、`Exercise Complete` などの見出しに使います。
- `section` は `SET`, `PLAN`, `ACTUAL`, `CHECK`, `NEXT SET`, `CURRENTLY ACTIVE` などの短い大文字ラベルに使います。
- `body` は説明文、前回実績、ノート本文に使います。
- `meta` は補助情報、進行率、タブ内の小さな注記に使います。
- `metric` は重量、回数、休憩タイマーなど、瞬時に読む必要がある数字に使います。

## Layout

モバイルファーストで、スマホ枠は最大 `430px`、左右余白は `18px` を基本にします。主要な操作は親指が届きやすい下部またはカード内右側に寄せます。

リスト画面は、ヘッダー、セッションカード、種目カード群、固定ボトムバーで構成します。タブは持たず、種目を選んでアクティブ画面へ移動する流れに集中します。

トレーニングオフ日は、リスト画面のセッションカードで `今日はオフ` を主見出しにします。種目カード群は表示しないか、次回予定の控えめなプレビューに留め、主CTAは `休養を記録`、`予定を追加`、`軽めに開始` のようなオフ日用の行動へ切り替えます。

アクティブ画面は、ヘッダー、ステータスカード、`Sets` / `History` タブ、セットテーブルまたは履歴パネルで構成します。未完了時は現在セットのプランを上部に表示し、休憩中は `RESTING` と次セット情報に表示を切り替えます。

セットテーブルは `SET / PLAN / ACTUAL / CHECK` の4列を固定します。テーブル上部には対象種目名を左寄せで表示し、`primary` で強調します。カード見出しは原則左揃えです。

下部固定バーはリスト画面でのみ `+ Exercise` と `Finish Workout` を表示します。アクティブ画面ではセット操作に集中させ、画面内カードのCTAを主導線にします。

## Elevation & Depth

深い背景に対してカードを少しずつ明るくし、シャドウよりも面色と境界で階層を表現します。暗いジムや屋外でもギラつかないよう、境界は低コントラストに保ちます。

- 最背面は `background`。
- 通常カードは `surface`。
- 操作可能なカードや種目カードは `surface-raised`。
- 入力中、休憩中、次セット準備完了などの展開カードは `surface-muted`。
- 境界は `border` と `border-strong` を使い、必要な箇所のみ半透明の白境界に近い表現を加えます。

カードは影で浮かせすぎず、厚い角丸と濃淡で「押せる面」を作ります。これにより、画面の密度を保ちながらもトレーニング中の視線移動を短くできます。

## Shapes

角丸は大きめに統一します。Workout画面ではカード、タブ、ボタンがすべて手に馴染む物理的な操作面として見えることが大事です。

- `sm` は小さな入力面、インラインチップ、数値セルに使います。
- `md` はセット行や小カードに使います。
- `lg` は展開カード、種目カード、ノートカードに使います。
- `xl` はセッションカードやボトムバーなど、画面を支える大きな面に使います。
- `pill` はタブ、バッジ、主要ボタンに使います。

直角のUIは避けます。筋トレ記録は反復操作が多いため、角丸によって押下対象を視覚的にやわらげ、疲労時の緊張感を下げます。

## Components

この章は実装者が最初に参照するコンポーネント運用ルールです。front matter の `components` は視覚トークン、本文は使いどころと禁止したい分岐を定義します。

### Shared App Structure

共通UIは `src/ui` 配下を優先して使います。新しいページや既存ページの外枠を触るときは、ページごとに `page`, `phone`, `header`, `circleButton`, `tab`, `bottomBar`, `progressTrack`, `statusPill`, `primaryButton`, `cardHeader`, `metricChip` を再定義せず、まず `tokens.ts`, `AppShell`, `AppMain`, `AppHeader`, `IconButton`, `ActionButton`, `SegmentedControl`, `BottomTabBar`, `BottomActionBar`, `ProgressBar`, `SectionHeader`, `StatusPill`, `SurfaceCard`, `CardHeader`, `MetricChip`, `MetricValue`, `StatsStrip`, `FieldShell`, `NumberField`, `TextAreaField`, `MacroBar`, `MacroSummaryGrid`, `MacroInputGrid`, `SelectableCard`, `HorizontalPicker`, `ConfirmDialog`, `FixedInputBar`, `OverflowMenu`, `EmptyState`, `ChartCard` で表現できるか確認します。

`tokens.ts` は色、フォント、スマホ枠寸法の実装上の参照元です。色の追加や意味変更を行う場合は、この DESIGN.md の Color System と `tokens.ts` を同じ作業で更新します。画面固有の色は、カテゴリや状態を説明できるものだけを追加し、単なる微調整用のローカル色は増やしません。

`AppShell` は全ページ共通の黒背景、最大430pxのスマホ枠、主要導線の `BottomTabBar` を担います。スクロールは原則としてスマホ枠全体ではなく、ページ内の `main` 領域に閉じ込めます。ページ固有に `display: flex` や角丸差分が必要な場合は `phoneStyle` で補足し、外側の構造は変えません。

`AppMain` はヘッダー下のスクロール領域です。通常は高さ `708px`、左右余白 `18px` を維持します。下部ナビを持つ画面では `withBottomNav` を使い、最後のカードが `BottomTabBar` に隠れない余白を確保します。

`AppHeader` は戻る導線、中央タイトル、補助サブタイトル、右上アクションをまとめます。戻るボタンや右上ボタンは `IconButton` を使い、サイズは50pxの丸ボタンで揃えます。ヘッダー内には主要フォームや大きな状態表示を置かず、現在画面の認知と補助操作だけに絞ります。

`ActionButton` は主要CTA、補助CTA、リンク型CTAの共通ボタンです。`primary` は画面内の最重要操作、`secondary` は通常操作、`ghost` は控えめな補助操作、`danger` は停止や破壊的操作だけに使います。ページ側では `primaryButton` / `secondaryButton` を新規に増やさず、サイズや配置だけをコンテナ側で調整します。

`SegmentedControl` は Workout の `Sets / History`、Data Review のカテゴリ切替、Meal の入力モード切替の共通パターンです。背景は `border-strong`、選択中は `surface-muted` と `text-primary`、未選択は透明背景と `text-secondary` を使います。タブ選択は現在位置の表示に留め、`primary` のオレンジはCTAやアクティブセットなど行動・記録対象の強調へ残します。タブの中で長い説明文を表示せず、短いラベルだけにします。

`BottomTabBar` は主要3導線（今日、カレンダー、データ）の共通ナビゲーションです。`AppShell` から全ページに表示し、現在パスに応じて選択状態を自動で決めます。選択中タブはグレーの選択面にし、オレンジの主CTAと競合させません。食事入力、トレーニング開始、コーチ相談は今日画面内の文脈CTAから入る二次導線とし、ボトムタブには置きません。コーチは今日画面左上の常設アイコンからも開けるようにします。カレンダーは予定と後追い記録、データはグラフと分析という役割を分け、どちらも下部タブから直接アクセスできるようにします。

`BottomActionBar` は画面内の下部アクションを横並びでまとめる共通バーです。Workout リスト画面の `+ Exercise` / `Finish Workout` のようなページ内操作に使い、アプリ主要導線の `BottomTabBar` とは分けて扱います。中身は `ActionButton` を使い、バー自体は配置、列数、gapだけを担います。

`MetricValue` は実績値、単位、目標値を同じ行で扱う数値表示です。カロリーの `XXX/YYYkcal`、セット進捗の `0/10`、体重の `77.6kg` のように、実績を最も強く、目標や単位を控えめに見せるときに使います。

`StatsStrip` は2分割または3分割の統計帯です。グラフ下の最新・変化・目標、Meal summary の補助値、Data Review の小さな比較値に使い、ページごとに分割線や数値サイズを再定義しません。

`FieldShell`, `NumberField`, `TextAreaField` は入力欄の共通土台です。P/F/C、重量、回数、自然言語メモ、セットメモのようなフォームは、ラベル、枠、背景、単位表示の整合性をこの部品で保ちます。

`MacroBar`, `MacroSummaryGrid`, `MacroInputGrid` はP/F/C専用の共通部品です。Protein/Fat/Carbs の色は `nutrition-protein`, `nutrition-fat`, `nutrition-carbs` に固定し、Meal Input、Calendar Log、Assistant の食事整理カードで同じ読み味にします。

`SelectableCard` と `HorizontalPicker` は横スクロールの対象選択に使います。Meal picker、exercise picker、プリセット選択では、選択中だけ `surface-muted` と `primary` 境界で示します。

`ConfirmDialog` は未保存移動、削除、予定変更、未完了セットを残した種目移動など、ユーザーの文脈を変える確認に使います。ページごとに overlay や modal card を再定義しません。

`FixedInputBar` は画面下部に固定される自然言語入力です。Assistant のチャット入力を基準にし、Meal の自然文入力などに展開する場合も `BottomTabBar` と重ならない位置で使います。

`OverflowMenu` は右上三点メニューから開く小さな操作リストです。表示設定、編集メニュー、削除などを画面内に常時展開せず、必要なときだけ出します。

`EmptyState` は未入力、履歴なし、予定なしの共通表示です。空状態は失敗に見せず、次の行動を短く示します。

`ChartCard` はグラフと見出し、補助統計をまとめる共通カードです。Coach と Data Review のグラフは、このカードの中で軸、線、統計帯を揃えます。

`ProgressBar` は達成率、PFC進捗、セット進行などの横棒表現に使います。背景は `surface-muted`、fill は文脈のアクセント色を渡します。値は0〜100に丸め、ページ側で幅計算用の独自spanを作らないようにします。

`SectionHeader` はセクションタイトルと右側の補助アクションをまとめます。ページごとに見出しサイズや余白を再定義せず、`title` と `action` で構成します。

`StatusPill` は保存状態、進捗数、軽いステータス表示に使います。通常は `surface-raised` と `border-strong`、強調時のみ `primary` または `success` のborder/textを使います。大きなCTAや破壊的操作には使いません。

`SurfaceCard` は設定画面や今後の単純な読み取りカードで使う共通カード面です。複雑なドメインカードはページ固有スタイルを許容しますが、背景、境界、角丸、影は `SurfaceCard` と同じ階層に合わせます。

`CardHeader` はカード内のタイトル行と右側メタ/バッジをまとめます。Data Review、Chat内チャートカード、AI解析カードなど読み取りカードでは `CardHeader` を使い、カードごとの見出し余白や横並びを再定義しません。

`MetricChip` は Data Review の最新値、合計、差分のような短い数値サマリーに使います。`label`, `value`, `delta`, `color` で構成し、カード内で複数並ぶ小さな数値面の見た目を揃えます。

### Workout Logging

`ExerciseListCard` は `exercise.name`, `exercise.target`, `exercise.previous` を表示します。右上には完了数/合計セットのバッジを置き、未完了なら `NEXT SET`、完了なら `COMPLETED`、現在対象なら `CURRENTLY ACTIVE` を表示します。ボタン文言は常に `Open` とし、開始やレビューの判断はアクティブ画面側に寄せます。

`ActiveExerciseScreen` の上段ステータスカードは、通常時に `Set X` と予定重量・回数を表示します。休憩中は `RESTING` に切り替え、タイトル下に `Next: kg x reps` 形式で次セットを示します。全セット完了時は `Exercise Complete` を表示します。

`header-bar` は画面上部の固定的な認知レイヤーです。リスト画面ではワークアウト全体、アクティブ画面では現在種目への帰属を示します。高さは `112px` を基準にし、タイトルと補助アクションが詰まりすぎないようにします。

`set-table-header` はセットテーブル上部の種目名と列ラベルに使います。背景は追加のカード面を作らず、`primary` の文字色で現在の記録対象だけを浮かせます。

`metric-chip` は重量、回数、残り時間のような一瞬で読みたい数値を収める小さな面です。`typography.metric` を使い、説明ラベルよりも数字が先に見えるバランスにします。

`SetRow` は4列固定です。未完了セルは `Log Set`、完了セルは実績重量・回数を表示します。アクティブ行は `set-row-active`、非アクティブ行は `set-row-inactive` を使い、色だけでなく背景面でも差を出します。

`warmup-card` と `warmup-card-active` はウォームアップセットに使います。メインセットより少し控えめに見せつつ、実行中のウォームアップだけは `warmup-card-active` で操作対象として明確にします。

`loggingCard` は `SET N LOGGING` を見出しにし、Weight / Reps を入力面として見せます。`Complete Set` は主CTAとして扱い、完了後は行を実績表示へ切り替えます。現状実装では完了時に予定値を実績値として反映します。

`noteCard` は行を開いたときに表示します。ノート本文と `Edit` ボタンを置きますが、現在は編集処理の本体は未実装です。見た目は補助カードとして控えめにし、セット記録より強く見せません。

`inlineRestCard` は休憩中に表示します。左側にタイマー、右側に `Stop` と `Done` のアクションを並べ、残り時間の左右に時間調整ボタンを置きます。カードタイトルは `REST AFTER SET` とし、休憩操作がセット行の流れから外れないようにインラインで表示します。

`nextReadyCard` は休憩完了後に表示します。次セットの準備ができたことを `success` で補助しつつ、主導線は `Log Set` または `Add Rest` にします。

`ExerciseHistoryPanel` は `History` タブで表示します。対象種目名、前回実績、完了済みセット一覧をカード形式で表示します。完了履歴がまだない場合は、空状態として案内文を表示します。

`history-panel` と `history-row` は履歴タブの読み取り専用領域に使います。ここでは新しい操作を増やさず、前回実績と今回完了済みセットの比較を落ち着いて読める密度にします。

`complete-state` は種目完了時の終端表示です。強い成功色を使いすぎず、完了したことと次の行動に移れることを短く伝えます。

`secondary-action` は `Open`, `Add Rest`, `Edit` などの補助CTAに使います。`ghost-action` は時間調整や控えめな補助操作に使い、主CTAと競合しないようにします。

### Assistant Training Flow

`assistant-workout-card` は Training モードの主要な案内カードです。WorkoutSetLogPage と同じ Push Day の順序、セット目標、休憩、完了判定を参照し、チャット上でも別仕様のワークアウト進行を作らないようにします。

`assistant-workout-focus` は現在の種目、次のセット、直近の注意点をまとめる読み取り領域です。Training モードでは coach 固有の新色を追加せず、`surface`, `surface-raised`, `surface-muted`, `primary`, `success` の範囲で状態差を作ります。

`assistant-warmup-check-row` と `assistant-warmup-check-row-done` はウォームアップチェックリストに使います。ユーザーに完了メッセージを送らせるのではなく、行のチェックで進行させます。

`assistant-exercise-switch-guard` は、未完了セットが残ったまま別種目へ移ろうとしたときの確認カードです。選択肢は `Complete & Open`, `Open Anyway`, `Stay` を基本にし、セッション計画を変える前に必ず明示的な意思決定を挟みます。

## Calendar Log Screen (記録カレンダー)

記録カレンダーは、これから何をやる予定かと、日ごとの「食事を記録したか」「トレーニングを記録したか」を同時に俯瞰する画面です。データ確認画面の読み取り中心の役割とは分け、ここでは日付選択、予定確認、食事入力、セット入力、日別メモを同じ文脈で扱います。

### Calendar Log レイアウト指針

- 画面は Workout / Meal と同じ `phone-frame` を使い、ヘッダー、月カレンダー、選択日サマリー、食事/トレーニング切替、選択モードの入力エディタ、日別メモの順に配置する。
- 月カレンダーは `calendar-month-card` として強い単一カードにまとめる。曜日行と日付セルのグリッドは7列固定にし、セルサイズが月内外や状態で変わらないようにする。
- 日付セルは `calendar-day-cell` を基本に、選択中のみ `calendar-day-cell-selected` と `primary` 境界で強調する。今日の日付は選択中でない場合だけ控えめな境界で示す。
- 日付セル下部には2つの小さなドットを置く。左を食事、右をトレーニングに固定し、予定ありならアウトライン、記録ありならそれぞれ `calendar-day-dot-meal` / `calendar-day-dot-training` の塗り、予定も記録もなければ `surface-muted` にする。
- 予定がある日付セルには短い計画ラベルを上端に表示してよい。ラベルは小さく、日付とドットを圧迫しないこと。
- 月カレンダーの直後は、日付の種類で内容を自動決定する。未来日は `calendar-plan-card` だけ、今日の日付は食事入力とトレーニング開始への導線だけ、過去日は実績編集だけを表示する。選択日サマリーカードや `予定 / 実績` のタブは置かない。
- 未来日の予定表示では、選択日に予定があればその日の予定を、なければ次に来る予定を `NEXT UP` として表示する。
- 過去日の実績表示では `食事 / トレーニング` の切替を置き、Meal Input / Workout Set Log に近い後追い入力UIを表示する。予定カードと実績入力を同じ下部領域に同時表示しない。
- Calendar Logでは過去ログを自由編集できます。過去日のmeal、セット実績、完了状態、日別メモ、体重、水分を同じ日付文脈で修正できるようにします。MVPでは編集履歴UIを出さず、保存後の値をその日の実績として扱います。
- 体重入力はCalendar Logの選択日サマリー近くに置くか、日別メモの上に `body-weight-log` として置きます。食事やトレーニングのどちらのモードでも見失わない位置にし、単位はkgに固定します。
- 食事/トレーニング切替は共有 `SegmentedControl` を使う。切替後も選択日を維持し、ユーザーが日付文脈を失わないようにする。

### Calendar Log コンポーネント指針

- 食事側の `calendar-retro-editor` は Meal Input と同じ体験に寄せる。日次カロリー/PFC合計、横スクロールの meal picker、Active Meal、自然言語メモ、P/F/C入力、`Clear`、`Save Meal` を含める。
- 食事側の後追い記録にも日次水分入力を含める。水分はmealごとのP/F/Cとは別の当日値として保存し、`L` 単位の数値入力、目標比、短い増減ボタンを置いてよい。
- 食事の色は Meal Input と同じオレンジ系P/F/Cを使い、Data Review のヘルスカテゴリ色を混ぜない。
- トレーニング側の `calendar-retro-editor` は Workout Set Log と同じ構造に寄せる。Exercise picker、実績の `+ Exercise` 追加ボタン、種目名、target、`SET / PLAN / ACTUAL / DONE` の列、重量と回数の実績入力、完了チェック、`+ Set`、`Complete` を含める。`+ Exercise` はヘッダーの小さなテキストだけでなく、種目一覧の下に明確なボタンとして置く。`RPE` / `RIR` は初期UIに含めない。
- `calendar-plan-card` は自由文ではなく構造データを表示する。トレーニング予定は `exercise.name`, `target`, `sets`、食事予定は `meal.label`, `calories`, `protein`, `fat`, `carbs` を基本にする。食事予定はmeal単位だけでなく、日次の総カロリー、P/F/C合計、PFCバランスバーも表示する。生成が難しい長文の優先事項、自然文メニュー、自由フォーマットの調整メモは予定カードの正本にしない。
- トレーニング予定は `primary`、食事予定は `nutrition-saved` のレールで識別し、どちらも行形式で並べる。文として読ませるのではなく、記録画面に引き継げるフィールドとして見せる。
- 後追い記録では休憩タイマーやライブのウォームアップ進行を主役にしない。過去日の入力は、実績値と完了状態を速く埋められることを優先する。
- 日別メモは食事/トレーニングのどちらのモードでも同じ下部に置く。体調、睡眠、食欲、重量の感触を短く残せる補助入力として扱う。
- モック段階では `DailyLog` を `YYYY-MM-DD` で保持する。将来API化するときも、食事、トレーニング、日別メモを同じ日付キーで保存できる形を前提にする。

## Data Review Screen (データ確認)

データ確認画面は、身体測定、食事、トレーニングを同じ時系列文脈で観察する画面として設計します。Workout / Chat と同じ黒基調を維持しつつ、Apple Health のようなグループカード、控えめな区切り、色付きのカテゴリ指標で「読み取り専用のヘルスダッシュボード」に寄せます。

`data-shell` と `data-section-card` で全体を統一し、カテゴリ切替→指標サマリー→時系列ライン→明細の順で読む導線にします。

### Data Review レイアウト指針

- `header` は画面種別の識別と戻り導線だけを担い、主要情報はカード内にまとめる。
- `data-tab` と `data-tab-active` で3カテゴリ（身体指標、食事、トレーニング）を1回タップで切り替える。Workout / Meal と同じ共有 `SegmentedControl` を使い、36px高、2px gap、14px文字、`border-strong` のpill背景、`surface-muted` の選択状態で統一する。
- `data-period-chip` で 7日 / 12日 / 30日 / 90日 を切り替え、全カテゴリで同じデータレンジを参照できるようにする。期間チップは4等分グリッドで並べ、横幅とgapを揃える。
- データ確認画面も Workout / Chat と同じ `phone-frame` 内に表示し、スマホ枠の外ではなくメインデータ領域だけを縦スクロールさせる。ヘッダー、カテゴリタブ、期間切替は端末フレーム内の認知レイヤーとして残す。
- `data-display-settings-trigger` は画面全体の右上三点メニューとして配置し、押下時だけ `data-display-settings` を開く。計画ラインと目標ラインはこのメニュー内のチェックボックスで表示 / 非表示できるようにし、通常時はデータ確認の主導線を圧迫しない。

### Data Review コンポーネント指針

- 身体指標は `data-summary-card` で最新値を先頭提示し、主要数値を短く読める形で並べる。カードの中にさらに強いカードを入れず、区切り線と余白で Apple Health らしいグループ感を出す。
- サマリー内の `data-metric-card` は上下左右に同じ呼吸感が出るよう、2列グリッドで row gap / column gap をともに確保する。カード同士が縦に接触して見える状態は避ける。
- カードの表情は Workout のカードと揃え、`surface` / `surface-raised`、`border-strong`、深いシャドウ、18pxから24pxの丸みを基準にする。カード見出しと本文は原則左揃えにする。
- 時系列は `data-trend-card` で薄い点線グリッド、連続した実線、淡い面塗りを使い、最新値と差分・レンジを同じカード内に併記する。実績はカテゴリ色の実線、計画は `text-secondary` の破線、目標は `primary` の水平破線で表示する。点だけの散布図に見える状態は避ける。
- トレーニングは種目別に `data-rm-progress-card` を主役にして「推定MAX RMが伸びたか」を最初に判定する。`data-rm-status-badge` で伸びてる / 維持 / 要確認を示し、BEST RM、MAX重量、総ボリューム、総セット数は補助情報として並べる。
- トレーニングは `種目別データ` カード右上の `data-exercise-selector-trigger`（三点メニュー）から `data-exercise-filter` を開き、種目ごとのチェックボックスで選択した種目だけカード表示する。全種目フィルターを常に展開して縦に肥大化させない。
- トレーニングタブでは集計用の「総覧」カードを置かない。消費カロリー推移、三点メニュー付きの種目別データ、選択した種目カードの順に絞り、確認したい対象へ直接入れる構成にする。
- 筋トレ履歴は日付順で追跡可能にし、各行に推定MAX RMと開始日比の差分を併記する。

### Data Review チェックリスト

- 主要指標は 1 回の目視で「最新」「差分」「推移」が把握できること。
- すべてのカテゴリで実績、計画、目標を比較でき、表示設定で計画 / 目標を切り替えられること。
- 身体指標は体重・体脂肪・BMI・ウエストを期間内で同じ日軸で確認できること。
- 食事セクションは摂取カロリーと水分を同一時間軸で確認できること。P/F/C の時系列カードはデータ確認画面では展開せず、食事入力画面側の詳細に寄せる。
- トレーニングセクションで消費カロリー推移と、選択した種目ごとの推定MAX RMステータスを確認できること。
- 折れ線グラフには必ず連続した線があり、点線はグリッドや補助軸だけに使うこと。
- `primary` は Workout のアクティブ状態に強く残し、データ確認画面ではヘルスカテゴリ色と `text-secondary` / `text-muted` を中心に使うこと。

## Meal Input Screen (食事入力)

食事入力画面は、1日の食事を `MEAL 1`, `MEAL 2` のような単位で保存する記録UIです。Workout画面の「現在対象を選んで入力する」構造を食事に置き換え、Chat画面の自然文入力の気軽さを主入力として取り入れます。

### Meal Input レイアウト指針

- 画面は Workout / Chat と同じ `phone-frame` を使い、ヘッダー、日次サマリー、横スクロールの meal picker、アクティブ meal editor、保存済みログの順で配置する。
- 食事入力ヘッダーの右上は3点メニューにし、設定画面へ遷移する。AIコーチの星アイコンは使わず、AI機能は画面内の `AI整理` モードに閉じ込める。
- 日次サマリーは実績/目標カロリー、P/F/C合計、水分実績/目標を先頭に置き、保存済みmeal数を右上の小さなバッジで示す。カロリーは `XXX/YYYkcal` 形式で表示し、実績の `XXX` を最も強く、目標の `YYY` は控えめに見せる。
- meal picker は `MEAL 1`, `MEAL 2` を短いカードとして並べ、アクティブなmealだけ `primary` 境界と `surface-muted` で強調する。
- meal editor は `AI整理` と `手入力` の入力方法を切り替えられるようにする。AI整理では自然言語メモを上、AI整理案を中段、P/F/Cの数値確認を下に置く。手入力ではP/F/Cを先に直接入力し、必要なら自然言語メモを残す。
- editor header では `MEAL 1` のような対象名を主表示にし、`Draft` / `Saved` は小さな状態バッジに留める。`編集中` のような状態語を最大見出しにしない。
- AI推定は任意です。推定せずにP/F/Cを直接入力して保存でき、推定後もP/F/Cは通常の入力欄として変更できる。
- `+ Meal` は同じ画面内で新しいdraft mealを追加し、入力中の文脈を切らない。

### Meal Input コンポーネント指針

- `meal-summary-card` は実績/目標カロリー、P/F/C比率バー、P/F/Cグラム合計をまとめる。カード内の数値は Workout の metric 表現に近づけ、実績カロリーだけを大きく強調する。
- `meal-water-input` はMeal Input内の日次水分入力です。mealごとの栄養とは分け、`L` 単位の数値入力、目標比、`+250ml` などの短い加算操作を置けます。保存先は当日の水分ログで、Data Reviewの水分トレンドに反映します。
- `meal-picker-card` はmeal単位の切替面として使う。保存済みかdraftか、P/F/Cの短い要約、食事時刻を表示する。
- `meal-editor-card` は現在のmealだけを編集する主領域です。編集中は `Draft`、保存後は `Saved HH:mm` の状態を出す。
- `meal-entry-mode` は `AI整理` と `手入力` を切り替えるsegmented controlです。Workout画面の `SegmentedControl` と同じ 36px height、`border-strong` 背景、2px padding、2px gap、active=`surface-muted` の見た目に揃える。どちらのモードでも `Save Meal` は同じ保存操作で、P/F/Cとメモをまとめて保存する。
- `meal-note-input` は食材名、外食の量感、補足を自然言語で残す主入力です。P/F/C入力より先に配置し、ユーザーが最初に食べた内容を書く流れにする。
- AI整理モードにはプリセット候補チップを置かない。自然言語入力、AI整理CTA、整理案、P/F/C確認に集中させる。
- 手入力モードにはP/F/Cプリセットチップを置いてよい。プリセットはP/F/C数値だけを反映し、自然言語メモやAI整理案は上書きしない。
- P/F/Cプリセットの見出し右側には3点アイコンを置き、タップすると `meal-manual-preset-editor` として名前・Protein・Fat・Carbsをインライン編集できるようにする。AI整理モードにはこの編集導線を出さない。
- `meal-ai-suggestion` は自然言語メモから推定した食材リスト、要約、信頼度を表示する。ここでP/F/C推定値を作り、下段の手動入力で修正できる前提にする。カードの境界とAIバッジもオレンジ基調にする。
- AI整理CTAの補足テキストはボタン横に置かない。狭いphone frameでは補足はボタン下に回し、CTA自体を1列幅で確保する。
- `meal-macro-input` は Protein / Fat / Carbs の3列固定にする。色は Protein=`nutrition-protein`, Fat=`nutrition-fat`, Carbs=`nutrition-carbs` のオレンジ系トーンに限定し、緑・青のカテゴリ色は使わない。
- `meal-log-card` は保存済み/編集中のmealを読み返すための一覧です。タップするとそのmealを再編集できる。

### Meal Input チェックリスト

- `MEAL 1`, `MEAL 2` の切替が、現在どの食事を編集しているか一目で分かること。
- P/F/Cは同じ入力密度で並び、どれか1項目だけが過度に目立たないこと。
- 自然言語メモはP/F/C入力より上に置き、AI整理案と手動調整を経て同じ `Save Meal` で完了すること。
- AI整理案がある場合は、推定された食材リストとP/F/Cが同じ画面内で確認できること。
- 水分入力が食事入力と同じ画面で完了できること。水分はmealのP/F/Cを保存しなくても更新できること。
- 推定せずに手入力だけでP/F/Cを保存できること。
- 推定後のP/F/Cは編集可能で、AI整理案が確定値のように見えないこと。
- 保存後は一覧とpickerの両方で `Saved` 状態が確認できること。
- 追加mealは空のdraftとして作られ、既存mealの内容を上書きしないこと。

## Do's and Don'ts

Do: アクティブ状態には必ず `primary` を使い、現在どのセットに集中すべきかを一目で分かるようにします。

Do: 数値は大きく太く表示します。重量、回数、タイマーは説明文よりも先に目に入るべきです。

Do: リスト画面では選択、アクティブ画面では記録という役割分担を守ります。

Do: セット行の列構成は崩さず、`SET / PLAN / ACTUAL / CHECK` の読み順を維持します。

Don't: 種目ごとに別のアクセントカラーを割り当てないでください。色の意味が状態から種目分類へ分散し、トレーニング中の判断速度が落ちます。

Don't: 低優先度のメタ情報を `primary` で強調しないでください。オレンジはアクティブ、休憩、重要CTAのために残します。

Don't: カード間隔を詰めすぎないでください。ジム中の片手操作では、密度よりタップの確実性を優先します。

Don't: 完了、休憩、次セット準備完了を同じ見た目にしないでください。状態が似ると、誤って次の操作に進むリスクが上がります。

## State Model

Workout画面の視覚状態は、データ構造よりも「今ユーザーが取るべき行動」を優先して設計します。状態名は実装のstateと完全一致しなくてもよいですが、見た目の切り替えはこのモデルに沿わせます。

`list` はワークアウト全体の俯瞰状態です。ユーザーは種目を選び、現在の進捗と残り作業を確認します。主なコンポーネントは `session-card`, `exercise-card`, `exercise-card-active`, `bottom-bar` です。

`off-day` は当日のトレーニング予定がない状態です。`session-card` は `今日はオフ` を最も大きく表示し、補助文では「休養日」または次回予定だけを短く示します。通常の `exercise-card` とセット進捗は主役にせず、ユーザーが誤って未設定状態や読み込み失敗と解釈しないようにします。

`active-idle` は種目詳細を開いたが、まだセット入力を開始していない状態です。次に行うセットを上段ステータスカードと `set-row-active` で示します。

`warmup-active` はウォームアップ進行中の状態です。`warmup-card-active` を使い、メインセットより軽い操作に見せつつ、現在の実行対象だけは明確にします。

`logging` はセット実績を入力または確認している状態です。`logging-card`, `metric-chip`, `secondary-action` を使い、重量と回数を短時間で確認できるようにします。

`resting` はセット完了後の休憩状態です。`rest-card` と `metric-chip` を使い、タイマーを最優先で読ませます。`Stop` は `danger-action`、`Done` は主要または補助CTAとして扱います。

`next-ready` は休憩後に次セットへ進める状態です。`next-ready-card` を使い、ユーザーが迷わず `Log Set` へ戻れるようにします。

`history` は読み取り専用状態です。`history-panel` と `history-row` を使い、操作より比較と振り返りを優先します。

`complete` は種目完了状態です。`complete-state` を使い、完了の達成感を出しつつ、次の種目へ意識を移せるようにします。

## Implementation Notes

このDESIGN.mdは `src/pages/WorkoutSetLogPage.tsx` の現在実装を前提にしていますが、実装ファイルへ直接依存しすぎないようにしています。トークンはUIの意図を固定し、実装は必要に応じてReact stateやpropsへ変換してください。

`ACTIVE_SET_COLOR` は `colors.primary` に対応します。現在の値は `#FF6B2C` です。

`INACTIVE_SET_COLOR` は `colors.inactive` に対応します。lintのコントラスト基準を満たすため、現在のデザイントークンでは `#8A8A93` を推奨値にしています。

既存実装がインラインスタイルを使う場合も、色・角丸・余白はこのファイルのトークン名をコメントや変数名に反映すると、後続の変更が追いやすくなります。

新しいコンポーネントを追加する場合は、まず `components` に視覚トークンを足し、その後でMarkdown本文に使いどころを説明してください。これにより、lintと人間のレビューの両方で設計意図を確認できます。

## Export Targets

このDESIGN.mdは `@google/design.md` の `export` コマンドでTailwindやDTCG形式へ変換できる構造にしています。

現在利用できる `@google/design.md 0.1.1` では、Tailwind向けには `tailwind` を使います。

Tailwind v4向けのCSS変数形式が必要な場合は、インストール済みCLIが `css-tailwind` をサポートしているか確認してから使います。現時点のCLIでは `css-tailwind` は未対応です。

DTCG形式のデザイントークンが必要な場合は `dtcg` を使います。

エクスポート結果をリポジトリに保存するかどうかは、実装側でトークンを実際に参照する段階で判断してください。現時点では `DESIGN.md` を単一の設計ソースとして扱うのが最も安全です。

## Screen Review Checklist

Use this checklist when reviewing future changes to the Workout UI. It is intentionally screen-based so design review can happen before or after implementation.

List screen:

- The screen should communicate overall workout progress before individual set details.
- `session-card` should summarize the session without competing with exercise cards.
- On training off days, `session-card` should clearly say `今日はオフ` instead of showing an empty workout as if data were missing.
- Each `exercise-card` should show name, target, previous result, next state, and set completion count.
- The currently selected exercise should use `exercise-card-active` and avoid introducing a second accent color.
- The bottom bar should keep `+ Exercise` and `Finish Workout` visually grouped as session-level actions.

Active exercise screen:

- The header should make it clear which exercise is active.
- The top status area should answer “what should I do next?” before any secondary information.
- `Sets` and `History` tabs should preserve a clear difference between logging and reading modes.
- The set table should keep the `SET / PLAN / ACTUAL / CHECK` order.
- The active set should be identifiable by both color and surface treatment, not color alone.

Warmup state:

- Warmup cards should feel lighter than main working sets.
- The current warmup set should use `warmup-card-active`.
- Skipping warmups should not visually look like completing main work.
- Warmup completion should move attention toward the first incomplete working set.

Logging state:

- Weight and reps should use `metric-chip` or equivalent numeric emphasis.
- `Complete Set` should remain the strongest action inside the logging card.
- Notes and edit affordances should stay secondary to set completion.
- Completing a set should create a visible change in the corresponding `SetRow`.

Resting state:

- `RESTING` and the timer should be the dominant information.
- `Stop` should use danger styling only when it interrupts or cancels rest.
- `Done` should clearly move the user toward the next set.
- Time adjustment controls should not compete visually with the timer.

Next-ready state:

- The next set should be easy to start without rereading the full table.
- `next-ready-card` should communicate readiness, not completion.
- `Log Set` should be easier to notice than `Add Rest`.
- The next target weight and reps should remain visible.

History tab:

- History should read as a comparison and review surface, not an editing surface.
- `history-panel` should show exercise identity and previous performance.
- `history-row` should keep completed sets scannable and low-drama.
- Empty history should explain what will appear after sets are completed.

Complete state:

- `complete-state` should clearly mark the exercise as finished.
- The design should help the user transition to the next exercise.
- Success styling should be present but not louder than active logging states.
- Completed sets should remain inspectable after the complete message appears.

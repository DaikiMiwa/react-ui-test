# App Design System — Apple Health Inspired

> 目的: Apple Health のような「清潔・信頼・静かな高級感」を持つ、ヘルスケア/ウェルネス系アプリ向けデザインシステム。  
> 方針: Apple Health をコピーせず、iOS Human Interface Guidelines の考え方をベースに、白背景・大きな余白・丸いカード・控えめな色・データの読みやすさ・プライバシーへの安心感を中心に設計する。

---

## 1. Design Principles

### 1.1 Quiet Confidence
医療・健康領域では、UIが主張しすぎないことが信頼につながる。装飾よりも情報の読みやすさ、状態の理解しやすさ、安心感を優先する。

- 背景は基本的に白またはごく淡いグレー
- 重要な数値だけを大きく表示
- 色は状態・カテゴリ・行動の意味づけに限定
- 不安を煽る赤や警告表現は最小限にする

### 1.2 Health at a Glance
ユーザーは長い文章よりも「今どうなのか」を知りたい。カード、サマリー、トレンド、リング、バー、ミニチャートで即時理解できる構造にする。

- ファーストビューには今日の状態を集約
- 各カードは1つの目的に限定
- 詳細情報はタップ後に段階的に開示
- 長期トレンドは7日 / 30日 / 90日で切り替え

### 1.3 Human, Not Clinical
医療的な正確さは保ちつつ、病院の管理画面のような冷たさは避ける。

- 文言は短く、肯定的で、判断を押し付けない
- 「異常です」より「いつもより高めです」
- 「失敗」より「今日はまだ記録がありません」
- ユーザーを責めないトーンにする

### 1.4 Privacy First
健康データは非常にセンシティブ。プライバシー保護をUIの一部として明示する。

- 権限要求は必要なタイミングで説明してから行う
- 共有・同期・外部送信の有無を明確に表示
- 設定画面に「データとプライバシー」を独立して配置
- データ削除・エクスポート導線を隠さない

---

## 2. Visual Direction

### 2.1 Keywords

- Clean
- Calm
- Personal
- Trustworthy
- Data-rich but not dense
- Soft contrast
- Native iOS feel
- Gentle motion

### 2.2 Overall Look

Apple Health 風の雰囲気は、以下の組み合わせで表現する。

| Element | Direction |
|---|---|
| Background | Warm white / soft system gray |
| Cards | Rounded, spacious, lightly elevated or separated by background contrast |
| Typography | Large numeric hierarchy, compact labels |
| Iconography | SF Symbols-like line icons, rounded and simple |
| Color | Category-based accent colors; avoid rainbow overload |
| Charts | Minimal axes, subtle grid, emphasis on trend |
| Motion | Soft transitions, no flashy effects |

---

## 3. Color System

### 3.1 Core Palette

```css
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F5F5F7;
--color-bg-tertiary: #EFEFF4;

--color-text-primary: #111111;
--color-text-secondary: #6E6E73;
--color-text-tertiary: #8E8E93;
--color-text-inverse: #FFFFFF;

--color-separator: rgba(60, 60, 67, 0.18);
--color-card-border: rgba(60, 60, 67, 0.10);
```

### 3.2 Health Category Colors

Apple Health っぽさを出すため、赤をブランドカラーとして多用しすぎず、カテゴリ別に穏やかなアクセントを使う。

```css
--color-heart: #FF3B30;      /* 心拍・循環 */
--color-activity: #FF2D55;   /* 活動・リング */
--color-sleep: #5E5CE6;      /* 睡眠 */
--color-mind: #34C759;       /* メンタル・呼吸 */
--color-nutrition: #FF9500;  /* 食事・栄養 */
--color-water: #0A84FF;      /* 水分 */
--color-medical: #30B0C7;    /* 医療記録 */
```

### 3.3 Semantic Colors

```css
--color-success: #34C759;
--color-warning: #FF9F0A;
--color-danger: #FF453A;
--color-info: #0A84FF;
```

### 3.4 Color Usage Rules

- Primary action は1画面に1つまで
- 健康指標のカテゴリ色は、アイコン・チャート・小さなバッジに使う
- 背景全面に強い色を敷かない
- 危険色は本当に重要な警告だけに使う
- ダークモードでは彩度をやや下げ、背景とのコントラストを確保する

---

## 4. Typography

### 4.1 Font

- iOS: SF Pro / system font
- Android: Roboto / system font
- Web: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif`

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
```

### 4.2 Type Scale

| Token | Size | Weight | Use |
|---|---:|---:|---|
| Display | 40 | 700 | 今日の主要スコア・大きな数値 |
| Large Title | 34 | 700 | 画面タイトル |
| Title 1 | 28 | 700 | セクションの重要タイトル |
| Title 2 | 22 | 700 | カードタイトル |
| Headline | 17 | 600 | 主要ラベル |
| Body | 17 | 400 | 本文 |
| Callout | 16 | 400 | 補足説明 |
| Footnote | 13 | 400 | メタ情報 |
| Caption | 12 | 400 | 単位・注釈 |

### 4.3 Numeric Typography

健康アプリでは数値が主役。数値は大きく、単位は小さく、意味は近くに置く。

例:

```text
72 bpm
心拍数
安静時として通常範囲です
```

Rules:

- 数値: Display / Title 1
- 単位: Caption / Footnote
- ラベル: Footnote, secondary color
- 解釈: Body or Callout

---

## 5. Spacing & Layout

### 5.1 Spacing Tokens

```css
--space-2: 2px;
--space-4: 4px;
--space-8: 8px;
--space-12: 12px;
--space-16: 16px;
--space-20: 20px;
--space-24: 24px;
--space-32: 32px;
--space-40: 40px;
```

### 5.2 Layout Rules

- 画面左右余白: 16px〜20px
- カード内余白: 16px〜20px
- セクション間: 24px〜32px
- カード間: 12px〜16px
- タップ領域: 最低44px

### 5.3 Screen Structure

```text
[Large Title]
[Today Summary Card]
[Primary Metrics Grid]
[Trends]
[Recommendations]
[Data & Privacy / Settings]
```

---

## 6. Radius, Elevation, Border

### 6.1 Radius Tokens

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 22px;
--radius-pill: 999px;
```

### 6.2 Component Radius

| Component | Radius |
|---|---:|
| Small badge | Pill |
| Button | 12〜16px |
| Metric card | 18〜22px |
| Modal sheet | 24px top corners |
| Chart container | 18〜22px |

### 6.3 Elevation

Apple系UIでは強い影よりも面の分離が自然。影は控えめにし、背景差と境界線で分ける。

```css
--shadow-card: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04);
--shadow-floating: 0 8px 32px rgba(0,0,0,0.10);
```

---

## 7. Iconography

### 7.1 Direction

- SF Symbolsに近い、シンプルな線形アイコン
- 角は丸める
- 1つのアイコンに複数の意味を持たせない
- カテゴリ色と組み合わせて使う

### 7.2 Recommended Symbols

| Category | Symbol Idea |
|---|---|
| Heart | heart.fill / heart.text.square |
| Activity | figure.walk / flame.fill |
| Sleep | moon.fill / bed.double.fill |
| Mind | brain.head.profile / wind |
| Nutrition | fork.knife / leaf.fill |
| Water | drop.fill |
| Medical | cross.case.fill / stethoscope |
| Privacy | lock.shield.fill |

### 7.3 Icon Usage

- サイズ: 20px / 24px / 32px
- カードアイコンは淡い色の円形背景に置く
- ナビゲーションアイコンは単色
- 警告アイコンはテキスト説明と必ずセットにする

---

## 8. Core Components

## 8.1 Metric Card

健康データの最小単位。

```text
┌────────────────────────┐
│ ❤️  心拍数              │
│                        │
│ 72 bpm                 │
│ 通常範囲です            │
│              ›          │
└────────────────────────┘
```

Spec:

- Width: flexible
- Min height: 132px
- Padding: 16px
- Radius: 20px
- Background: white
- Border: subtle separator
- Tap target: whole card

States:

| State | Treatment |
|---|---|
| Normal | White card, subtle border |
| Highlight | Light accent background |
| Warning | Small warning badge, no full red background |
| Empty | Placeholder icon + gentle copy |
| Loading | Skeleton block |

## 8.2 Today Summary Card

画面上部に置く、ユーザーの現在状態をまとめるカード。

Content:

- 今日の日付
- 主要スコアまたは状態
- 2〜3個の重要メトリクス
- 軽いインサイト

Example copy:

```text
今日はよく整っています
睡眠時間は7時間20分、安静時心拍数も安定しています。
```

## 8.3 Ring Progress

Apple Health / Fitness 的な印象を作るための進捗表現。ただし見た目をそのままコピーしない。

Rules:

- 最大3リングまで
- 色はカテゴリに対応
- 中央には主指標を1つだけ表示
- 進捗率だけでなく「何が良いのか」を添える

Use cases:

- 活動量
- 水分摂取
- 習慣達成
- 服薬完了

## 8.4 Trend Chart

ヘルスケアでは単日の数値よりトレンドが重要。

Rules:

- 軸線は薄くする
- ラベルは最小限
- 異常値を派手にしすぎない
- 期間切り替えを上部に配置
- タップ時に日付と値を表示

Chart types:

| Data | Chart |
|---|---|
| 心拍・体重・血圧 | Line chart |
| 睡眠・活動時間 | Bar chart |
| 習慣達成 | Calendar heatmap |
| カテゴリ内訳 | Donut / stacked bar |

## 8.5 Insight Card

データから得られる解釈を短く表示する。

```text
睡眠の一貫性が上がっています
過去7日間、就寝時刻のばらつきが少なくなっています。
```

Rules:

- 1カード1インサイト
- 断定しすぎない
- 根拠となる期間を表示
- 行動提案は1つまで

## 8.6 Permission Card

権限要求の前に説明するカード。

```text
ヘルスケアデータへのアクセス
歩数と心拍数を使って、日々のコンディションをわかりやすく表示します。
[許可して続ける]
```

Rules:

- 何に使うかを明記
- 許可しない場合の体験も説明
- OS権限ダイアログを突然出さない

---

## 9. Navigation

### 9.1 Recommended Tabs

```text
Today     Trends     Records     Insights     Settings
```

| Tab | Purpose |
|---|---|
| Today | 今日の状態と主要カード |
| Trends | 長期推移・チャート |
| Records | 入力・履歴・医療記録 |
| Insights | パーソナルな気づき |
| Settings | データ、通知、プライバシー |

### 9.2 Navigation Rules

- 主要導線はタブに置く
- 深い情報はカードタップ後の詳細画面へ
- 医療・プライバシー関連設定は見つけやすくする
- 戻る操作を複雑にしない

---

## 10. Interaction & Motion

### 10.1 Motion Principles

- 状態変化を理解させるために使う
- ユーザーを驚かせない
- 長いアニメーションは避ける
- 数値更新は軽くフェード/カウントアップ

### 10.2 Motion Tokens

```css
--duration-fast: 120ms;
--duration-normal: 220ms;
--duration-slow: 360ms;

--easing-standard: cubic-bezier(0.2, 0.0, 0.2, 1);
--easing-soft: cubic-bezier(0.16, 1, 0.3, 1);
```

### 10.3 Examples

- Card tap: scale 0.98 → 1.0
- Modal: bottom sheet slide up
- Chart: fade in + line draw
- Ring: progress sweep on first load only
- Insight: fade in, no bounce

---

## 11. Content Design

### 11.1 Voice

- Calm
- Supportive
- Clear
- Non-judgmental
- Evidence-aware

### 11.2 Copy Rules

Do:

- 「いつもより少し高めです」
- 「過去7日間の傾向です」
- 「記録すると、より正確な傾向が見られます」
- 「このデータは端末内で処理されます」

Avoid:

- 「危険です」※緊急時以外
- 「失敗しました」
- 「あなたは運動不足です」
- 根拠のない診断表現

### 11.3 Medical Disclaimer

アプリが診断を行わない場合は、必要な画面に短く明記する。

```text
この情報は健康管理の参考として提供されるもので、医療上の診断ではありません。気になる症状がある場合は医療機関に相談してください。
```

---

## 12. Accessibility

### 12.1 Required Standards

- テキストと背景のコントラストを十分に確保
- 色だけで状態を伝えない
- VoiceOver / TalkBack 用ラベルを設定
- Dynamic Type / 文字サイズ変更に対応
- タップ領域は44px以上
- モーション低減設定に対応

### 12.2 Data Accessibility

Charts must include text alternatives.

Example:

```text
過去7日間の平均心拍数は72bpmで、前週より3bpm低下しています。
```

---

## 13. Dark Mode

### 13.1 Dark Palette

```css
--color-bg-primary-dark: #000000;
--color-bg-secondary-dark: #1C1C1E;
--color-bg-tertiary-dark: #2C2C2E;

--color-text-primary-dark: #FFFFFF;
--color-text-secondary-dark: #EBEBF5B3;
--color-text-tertiary-dark: #EBEBF566;

--color-separator-dark: rgba(84, 84, 88, 0.65);
```

### 13.2 Dark Mode Rules

- 真っ黒背景 + 少し明るいカードで分離する
- 影ではなく明度差で階層を出す
- 彩度の高い色は少し抑える
- チャートのグリッドはさらに薄くする

---

## 14. Example Screens

### 14.1 Today Screen

```text
Today
5月10日 日曜日

[Summary Card]
今日は安定しています
睡眠・心拍・活動量のバランスが良好です。

[Metric Grid]
心拍数       72 bpm
睡眠         7時間20分
歩数         8,430歩
水分         1.4 L

[Insight]
睡眠のリズムが整っています
過去7日間、就寝時刻のばらつきが少なくなっています。
```

### 14.2 Metric Detail Screen

```text
心拍数
72 bpm
通常範囲です

[7日 / 30日 / 90日]
[Line Chart]

インサイト
朝の安静時心拍数が過去30日で安定しています。

記録
5月10日 08:12    72 bpm
5月09日 08:10    73 bpm
```

### 14.3 Privacy Screen

```text
データとプライバシー

ヘルスケアデータ
歩数、心拍数、睡眠データを使用しています。

データの保存場所
データは端末内に保存されます。

[データをエクスポート]
[すべてのデータを削除]
```

---

## 15. Design Tokens Summary

```css
:root {
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F7;
  --color-text-primary: #111111;
  --color-text-secondary: #6E6E73;

  --color-heart: #FF3B30;
  --color-activity: #FF2D55;
  --color-sleep: #5E5CE6;
  --color-mind: #34C759;
  --color-nutrition: #FF9500;
  --color-water: #0A84FF;
  --color-medical: #30B0C7;

  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;

  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --radius-pill: 999px;

  --shadow-card: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04);
}
```

---

## 16. Implementation Notes

### 16.1 React / Web Naming Example

```tsx
<Card variant="metric" tone="heart">
  <MetricCard
    icon="heart"
    label="心拍数"
    value="72"
    unit="bpm"
    status="通常範囲です"
  />
</Card>
```

### 16.2 Component Names

- `MetricCard`
- `SummaryCard`
- `InsightCard`
- `RingProgress`
- `TrendChart`
- `PermissionCard`
- `PrivacyNotice`
- `HealthBadge`
- `SegmentedControl`
- `RecordListItem`

---

## 17. QA Checklist

Before release:

- [ ] 数値が一目で読める
- [ ] カードごとの目的が1つに絞られている
- [ ] 色だけで状態を伝えていない
- [ ] 権限要求の理由が明確
- [ ] 医療診断に見える文言がない
- [ ] ダークモードでコントラストが保たれている
- [ ] 文字サイズ拡大時にレイアウトが破綻しない
- [ ] チャートにテキスト代替がある
- [ ] データ削除・エクスポート導線がある
- [ ] 通知文言が不安を煽らない

---


---

## 19. Apple Health-like Screen Patterns

このデザインシステムでは、Apple Health風の情報設計を以下の3種類の画面パターンに分けて扱う。

### 19.1 Summary / Pinned Metrics Screen

複数の健康指標を一覧する画面。ユーザーが「今の状態」をざっと確認するための場所。

Rules:

- 複数指標を表示してよい。
- 各カードは1指標のみを扱う。
- カード内では、指標名・最新値・日付・小さなトレンドのみを表示する。
- 詳細なグラフや説明はカードタップ後の詳細画面に移動する。
- カード全体をタップ領域にする。
- 右上に日付または chevron を置き、詳細へ進めることを示す。

Example:

```text
Summary
Pinned                          Edit

[Body Fat Percentage]
26.4 %                 May 8  ›

[Body Mass Index]
26.8 BMI               May 8  ›

[Height]
171 cm                 May 8  ›
```

### 19.2 Trends Feed Screen

複数のトレンドカードを縦に並べる画面。ユーザーが長期傾向や変化を発見するための場所。

Rules:

- 複数指標を表示してよい。
- 1カード = 1トレンド。
- カードタイトルにはカテゴリ色のアイコンと指標名を表示する。
- 本文は「何が起きているか」を1文で伝える。
- ミニチャートは補助情報として使う。
- カード右上に chevron を置き、詳細画面への導線にする。

Example:

```text
Trends

[Active Energy]
You averaged 653 kcal per day over the last 25 weeks.
[mini bar chart]

[Resting Heart Rate]
On average, your resting heart rate was 67 BPM over the last 25 weeks.
[mini line chart]
```

### 19.3 Metric Detail Screen

1つの健康指標を深く見る画面。Apple Health風にする場合、この画面では原則として1指標だけを主役にする。

Rules:

- 1画面 = 1指標を原則とする。
- 複数指標の比較は Summary / Trends / Insights 側で扱う。
- 上部には戻るボタン、中央タイトル、右上に追加・記録ボタンを置く。
- 期間切替はグラフの直上に置く。
- 主要数値は AVERAGE / LATEST などのラベルとセットで表示する。
- グラフは画面幅いっぱいに近い横長領域を使う。
- 画面下部に説明、関連アプリ、記録履歴などを置く。

Example:

```text
‹                         Weight                         +

[D] [W] [M] [6M] [Y]

AVERAGE
77.62 kg
Apr 2026

[large line chart]

About Weight
This is your body weight. It includes your total body water, muscle, bone mass, and fat.
```

---

## 20. Navigation Bar & Floating Controls

### 20.1 Detail Navigation Bar

Metric Detail Screen では、iOSネイティブに近いナビゲーション構造を使う。

| Element | Placement | Role |
|---|---|---|
| Back button | Top left | 前画面へ戻る |
| Title | Top center | 現在の指標名 |
| Add button | Top right | データ追加・記録 |

Spec:

```css
--nav-height: 96px;
--nav-bg-dark: #1C1C1E;
--nav-button-size: 48px;
--nav-button-bg-dark: #242428;
--nav-button-border-dark: rgba(255,255,255,0.08);
```

Rules:

- 戻るボタンは必ず左上に置く。
- 追加・記録・編集など、画面の主要アクションは右上に置く。
- タイトルは中央配置を基本とする。
- ナビゲーションアイコンは円形ボタンに入れ、タップ領域を44px以上にする。
- 詳細画面ではナビゲーションバーを視覚的に固定し、スクロール中も迷子にならないようにする。

### 20.2 Bottom Tab / Search Floating Controls

Summary / Trends 系の画面では、下部にタブバーと検索ボタンを置くことができる。

Rules:

- タブは主要導線だけに絞る。
- 検索は右下の円形フローティングボタンとして独立させてもよい。
- 背景には blur / translucent glass を使い、コンテンツから浮いて見せる。
- 下部UIがカードやグラフを隠しすぎないよう、safe area 分の余白を確保する。

---

## 21. Chart Interaction: Hover / Tap Tooltip

詳細グラフでは、ユーザーが線上のデータポイントに触れたときに、値・単位・日付をコンパクトなツールチップで表示する。

### 21.1 Behavior

- タップ、ホバー、ドラッグで最も近いデータポイントにフォーカスする。
- フォーカス中は縦のガイドラインを表示する。
- フォーカスされた点はリングまたは拡大で強調する。
- 他の点は過度に目立たせない。
- ツールチップには、集計ラベル・値・単位・日付を表示する。
- ツールチップは原則としてフォーカス点の上に表示する。
- 画面端に近い場合は左右に反転し、画面外にはみ出さない。

### 21.2 Tooltip Content

```text
AVERAGE
77.62 kg
Apr 2026
```

### 21.3 Tooltip Style

```css
--tooltip-bg-dark: rgba(44, 44, 46, 0.92);
--tooltip-border-dark: rgba(255,255,255,0.10);
--tooltip-radius: 14px;
--tooltip-padding-x: 14px;
--tooltip-padding-y: 10px;
--tooltip-label-size: 12px;
--tooltip-value-size: 30px;
--tooltip-date-size: 15px;
```

Rules:

- ツールチップ背景はカードより少し明るいダークグレーにする。
- 数値を最も大きく、単位は数値より小さく表示する。
- ラベルは uppercase + secondary text にする。
- 値の色は原則白、アクセントカラーはポイント・ライン・補助情報に使う。
- 長押し・ドラッグ中も読みやすい位置を保つ。

---

## 22. Health Card Patterns

### 22.1 Pinned Metric Card

Summary 画面で使用する、現在値を確認するための大きめカード。

Spec:

```css
--pinned-card-bg-dark: #1C1C1E;
--pinned-card-radius: 28px;
--pinned-card-padding: 20px;
--pinned-card-min-height: 148px;
```

Content:

- 指標アイコン + 指標名
- 日付
- 最新値
- 単位
- chevron
- 必要に応じて小さなドット/ミニチャート

Rules:

- 1カードに複数の指標を混ぜない。
- 値がない場合は `No Data` を表示し、空状態を責めない。
- 指標名とアクセントカラーは一致させる。

### 22.2 Trend Insight Card

Trends 画面で使用する、文章 + ミニチャートのカード。

Spec:

```css
--trend-card-bg-dark: #1C1C1E;
--trend-card-radius: 28px;
--trend-card-padding: 18px 20px;
--trend-card-min-height: 220px;
```

Content:

- 指標名 + アイコン
- 短いインサイト文
- 区切り線
- ミニチャート
- 期間ラベル

Rules:

- 本文は2行程度に収める。
- ミニチャートは詳細分析ではなく、傾向の補助として扱う。
- 平均線や基準線をアクセントカラーで表示する。

---

## 23. Recommended Information Architecture

Apple Health風にする場合、画面ごとに扱う情報量を明確に分ける。

| Screen | Metrics | Purpose |
|---|---:|---|
| Summary | Multiple | 今日の状態・ピン留め指標を見る |
| Trends | Multiple | 長期傾向・変化を発見する |
| Metric Detail | Single | 1指標を深く分析する |
| Record Entry | Single | 1指標を記録・編集する |
| Insights | Multiple | パーソナルな提案を見る |

Key rule:

> 一覧画面では複数指標を扱ってよい。詳細画面では1指標に集中する。


## 18. References

- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Designing for iOS: https://developer.apple.com/design/human-interface-guidelines/designing-for-ios
- Typography: https://developer.apple.com/design/human-interface-guidelines/typography
- SF Symbols: https://developer.apple.com/sf-symbols/

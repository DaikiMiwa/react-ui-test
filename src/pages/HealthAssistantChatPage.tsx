import type { CSSProperties } from 'react'

export default function HealthAssistantChat() {
  const weightPoints = [78.2, 78.1, 77.7, 77.2, 76.9, 76.9, 77.1, 77.5, 77.6, 77.6, 77.5, 77.3, 77.1, 76.8, 76.7, 76.9, 77.2, 77.5, 77.7];
  const compareWeight = [78, 77.6, 78.3, 78.4, 78.5, 79.2, 79.1, 78.6, 78.8, 77.9, 77.5, 77.1, 77.8];
  const compareFat = [25, 24.8, 24, 24.1, 25.5, 26, 25.6, 25, 24.8, 25.1, 24.6, 24.0, 24.9];

  return (
    <div style={styles.page}>
      <div style={styles.phone}>
        <header style={styles.header}>
          <button style={styles.circleButton}>‹</button>
          <div style={styles.headerCenter}>
            <div style={styles.title}>Health Assistant</div>
            <div style={styles.subtitle}>Your data is private and secure.</div>
          </div>
          <button style={styles.circleButton}><span style={styles.moreDots}>•••</span></button>
        </header>

        <main style={styles.chat}>
          <div style={styles.userBubble}>How has my weight been over the last 3 months?</div>
          <div style={styles.timeRight}>23:24</div>

          <AssistantText>
            Here’s your weight trend over the last 3 months. Your average weight was 77.6 kg.
          </AssistantText>

          <MetricInsightCard points={weightPoints} />

          <AssistantText>
            Would you like to see how this compares to your body fat percentage and sleep?
          </AssistantText>

          <div style={styles.quickActions}>
            <button style={styles.chip}>Compare with body fat %</button>
            <button style={styles.chip}>View sleep trend</button>
            <button style={styles.chip}>Weekly summary</button>
          </div>

          <div style={styles.userBubbleSmall}>Yes, compare with body fat %</div>
          <div style={styles.timeRight}>23:25</div>

          <AssistantText>Here’s how your weight and body fat percentage have changed.</AssistantText>

          <ComparisonCard weight={compareWeight} fat={compareFat} />
        </main>

        <footer style={styles.inputBarWrap}>
          <button style={styles.inputCircle}>＋</button>
          <div style={styles.inputBar}>
            <span style={styles.placeholder}>Ask about your health...</span>
            <span style={styles.mic}>⌕</span>
            <button style={styles.send}>↑</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function AssistantText({ children }: { children: string }) {
  return (
    <div style={styles.assistantRow}>
      <div style={styles.sparkle}>✦</div>
      <p style={styles.assistantText}>{children}</p>
    </div>
  );
}

function MetricInsightCard({ points }: { points: number[] }) {
  const chart = makeLine(points, 0, 100, 280, 110, 76, 80);

  return (
    <section style={styles.bigCard}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.metricName}>☥ Weight</div>
          <div style={styles.cardPeriod}>May 2025 – Aug 2025</div>
        </div>
        <div style={styles.averageBox}>
          <div style={styles.averageLabel}>AVERAGE</div>
          <div><span style={styles.averageValue}>77.6</span><span style={styles.kg}> kg</span></div>
        </div>
      </div>

      <svg viewBox="0 0 320 132" style={styles.chartSvg}>
        <line x1="16" y1="24" x2="300" y2="24" stroke="#34343a" strokeWidth="1" strokeDasharray="4 5" />
        <line x1="16" y1="76" x2="300" y2="76" stroke="#2b2b30" strokeWidth="1" />
        <line x1="16" y1="112" x2="300" y2="112" stroke="#34343a" strokeWidth="1" strokeDasharray="4 5" />
        <polyline points={chart} fill="none" stroke="#b85aff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const pt = pointFor(i, p, points.length, 280, 110, 76, 80);
          return <circle key={i} cx={pt.x} cy={pt.y} r="3.2" fill="#19191d" stroke="#b85aff" strokeWidth="2.5" />;
        })}
        <text x="304" y="28" fill="#a1a1aa" fontSize="13">80</text>
        <text x="304" y="80" fill="#a1a1aa" fontSize="13">75</text>
        <text x="304" y="116" fill="#a1a1aa" fontSize="13">70</text>
        <text x="28" y="128" fill="#a1a1aa" fontSize="12">May</text>
        <text x="118" y="128" fill="#a1a1aa" fontSize="12">Jun</text>
        <text x="208" y="128" fill="#a1a1aa" fontSize="12">Jul</text>
        <text x="276" y="128" fill="#a1a1aa" fontSize="12">Aug</text>
      </svg>

      <div style={styles.statsStrip}>
        <MiniStat label="LATEST" value="77.8" unit="kg" sub="Aug 5, 2025" />
        <MiniStat label="CHANGE" value="↓ 0.4" unit="kg" sub="vs May 5" accent="#d946ef" />
        <MiniStat label="GOAL" value="70.0" unit="kg" sub="Edit Goal" accent="#c084fc" />
      </div>
    </section>
  );
}

function MiniStat({ label, value, unit, sub, accent }: { label: string; value: string; unit: string; sub: string; accent?: string }) {
  return (
    <div style={styles.miniStat}>
      <div style={styles.miniLabel}>{label}</div>
      <div><span style={{ ...styles.miniValue, color: accent || '#fff' }}>{value}</span><span style={styles.miniUnit}> {unit}</span></div>
      <div style={{ ...styles.miniSub, color: accent || '#a1a1aa' }}>{sub}</div>
    </div>
  );
}

function ComparisonCard({ weight, fat }: { weight: number[]; fat: number[] }) {
  const wLine = makeLine(weight, 20, 24, 250, 88, 76, 80);
  const fLine = makeLine(fat, 20, 24, 250, 88, 20, 30);

  return (
    <section style={styles.compareCard}>
      <div style={styles.compareHead}>
        <div>
          <div style={styles.compareTitlePurple}>Weight</div>
          <div style={styles.compareSub}>Average 77.6 kg</div>
        </div>
        <div style={styles.divider} />
        <div>
          <div style={styles.compareTitlePink}>Body Fat Percentage</div>
          <div style={styles.compareSub}>Average 26.4%</div>
        </div>
        <div style={styles.expand}>↗</div>
      </div>
      <svg viewBox="0 0 300 112" style={styles.compareSvg}>
        <line x1="20" y1="24" x2="270" y2="24" stroke="#34343a" strokeWidth="1" strokeDasharray="4 5" />
        <line x1="20" y1="88" x2="270" y2="88" stroke="#34343a" strokeWidth="1" strokeDasharray="4 5" />
        <polyline points={wLine} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={fLine} fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {weight.map((p, i) => {
          const pt = pointFor(i, p, weight.length, 250, 88, 76, 80, 20, 24);
          return <circle key={`w${i}`} cx={pt.x} cy={pt.y} r="2.7" fill="#19191d" stroke="#a855f7" strokeWidth="2" />;
        })}
        {fat.map((p, i) => {
          const pt = pointFor(i, p, fat.length, 250, 88, 20, 30, 20, 24);
          return <circle key={`f${i}`} cx={pt.x} cy={pt.y} r="2.7" fill="#19191d" stroke="#ec4899" strokeWidth="2" />;
        })}
        <text x="2" y="26" fill="#a855f7" fontSize="12">80</text>
        <text x="2" y="91" fill="#a855f7" fontSize="12">70</text>
        <text x="272" y="26" fill="#ec4899" fontSize="12">30%</text>
        <text x="272" y="91" fill="#ec4899" fontSize="12">20%</text>
      </svg>
    </section>
  );
}

function makeLine(values: number[], offsetX = 16, offsetY = 24, width = 280, height = 100, min = 0, max = 100) {
  return values.map((value, index) => {
    const x = offsetX + (index / (values.length - 1)) * width;
    const y = offsetY + (1 - (value - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');
}

function pointFor(index: number, value: number, length: number, width: number, height: number, min: number, max: number, offsetX = 16, offsetY = 24) {
  const x = offsetX + (index / (length - 1)) * width;
  const y = offsetY + (1 - (value - min) / (max - min)) * height;
  return { x, y };
}

const styles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: '#050506',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    boxSizing: 'border-box',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  },
  phone: {
    width: '100%',
    maxWidth: 430,
    height: 820,
    background: 'radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 28%), #050506',
    borderRadius: 34,
    overflow: 'hidden',
    border: '1px solid #1f1f23',
    boxShadow: '0 28px 90px rgba(0,0,0,0.58)',
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
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 32,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
  },
  moreDots: {
    display: 'block',
    fontSize: 18,
    letterSpacing: 2,
    transform: 'translateX(1px) translateY(-1px)',
  },
  headerCenter: { textAlign: 'center' },
  title: { fontSize: 21, fontWeight: 800, letterSpacing: -0.4 },
  subtitle: { marginTop: 12, fontSize: 13, color: '#a1a1aa' },
  chat: {
    height: 640,
    overflow: 'hidden',
    padding: '8px 18px 110px',
    boxSizing: 'border-box',
  },
  userBubble: {
    marginLeft: 'auto',
    width: 235,
    background: 'linear-gradient(135deg, #25262b, #1b1c20)',
    borderRadius: '24px 24px 8px 24px',
    padding: '14px 16px',
    fontSize: 17,
    lineHeight: 1.25,
    boxShadow: '0 12px 32px rgba(0,0,0,0.32)',
  },
  userBubbleSmall: {
    margin: '14px 0 0 auto',
    width: 'fit-content',
    maxWidth: 260,
    background: 'linear-gradient(135deg, #25262b, #1b1c20)',
    borderRadius: '22px 22px 8px 22px',
    padding: '12px 16px',
    fontSize: 16,
  },
  timeRight: { textAlign: 'right', color: '#7c7c84', fontSize: 12, marginTop: 5 },
  assistantRow: {
    display: 'grid',
    gridTemplateColumns: '34px 1fr',
    gap: 10,
    alignItems: 'start',
    marginTop: 14,
  },
  sparkle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle, #7dd3fc, #8b5cf6 55%, rgba(139,92,246,0.2))',
    color: '#fff',
    fontSize: 18,
  },
  assistantText: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.28,
    letterSpacing: -0.2,
  },
  bigCard: {
    margin: '12px 0 20px 0',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 28,
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.38)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '18px 18px 8px',
  },
  metricName: { color: '#c084fc', fontSize: 17, fontWeight: 800 },
  cardPeriod: { color: '#a1a1aa', marginTop: 9, fontSize: 14 },
  averageBox: { textAlign: 'right' },
  averageLabel: { fontSize: 11, color: '#a1a1aa', fontWeight: 800, letterSpacing: 0.8 },
  averageValue: { fontSize: 30, fontWeight: 700, letterSpacing: -1 },
  kg: { color: '#d4d4d8', fontSize: 16, fontWeight: 600 },
  chartSvg: { width: '100%', height: 150, display: 'block', padding: '0 10px', boxSizing: 'border-box' },
  statsStrip: {
    margin: '0 12px 12px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    border: '1px solid rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  miniStat: { padding: '14px 10px', borderRight: '1px solid rgba(255,255,255,0.08)' },
  miniLabel: { color: '#a1a1aa', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 },
  miniValue: { fontSize: 22, fontWeight: 800, letterSpacing: -0.5 },
  miniUnit: { color: '#d4d4d8', fontSize: 13, fontWeight: 600 },
  miniSub: { marginTop: 5, fontSize: 12 },
  quickActions: {
    margin: '12px 0 0 0',
    display: 'flex',
    gap: 7,
    overflow: 'hidden',
  },
  chip: {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.07)',
    color: '#c084fc',
    borderRadius: 999,
    padding: '9px 11px',
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  compareCard: {
    margin: '12px 0 0 0',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 22,
    overflow: 'hidden',
  },
  compareHead: {
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr 24px',
    gap: 12,
    alignItems: 'center',
    padding: '14px 16px 10px',
  },
  compareTitlePurple: { color: '#c084fc', fontWeight: 800, fontSize: 14 },
  compareTitlePink: { color: '#ec4899', fontWeight: 800, fontSize: 14 },
  compareSub: { color: '#fff', fontSize: 12, marginTop: 5 },
  divider: { height: 36, background: 'rgba(255,255,255,0.1)' },
  expand: { color: '#a1a1aa', fontSize: 18 },
  compareSvg: { width: '100%', height: 118, display: 'block', background: 'rgba(0,0,0,0.14)' },
  inputBarWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    display: 'grid',
    gridTemplateColumns: '48px 1fr',
    gap: 10,
    alignItems: 'center',
  },
  inputCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.08)',
    color: '#d946ef',
    fontSize: 30,
  },
  inputBar: {
    height: 48,
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px 0 18px',
    boxSizing: 'border-box',
  },
  placeholder: { flex: 1, color: '#a1a1aa', fontSize: 15 },
  mic: { color: '#fff', fontSize: 20, marginRight: 8 },
  send: {
    width: 36,
    height: 36,
    borderRadius: 999,
    border: 0,
    background: '#463064',
    color: '#a78bfa',
    fontSize: 20,
    fontWeight: 800,
  },
};

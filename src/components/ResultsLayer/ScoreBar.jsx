export default function ScoreBar({ label, score, max, color = 'var(--accent)', breakdown = [] }) {
  const pct = Math.round((score / max) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.04em' }}>
          {label}
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text2)', fontWeight: 500 }}>
          {score}<span style={{ color: 'var(--text3)' }}>/{max}</span>
        </span>
      </div>
      <div style={{
        height: '4px', borderRadius: '2px',
        background: 'var(--bg3)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: '2px',
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      {breakdown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
          {breakdown.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                · {b.label}
              </span>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: b.pts > 0 ? 'var(--teal)' : 'var(--text3)' }}>
                +{b.pts}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

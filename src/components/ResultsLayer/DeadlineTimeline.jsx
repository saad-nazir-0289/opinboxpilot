import { urgencyColor } from '../../lib/scorer'

export default function DeadlineTimeline({ opportunities }) {
  const withDeadlines = opportunities.filter(
    (o) => o.deadline && o.days_until_deadline !== null && o.days_until_deadline >= 0
  )

  if (withDeadlines.length === 0) return null

  const maxDays = Math.max(...withDeadlines.map((o) => o.days_until_deadline), 90)

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      background: 'var(--bg1)',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="var(--text3)" strokeWidth="1.2" fill="none"/>
          <path d="M4 1v2M10 1v2M1 6h12" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Deadline timeline
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
          — {withDeadlines.length} upcoming
        </span>
      </div>

      {/* Track */}
      <div style={{ position: 'relative', paddingBottom: '24px' }}>
        {/* Baseline */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '16px',
          height: '1px', background: 'var(--border)',
        }} />

        {/* Today marker */}
        <div style={{
          position: 'absolute', left: 0, top: '8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
        }}>
          <div style={{ width: '2px', height: '16px', background: 'var(--accent)', borderRadius: '1px' }} />
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--accent2)', whiteSpace: 'nowrap' }}>
            today
          </span>
        </div>

        {/* Opportunity markers */}
        {withDeadlines
          .sort((a, b) => a.days_until_deadline - b.days_until_deadline)
          .map((opp, i) => {
            const pct = Math.min(98, (opp.days_until_deadline / maxDays) * 100)
            const uc = urgencyColor(opp.days_until_deadline)
            const isEven = i % 2 === 0

            return (
              <div key={opp.id} style={{
                position: 'absolute',
                left: `${pct}%`,
                top: 0,
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              }}>
                {/* Dot */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: uc, border: '2px solid var(--bg1)',
                  marginTop: '11px', flexShrink: 0,
                }} />

                {/* Label — stagger above/below to avoid overlap */}
                <div style={{
                  position: 'absolute',
                  top: isEven ? '-36px' : '28px',
                  left: '50%', transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap', textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '10px', color: uc, fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                  }}>
                    {opp.days_until_deadline}d
                  </div>
                  <div style={{
                    fontSize: '9px', color: 'var(--text3)',
                    maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {opp.organization || opp.title.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              </div>
            )
          })}

        {/* End label */}
        <div style={{
          position: 'absolute', right: 0, top: '8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
            {maxDays}d
          </span>
        </div>
      </div>
    </div>
  )
}

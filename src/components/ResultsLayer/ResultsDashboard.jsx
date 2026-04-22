import { useState } from 'react'
import PriorityCard from './PriorityCard'
import DeadlineTimeline from './DeadlineTimeline'
import RejectedPanel from './RejectedPanel'
import { useAppStore } from '../../store/appStore'

function StatPill({ label, value, color = 'var(--text2)', bg = 'var(--bg3)' }) {
  return (
    <div style={{
      padding: '10px 18px', borderRadius: 'var(--radius)',
      background: bg, border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: '2px',
    }}>
      <span style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 500, color }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
  )
}

export default function ResultsDashboard() {
  const { opportunities, rejected, studentProfile: p, usage, reset } = useAppStore()
  const [showAll, setShowAll] = useState(false)

  const visibleOpportunities = showAll ? opportunities : opportunities.slice(0, 5)

  const urgent     = opportunities.filter((o) => o.days_until_deadline !== null && o.days_until_deadline >= 0 && o.days_until_deadline <= 7).length
  const withGaps   = opportunities.filter((o) => o.warnings.length > 0).length
  const top        = opportunities[0]
  const avgScore   = opportunities.length
    ? Math.round(opportunities.reduce((s, o) => s + o.score, 0) / opportunities.length)
    : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sticky results nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,11,0.9)', backdropFilter: 'blur(16px)',
        padding: '0 40px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: 'var(--accent-bg)', border: '1px solid rgba(124,107,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2v10M2 2l10 10M12 2L2 12" stroke="var(--accent2)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Inbox Copilot</span>
          <span style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 7px',
            borderRadius: '4px', background: 'var(--green-bg)',
            color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)',
          }}>
            ✓ Analysis complete
          </span>
        </div>

        <button onClick={reset} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 14px', borderRadius: 'var(--radius)',
          background: 'var(--bg2)', border: '1px solid var(--border)',
          color: 'var(--text2)', fontSize: '12px', fontFamily: 'var(--font-mono)',
          cursor: 'pointer', transition: 'opacity var(--transition)',
        }}>
          ← New analysis
        </button>
      </nav>

      {/* ── Header ── */}
      <div style={{
        padding: '40px 40px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '200px',
          background: 'radial-gradient(ellipse, rgba(74,222,128,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: '8px' }}>
            Results for {p.name || 'student'} · {p.degree} {p.program}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em',
            color: 'var(--text)', marginBottom: '24px',
          }}>
            Found <span style={{ color: 'var(--green)' }}>{opportunities.length}</span> opportunit{opportunities.length === 1 ? 'y' : 'ies'} worth acting on
            {urgent > 0 && (
              <span style={{ color: 'var(--red)' }}> — {urgent} urgent</span>
            )}
          </h1>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatPill label="opportunities" value={opportunities.length} color="var(--green)" bg="var(--green-bg)" />
            <StatPill label="urgent (≤7 days)" value={urgent} color="var(--red)" bg="var(--red-bg)" />
            <StatPill label="profile gaps" value={withGaps} color="var(--amber)" bg="var(--amber-bg)" />
            <StatPill label="filtered out" value={rejected.length} color="var(--text3)" />
            <StatPill label="avg score" value={`${avgScore}/100`} color="var(--accent2)" bg="var(--accent-bg)" />
            {usage && (
              <StatPill label="tokens used" value={usage.total_tokens?.toLocaleString() || '—'} />
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Top pick highlight */}
        {top && (
          <div style={{
            padding: '14px 18px', borderRadius: 'var(--radius)',
            background: 'var(--accent-bg)', border: '1px solid rgba(124,107,255,0.2)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>◆</span>
            <div>
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent2)', marginBottom: '2px', letterSpacing: '0.04em' }}>
                TOP PICK
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 400 }}>
                <strong style={{ fontWeight: 500 }}>{top.title}</strong>
                {top.days_until_deadline !== null && top.days_until_deadline >= 0 && (
                  <span style={{ color: 'var(--text3)', fontWeight: 300 }}>
                    {' '}— {top.days_until_deadline} days left · score {top.score}/100
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Deadline timeline */}
        <DeadlineTimeline opportunities={opportunities} />

        {/* Priority cards */}
        <div>
          <p style={{
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)',
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px',
          }}>
            Ranked by priority score
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {opportunities.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg2)', borderRadius: 'var(--radius)', color: 'var(--text2)' }}>
                No opportunities found — try different emails.
              </div>
            ) : (
              visibleOpportunities.map((opp, i) => (
                <PriorityCard key={opp.id || `${opp.title}-${opp.deadline || 'unknown'}-${i}`} opp={opp} rank={i + 1} />
              ))
            )}
            
            {!showAll && opportunities.length > 5 && (
              <button 
                onClick={() => setShowAll(true)}
                style={{
                  padding: '12px', marginTop: '10px', borderRadius: 'var(--radius)',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                View More ({opportunities.length - 5} hidden)
              </button>
            )}
          </div>
        </div>

        {/* Rejected panel */}
        <RejectedPanel rejected={rejected} />

        {/* Footer note */}
        <p style={{
          fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)',
          textAlign: 'center', paddingBottom: '40px',
          lineHeight: 1.6,
        }}>
          Scores are computed by a deterministic engine using urgency, profile fit, completeness, and bonus factors.
          <br />AI extraction via GPT-4o · SOFTEC 2026 · Inbox Copilot
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import ScoreBar from './ScoreBar'
import { urgencyColor, urgencyBg } from '../../lib/scorer'

const TYPE_COLORS = {
  scholarship: { color: 'var(--accent2)', bg: 'var(--accent-bg)', border: 'rgba(124,107,255,0.25)' },
  internship:  { color: 'var(--teal)',    bg: 'var(--teal-bg)',   border: 'rgba(45,212,191,0.25)' },
  fellowship:  { color: '#f472b6',        bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)' },
  competition: { color: 'var(--amber)',   bg: 'var(--amber-bg)',  border: 'rgba(245,158,11,0.25)' },
  admission:   { color: '#34d399',        bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
  research:    { color: '#60a5fa',        bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
  grant:       { color: '#fb923c',        bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' },
  other:       { color: 'var(--text2)',   bg: 'var(--bg3)',       border: 'var(--border)' },
}

function ScoreRing({ score, size = 56 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth="3" />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x={size/2} y={size/2 + 4} textAnchor="middle"
        style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 500, fill: color }}>
        {score}
      </text>
    </svg>
  )
}

export default function PriorityCard({ opp, rank }) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('breakdown') // 'breakdown' | 'checklist' | 'details'

  const tc = TYPE_COLORS[opp.type] || TYPE_COLORS.other
  const uc = urgencyColor(opp.days_until_deadline)
  const ub = urgencyBg(opp.days_until_deadline)
  const isExpired = opp.days_until_deadline !== null && opp.days_until_deadline < 0

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: `1px solid ${expanded ? 'var(--border-hi)' : 'var(--border)'}`,
      background: 'var(--bg1)',
      overflow: 'hidden',
      opacity: isExpired ? 0.55 : 1,
      transition: 'border-color var(--transition), opacity var(--transition)',
    }}>

      {/* ── Card header (always visible) ── */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '18px 20px',
          display: 'flex', alignItems: 'flex-start', gap: '16px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Rank badge */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: rank === 1 ? 'var(--amber-bg)' : 'var(--bg3)',
          border: `1px solid ${rank === 1 ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: '2px',
        }}>
          <span style={{
            fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 500,
            color: rank === 1 ? 'var(--amber)' : 'var(--text3)',
          }}>
            #{rank}
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row: type badge + urgency */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: '4px',
              color: tc.color, background: tc.bg, border: `1px solid ${tc.border}`,
            }}>
              {opp.type}
            </span>

            {opp.days_until_deadline !== null && (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                padding: '2px 8px', borderRadius: '4px',
                color: uc, background: ub,
              }}>
                {opp.scoreBreakdown.urgency.label}
              </span>
            )}

            {opp.is_financial_need_based && (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                padding: '2px 8px', borderRadius: '4px',
                color: 'var(--accent2)', background: 'var(--accent-bg)',
              }}>
                need-based
              </span>
            )}

            {opp.warnings.length > 0 && (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                padding: '2px 8px', borderRadius: '4px',
                color: 'var(--amber)', background: 'var(--amber-bg)',
              }}>
                ⚠ {opp.warnings.length} gap{opp.warnings.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '15px', fontWeight: 500, color: 'var(--text)',
            lineHeight: 1.3, marginBottom: '4px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {opp.title}
          </h3>

          {/* Org */}
          {opp.organization && (
            <p style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
              {opp.organization}
            </p>
          )}

          {/* Summary (collapsed = 1 line) */}
          <p style={{
            fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5, fontWeight: 300,
            display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {opp.summary}
          </p>
        </div>

        {/* Score ring + expand chevron */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <ScoreRing score={opp.score} />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--transition)', color: 'var(--text3)' }}>
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)' }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
            padding: '0 20px',
          }}>
            {[
              { id: 'breakdown', label: 'Score breakdown' },
              { id: 'checklist', label: 'Action checklist' },
              { id: 'details',   label: 'Details' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                padding: '10px 16px',
                fontSize: '12px', fontFamily: 'var(--font-mono)',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === id ? 'var(--accent)' : 'transparent'}`,
                color: activeTab === id ? 'var(--accent2)' : 'var(--text3)',
                cursor: 'pointer', transition: 'all var(--transition)',
                marginBottom: '-1px',
              }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px' }}>

            {/* ── Tab: Score breakdown ── */}
            {activeTab === 'breakdown' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Warnings */}
                {opp.warnings.length > 0 && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 'var(--radius)',
                    background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}>
                    {opp.warnings.map((w, i) => (
                      <p key={i} style={{ fontSize: '12px', color: 'var(--amber)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                        ⚠ {w.message}
                      </p>
                    ))}
                  </div>
                )}

                <ScoreBar
                  label="URGENCY"
                  score={opp.scoreBreakdown.urgency.score}
                  max={30}
                  color={uc}
                />
                <ScoreBar
                  label="PROFILE FIT"
                  score={opp.scoreBreakdown.fit.score}
                  max={40}
                  color="var(--accent)"
                  breakdown={opp.scoreBreakdown.fit.breakdown}
                />
                <ScoreBar
                  label="COMPLETENESS"
                  score={opp.scoreBreakdown.completeness.score}
                  max={20}
                  color="var(--teal)"
                  breakdown={opp.scoreBreakdown.completeness.breakdown}
                />
                <ScoreBar
                  label="BONUS"
                  score={opp.scoreBreakdown.bonus.score}
                  max={10}
                  color="var(--amber)"
                  breakdown={opp.scoreBreakdown.bonus.breakdown}
                />

                {/* Total */}
                <div style={{
                  borderTop: '1px solid var(--border)', paddingTop: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.06em' }}>
                    TOTAL SCORE
                  </span>
                  <span style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text)' }}>
                    {opp.score}<span style={{ fontSize: '13px', color: 'var(--text3)' }}>/100</span>
                  </span>
                </div>
              </div>
            )}

            {/* ── Tab: Action checklist ── */}
            {activeTab === 'checklist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  Complete these steps to apply:
                </p>
                {opp.checklist.map((step, i) => (
                  <ChecklistItem key={i} step={step} index={i} />
                ))}
                {opp.link && (
                  <a href={opp.link} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    marginTop: '8px', padding: '9px 16px', borderRadius: 'var(--radius)',
                    background: 'var(--accent-bg)', border: '1px solid rgba(124,107,255,0.3)',
                    color: 'var(--accent2)', fontSize: '13px', fontWeight: 500,
                    textDecoration: 'none', transition: 'opacity var(--transition)',
                  }}>
                    Open application portal
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* ── Tab: Details ── */}
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <DetailRow label="Deadline" value={opp.deadline_raw || opp.deadline || 'Not specified'} />
                <DetailRow label="Location" value={opp.location || 'Not specified'} />
                {opp.stipend_or_benefit && <DetailRow label="Benefit" value={opp.stipend_or_benefit} />}
                {opp.contact && <DetailRow label="Contact" value={opp.contact} />}

                {opp.eligibility && opp.eligibility.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      ELIGIBILITY
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {opp.eligibility.map((e, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--teal)', marginTop: '1px', flexShrink: 0, fontSize: '10px' }}>◆</span>
                          <span style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5, fontWeight: 300 }}>{e}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {opp.required_docs && opp.required_docs.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      REQUIRED DOCUMENTS
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {opp.required_docs.map((d, i) => (
                        <span key={i} style={{
                          fontSize: '12px', padding: '3px 10px', borderRadius: '6px',
                          background: 'var(--bg3)', border: '1px solid var(--border)',
                          color: 'var(--text2)', fontFamily: 'var(--font-mono)',
                        }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

function ChecklistItem({ step, index }) {
  const [done, setDone] = useState(false)
  const priorityColor = {
    urgent: 'var(--red)',
    high:   'var(--amber)',
    medium: 'var(--teal)',
    low:    'var(--text3)',
  }[step.priority] || 'var(--text3)'

  return (
    <div
      onClick={() => setDone(!done)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '10px 12px', borderRadius: 'var(--radius)',
        background: done ? 'var(--green-bg)' : 'var(--bg2)',
        border: `1px solid ${done ? 'rgba(74,222,128,0.15)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all var(--transition)',
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%',
        border: `1.5px solid ${done ? 'var(--green)' : priorityColor}`,
        background: done ? 'var(--green-bg)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: '1px', transition: 'all var(--transition)',
      }}>
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5l2 2 5-5" stroke="var(--green)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{
        fontSize: '13px', color: done ? 'var(--text3)' : 'var(--text)',
        lineHeight: 1.5, fontWeight: 300,
        textDecoration: done ? 'line-through' : 'none',
        transition: 'all var(--transition)',
      }}>
        {step.action}
      </span>
      <span style={{
        fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
        textTransform: 'uppercase', color: priorityColor,
        marginLeft: 'auto', flexShrink: 0, marginTop: '3px',
      }}>
        {step.priority}
      </span>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <span style={{
        fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)',
        letterSpacing: '0.04em', width: '80px', flexShrink: 0, paddingTop: '1px',
      }}>
        {label.toUpperCase()}
      </span>
      <span style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 300, lineHeight: 1.5 }}>
        {value}
      </span>
    </div>
  )
}

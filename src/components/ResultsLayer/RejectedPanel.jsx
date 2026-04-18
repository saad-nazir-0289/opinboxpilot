import { useState } from 'react'

export default function RejectedPanel({ rejected }) {
  const [open, setOpen] = useState(false)

  if (!rejected || rejected.length === 0) return null

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      background: 'var(--bg1)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--red)', opacity: 0.7,
          }} />
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.04em' }}>
            FILTERED OUT — {rejected.length} non-opportunit{rejected.length === 1 ? 'y' : 'ies'}
          </span>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--transition)', flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rejected.map((r) => (
            <div key={r.id} style={{
              padding: '10px 12px', borderRadius: 'var(--radius)',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--red)', opacity: 0.6, marginTop: '5px', flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {r.snippet && (
                  <p style={{
                    fontSize: '12px', color: 'var(--text2)', fontFamily: 'var(--font-mono)',
                    marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {r.snippet}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.5 }}>
                  {r.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

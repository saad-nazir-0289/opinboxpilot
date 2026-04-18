import { useAppStore } from './store/appStore'
import EmailInput from './components/InputLayer/EmailInput'
import StudentProfile from './components/InputLayer/StudentProfile'
import ResultsDashboard from './components/ResultsLayer/ResultsDashboard'
import { getEmailCount } from './lib/emailParser'

export default function App() {
  const { rawEmails, studentProfile: p, isProcessing, currentStep, analyse, reset, error } = useAppStore()

  const emailCount = getEmailCount(rawEmails);

  const canAnalyze = emailCount >= 1 && p.degree && p.program && p.semester && p.cgpa

  const handleAnalyze = () => {
    analyse(false)
  }

  const handleDemo = () => {
    analyse(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {error && currentStep === 'input' && (
        <div
          role="alert"
          style={{
            margin: '0 40px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(239,68,68,0.4)',
            background: 'rgba(239,68,68,0.08)',
            color: 'var(--text)',
            fontSize: '13px',
            lineHeight: 1.5,
            maxWidth: '960px',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Top nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,11,0.85)',
        backdropFilter: 'blur(16px)',
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
          <span style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.01em' }}>Inbox Copilot</span>
          <span style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            padding: '2px 7px', borderRadius: '4px',
            background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)',
          }}>SOFTEC 2026</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[{ n: '01', label: 'Input', id: 'input' }, { n: '02', label: 'Analyse', id: 'processing' }, { n: '03', label: 'Results', id: 'results' }].map(({ n, label, id }, i) => {
            const active = currentStep === id || (currentStep === 'processing' && label === 'Analyse');
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {i > 0 && <div style={{ width: '20px', height: '1px', background: 'var(--border)' }} />}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '6px',
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(124,107,255,0.3)' : 'transparent'}`,
                  cursor: id === 'input' && currentStep === 'results' ? 'pointer' : 'default'
                }} onClick={() => id === 'input' && currentStep === 'results' && reset()}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: active ? 'var(--accent2)' : 'var(--text3)' }}>{n}</span>
                  <span style={{ fontSize: '12px', color: active ? 'var(--text)' : 'var(--text3)', fontWeight: active ? 500 : 400 }}>{label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </nav>

      {/* ── Page header ── */}
      <div style={{ padding: '56px 40px 40px', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px', opacity: 0.4, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(124,107,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '6px',
            background: 'var(--bg3)', border: '1px solid var(--border)', marginBottom: '16px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>
              AI-powered · GPT-4o
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.02em',
            color: 'var(--text)', marginBottom: '12px',
          }}>
            Stop missing opportunities<br />
            <span style={{ color: 'var(--accent2)', fontStyle: 'italic' }}>hiding in your inbox.</span>
          </h1>
          <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--text2)', lineHeight: 1.6, maxWidth: '520px' }}>
            Paste your emails, fill your profile — we'll rank every scholarship,
            internship, and fellowship by how relevant and urgent it is for <em>you</em>.
          </p>
        </div>
      </div>

      {currentStep === 'results' ? (
        <ResultsDashboard />
      ) : (
        <>
          {/* ── Main 2-column grid ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '1px', background: 'var(--border)',
        minHeight: 'calc(100vh - 300px)',
      }}>
        <div style={{ background: 'var(--bg)', padding: '40px' }}>
          <EmailInput />
        </div>
        <div style={{ background: 'var(--bg1)', padding: '40px', overflowY: 'auto' }}>
          <StudentProfile />
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 100,
        borderTop: '1px solid var(--border)',
        background: 'rgba(10,10,11,0.92)', backdropFilter: 'blur(16px)',
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {[
            { label: 'Emails',   ok: emailCount >= 1 },
            { label: 'Degree',   ok: !!p.degree },
            { label: 'Program',  ok: !!p.program },
            { label: 'Semester', ok: !!p.semester },
            { label: 'CGPA',     ok: !!p.cgpa },
          ].map(({ label, ok }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: `1px solid ${ok ? 'var(--green)' : 'var(--border)'}`,
                background: ok ? 'var(--green-bg)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--transition)',
              }}>
                {ok && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3l2 2 4-4" stroke="var(--green)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: ok ? 'var(--text2)' : 'var(--text3)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDemo}
            style={{
              padding: '12px 20px', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--bg2)',
              color: 'var(--text2)', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all var(--transition)',
            }}
          >
            Use Sample Data
          </button>
          
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isProcessing}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 28px', borderRadius: 'var(--radius)',
              border: canAnalyze ? '1px solid rgba(124,107,255,0.4)' : '1px solid var(--border)',
              background: canAnalyze
                ? 'linear-gradient(135deg, var(--accent) 0%, rgba(167,139,250,0.8) 100%)'
                : 'var(--bg2)',
              color: canAnalyze ? '#fff' : 'var(--text3)',
              fontSize: '14px', fontWeight: 500,
              cursor: canAnalyze ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition)',
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Analyzing emails...
              </span>
            ) : (
              <>
                Analyse opportunities
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
      </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #18181d; color: #e8e8ec; }
        input::placeholder, textarea::placeholder { color: var(--text3); }
        input:focus, textarea:focus, select:focus { border-color: var(--border-hi) !important; }
        button:hover:not(:disabled) { opacity: 0.88; }
      `}</style>
    </div>
  )
}

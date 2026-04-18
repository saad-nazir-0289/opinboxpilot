import { useAppStore } from '../../store/appStore'

const DEGREES = ['BS', 'MS', 'PhD', 'BBA', 'MBA', 'MBBS', 'BE', 'Other']

const PROGRAMS = [
  'Computer Science', 'Software Engineering', 'Electrical Engineering',
  'Mechanical Engineering', 'Business Administration', 'Economics',
  'Data Science', 'Artificial Intelligence', 'Bioinformatics',
  'Mathematics', 'Physics', 'Medicine', 'Law', 'Other',
]

const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th+']

const OPP_TYPES = [
  { id: 'scholarship', label: 'Scholarship', icon: '◆' },
  { id: 'internship',  label: 'Internship',  icon: '◇' },
  { id: 'fellowship',  label: 'Fellowship',  icon: '○' },
  { id: 'competition', label: 'Competition', icon: '△' },
  { id: 'admission',   label: 'Admission',   icon: '□' },
  { id: 'research',    label: 'Research',    icon: '◉' },
  { id: 'grant',       label: 'Grant',       icon: '◈' },
]

const CGPA_BANDS = ['< 2.0', '2.0 – 2.5', '2.5 – 3.0', '3.0 – 3.5', '3.5 – 4.0']

// Reusable field wrapper
function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <label style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text2)',
        }}>
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            — {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// Input style
const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg1)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  fontWeight: 300,
  outline: 'none',
  transition: 'border-color var(--transition)',
  appearance: 'none',
}

// Select style
const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2355556a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
}

export default function StudentProfile() {
  const { studentProfile: p, setProfile, togglePreferredType } = useAppStore()

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--border-hi)'
  }
  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--border)'
  }

  const completionFields = [
    p.degree, p.program, p.semester, p.cgpa, p.skills,
    p.studentProfile?.preferredTypes?.length > 0 || p.preferredTypes?.length > 0 ? 'x' : '',
  ]
  const filledCount = [p.degree, p.program, p.semester, p.cgpa, p.skills, p.preferredTypes.length > 0 ? 'x' : ''].filter(Boolean).length
  const completion = Math.round((filledCount / 6) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text2)',
            fontFamily: 'var(--font-mono)',
          }}>
            02 / Student Profile
          </h2>
          <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--text)', marginTop: '4px' }}>
            Tell us about yourself
          </p>
        </div>

        {/* Completion ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg3)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke={completion === 100 ? 'var(--green)' : 'var(--accent)'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${completion * 0.88} 88`}
              transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dasharray 0.4s cubic-bezier(0.4,0,0.2,1)' }}
            />
            <text x="18" y="22" textAnchor="middle" style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fill: completion === 100 ? 'var(--green)' : 'var(--text2)',
            }}>
              {completion}%
            </text>
          </svg>
          <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            complete
          </span>
        </div>
      </div>

      {/* ── Row 1: Name ── */}
      <Field label="Full name" hint="optional">
        <input
          type="text"
          placeholder="e.g. Sara Ahmed"
          value={p.name}
          onChange={(e) => setProfile({ name: e.target.value })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyle}
        />
      </Field>

      {/* ── Row 2: Degree + Program ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
        <Field label="Degree">
          <select
            value={p.degree}
            onChange={(e) => setProfile({ degree: e.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={selectStyle}
          >
            <option value="">— select</option>
            {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>

        <Field label="Program / Major">
          <select
            value={p.program}
            onChange={(e) => setProfile({ program: e.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={selectStyle}
          >
            <option value="">— select program</option>
            {PROGRAMS.map((pr) => <option key={pr} value={pr}>{pr}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Row 3: Semester + CGPA ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Current semester">
          <select
            value={p.semester}
            onChange={(e) => setProfile({ semester: e.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={selectStyle}
          >
            <option value="">— select</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s} semester</option>)}
          </select>
        </Field>

        <Field label="CGPA range">
          <select
            value={p.cgpa}
            onChange={(e) => setProfile({ cgpa: e.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={selectStyle}
          >
            <option value="">— select range</option>
            {CGPA_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Preferred opportunity types (multi-toggle) ── */}
      <Field label="Preferred opportunity types" hint="select all that apply">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {OPP_TYPES.map(({ id, label, icon }) => {
            const active = p.preferredTypes.includes(id)
            return (
              <button
                key={id}
                onClick={() => togglePreferredType(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${active ? 'rgba(124,107,255,0.5)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-bg)' : 'var(--bg1)',
                  color: active ? 'var(--accent2)' : 'var(--text2)',
                  fontSize: '13px',
                  fontWeight: active ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '10px', opacity: active ? 1 : 0.5 }}>{icon}</span>
                {label}
              </button>
            )
          })}
        </div>
      </Field>

      {/* ── Skills + Interests ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Skills" hint="comma-separated">
          <input
            type="text"
            placeholder="Python, React, ML, SQL…"
            value={p.skills}
            onChange={(e) => setProfile({ skills: e.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />
        </Field>

        <Field label="Interests" hint="comma-separated">
          <input
            type="text"
            placeholder="AI research, startups, climate…"
            value={p.interests}
            onChange={(e) => setProfile({ interests: e.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />
        </Field>
      </div>

      {/* ── Location + Nationality ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Location preference">
          <input
            type="text"
            placeholder="e.g. Pakistan, Remote, US…"
            value={p.locationPreference}
            onChange={(e) => setProfile({ locationPreference: e.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />
        </Field>

        <Field label="Nationality">
          <input
            type="text"
            placeholder="e.g. Pakistani"
            value={p.nationality}
            onChange={(e) => setProfile({ nationality: e.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />
        </Field>
      </div>

      {/* ── Past experience ── */}
      <Field label="Past experience" hint="internships, projects, publications">
        <textarea
          placeholder="e.g. 3-month internship at XYZ, published paper on NLP, ICPC regional finalist…"
          value={p.pastExperience}
          onChange={(e) => setProfile({ pastExperience: e.target.value })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={3}
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: '1.6',
          }}
        />
      </Field>

      {/* ── Financial need toggle ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: 'var(--radius)',
        border: `1px solid ${p.financialNeed ? 'rgba(124,107,255,0.3)' : 'var(--border)'}`,
        background: p.financialNeed ? 'var(--accent-bg)' : 'var(--bg1)',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        userSelect: 'none',
      }}
        onClick={() => setProfile({ financialNeed: !p.financialNeed })}
      >
        <div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: p.financialNeed ? 'var(--accent2)' : 'var(--text)' }}>
            Financial need
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            Prioritise need-based scholarships and grants
          </p>
        </div>
        <div style={{
          width: '40px', height: '22px',
          borderRadius: '11px',
          background: p.financialNeed ? 'var(--accent)' : 'var(--bg3)',
          border: '1px solid var(--border)',
          position: 'relative',
          flexShrink: 0,
          transition: 'background var(--transition)',
        }}>
          <div style={{
            position: 'absolute',
            top: '3px',
            left: p.financialNeed ? '20px' : '3px',
            width: '14px', height: '14px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left var(--transition)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

    </div>
  )
}

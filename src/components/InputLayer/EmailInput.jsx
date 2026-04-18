import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { getEmailCount } from '../../lib/emailParser'

const PLACEHOLDER = `From: HEC Scholarships <scholarships@hec.gov.pk>
Subject: HEC Need-Based Scholarship 2026 — Applications Open

Dear Student,

Applications are now open for the HEC Need-Based Scholarship Program 2026. This scholarship covers full tuition and a monthly stipend of PKR 8,000 for deserving students.

Eligibility: CGPA ≥ 2.5, enrolled in BS program, household income below PKR 50,000/month.

Required documents: CNIC copy, income certificate, transcript, 1-page personal statement.

Deadline: May 15, 2026
Apply at: hec.gov.pk/scholarships/need-based

---

From: Google Developer Relations <developers@google.com>
Subject: Google Summer of Code 2026 — Applications Now Open

Hi there,

Google Summer of Code 2026 is accepting student applications. Work with an open source organization for 12 weeks and earn a stipend of $1500–$3000 USD.

Eligibility: Must be 18+, enrolled in a degree program, proficient in at least one programming language.

Deadline: April 22, 2026
Learn more: summerofcode.withgoogle.com`

const OPTY_TYPES = [
  'Scholarship',
  'Internship',
  'Fellowship',
  'Competition',
  'Admission',
  'Research',
  'Grant',
]

export default function EmailInput() {
  const { rawEmails, setRawEmails } = useAppStore()
  const [focused, setFocused] = useState(false)

  const emailCount = getEmailCount(rawEmails);

  const isValid = emailCount >= 1

  return (
    <div className="email-input-shell panel-animate" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header row */}
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
            01 / Email Input
          </h2>
          <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--text)', marginTop: '4px' }}>
            Paste your emails below
          </p>
        </div>

        {/* Live counter badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '100px',
          background: emailCount > 0 ? 'var(--teal-bg)' : 'var(--bg3)',
          border: `1px solid ${emailCount > 0 ? 'rgba(45,212,191,0.25)' : 'var(--border)'}`,
          transition: 'all var(--transition)',
        }}>
          <div style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: emailCount > 0 ? 'var(--teal)' : 'var(--text3)',
            transition: 'background var(--transition)',
          }} />
          <span style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: emailCount > 0 ? 'var(--teal)' : 'var(--text3)',
            fontWeight: 500,
          }}>
            {emailCount} / 100 emails
          </span>
        </div>
      </div>

      {/* Hint bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        {OPTY_TYPES.map((t) => (
          <span key={t} style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'var(--bg3)',
            color: 'var(--text3)',
            border: '1px solid var(--border)',
          }}>
            {t}
          </span>
        ))}
        <span style={{ fontSize: '11px', color: 'var(--text3)', alignSelf: 'center', fontFamily: 'var(--font-mono)' }}>
          ← email types detected automatically
        </span>
      </div>

      {/* Textarea */}
      <div style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${focused ? 'var(--border-hi)' : 'var(--border)'}`,
        background: 'var(--bg1)',
        transition: 'border-color var(--transition)',
        overflow: 'hidden',
      }}>
        {/* Line numbers column */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '42px',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '16px',
          gap: '0',
          pointerEvents: 'none',
        }}>
          {Array.from({ length: 22 }).map((_, i) => (
            <div key={i} style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text3)',
              textAlign: 'center',
              lineHeight: '24px',
              height: '24px',
            }}>
              {i + 1}
            </div>
          ))}
        </div>

        <textarea
          value={rawEmails}
          onChange={(e) => setRawEmails(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          style={{
            display: 'block',
            width: '100%',
            height: '320px',
            paddingLeft: '58px',
            paddingTop: '16px',
            paddingRight: '16px',
            paddingBottom: '16px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            lineHeight: '24px',
            caretColor: 'var(--accent2)',
          }}
        />

        {/* Bottom status bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '8px 16px 8px 58px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
            Auto-detects emails by <span style={{ color: 'var(--text2)' }}>From:</span>, <span style={{ color: 'var(--text2)' }}>Subject:</span>, or <span style={{ color: 'var(--text2)' }}>Date:</span> headers.
          </span>
          {rawEmails.length > 0 && (
            <button
              className="btn"
              onClick={() => setRawEmails('')}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--red)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                opacity: 0.7,
              }}
            >
              clear ×
            </button>
          )}
        </div>
      </div>

      {/* Validation hint */}
      {!isValid && rawEmails.length > 0 && (
        <p style={{ fontSize: '12px', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
          ⚠ Add at least 1 email to continue
        </p>
      )}
    </div>
  )
}

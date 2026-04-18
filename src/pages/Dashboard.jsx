import { useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import EmailInput from '../components/InputLayer/EmailInput';
import ResultsDashboard from '../components/ResultsLayer/ResultsDashboard';
import { getEmailCount } from '../lib/emailParser';
import { useNavigate } from 'react-router-dom';
import { extractTextFromPdf } from '../lib/pdfEmailExtractor';

export default function Dashboard() {
  const { rawEmails, setRawEmails, studentProfile: p, isProcessing, currentStep, analyse, reset, error, logout, token } = useAppStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const emailCount = getEmailCount(rawEmails);
  const canAnalyze = emailCount >= 1 && p.degree && p.program && p.semester && p.cgpa;

  const handleUploadClick = () => fileInputRef.current?.click();

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsExtractingPdf(true);
    try {
      const extracted = await extractTextFromPdf(file);
      const normalized = extracted.replace(/\r/g, '').trim();
      if (!normalized) {
        setUploadError('Could not extract readable text from this PDF.');
        return;
      }
      setRawEmails(normalized);
    } catch (err) {
      setUploadError(err?.message || 'Failed to parse PDF. Try another file.');
    } finally {
      event.target.value = '';
      setIsExtractingPdf(false);
    }
  };

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top nav */}
      <nav className="dashboard-nav glass-card" style={{
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2v10M2 2l10 10M12 2L2 12" stroke="var(--accent2)" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Inbox Copilot</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px' }}>Edit Profile</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px' }}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard-content" style={{ padding: '0 40px', marginTop: '40px' }}>
        {error && currentStep === 'input' && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: 'var(--text)', fontSize: '13px', marginBottom: '20px' }}>{error}</div>
        )}

        {currentStep === 'results' ? (
          <ResultsDashboard />
        ) : (
          <div className="dashboard-main panel-animate" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--text)', marginBottom: '16px', letterSpacing: '-0.02em' }}>Opportunity Intelligence Workspace</h1>
            <p style={{ color: 'var(--text2)', marginBottom: '32px', lineHeight: 1.6 }}>Paste emails or upload a PDF, then let AI extract actionable opportunities mapped to your profile.</p>

            <EmailInput />

            <div className="dashboard-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => analyse(true)} style={{ padding: '12px 20px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)' }}>Use Sample Data</button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleUploadClick}
                disabled={isExtractingPdf}
                style={{ padding: '12px 20px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)' }}
              >
                {isExtractingPdf ? 'Extracting PDF...' : 'Upload PDF'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                style={{ display: 'none' }}
              />
              <button 
                className="btn btn-primary"
                onClick={() => analyse(false)} 
                disabled={!canAnalyze || isProcessing}
                style={{ padding: '12px 28px', borderRadius: '6px', border: 'none', background: canAnalyze ? 'var(--accent)' : 'var(--bg2)', color: canAnalyze ? '#fff' : 'var(--text3)', opacity: isProcessing ? 0.7 : 1 }}
              >
                {isProcessing ? 'Analyzing...' : 'Analyze Opportunities'}
              </button>
            </div>
            
            {!canAnalyze && emailCount >= 1 && (
               <p style={{ textAlign: 'right', marginTop: '12px', fontSize: '12px', color: 'var(--text3)' }}>
                 Please complete your profile (Degree, Program, Semester, CGPA) to analyze. <br/>
                 <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0 }}>Go to Profile</button>
               </p>
            )}
            {uploadError && (
              <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                {uploadError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

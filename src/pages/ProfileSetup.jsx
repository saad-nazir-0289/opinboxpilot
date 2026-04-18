import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import StudentProfile from '../components/InputLayer/StudentProfile';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const {  fetchProfile, saveProfileToDB, isProcessing, error } = useAppStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    const success = await saveProfileToDB();
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg1)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text)', marginBottom: '8px' }}>
          Complete Your Profile
        </h1>
        <p style={{ color: 'var(--text2)', marginBottom: '32px', fontSize: '14px' }}>
          Tell us about your background so we can find the most relevant opportunities for you.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', color: 'var(--text)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <StudentProfile />

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ padding: '12px 24px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            Skip for now
          </button>
          <button 
            onClick={handleSave}
            disabled={isProcessing}
            style={{ padding: '12px 28px', borderRadius: '6px', background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: '500' }}
          >
            {isProcessing ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

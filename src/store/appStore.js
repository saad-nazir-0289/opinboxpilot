import { create } from 'zustand'
import { MAX_ANALYSIS_EMAILS } from '../lib/appConstants'
import { extractOpportunities } from '../lib/aiApi'
import { buildApiUrl } from '../lib/apiConfig'
import { scoreAndRank } from '../lib/scorer'

const defaultProfile = {
  name: '',
  degree: '',
  program: '',
  semester: '',
  cgpa: '',
  skills: '',
  interests: '',
  preferredTypes: [],
  financialNeed: false,
  locationPreference: '',
  pastExperience: '',
  nationality: '',
}

export const useAppStore = create((set, get) => ({
  // Auth state
  token: localStorage.getItem('token') || null,
  user: null,
  isGoogleUser: false,

  // Step tracking
  currentStep: 'input', // 'input' | 'processing' | 'results'

  // Input layer
  rawEmails: '',
  studentProfile: defaultProfile,

  // Results
  opportunities: [],
  rejected: [],
  isProcessing: false,
  error: null,
  usage: null,

  // Auth Actions
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, studentProfile: defaultProfile, isGoogleUser: false });
  },

  fetchProfile: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch(buildApiUrl('/api/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const profileData = data.profile || {};
        if (!profileData.preferredTypes) profileData.preferredTypes = [];
        set({ studentProfile: { ...defaultProfile, ...profileData }, isGoogleUser: data.isGoogleUser || false });
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  },

  fetchGmail: async () => {
    const { token, rawEmails } = get();
    if (!token) return false;
    try {
      set({ isProcessing: true, error: null });
      const res = await fetch(buildApiUrl('/api/gmail/fetch'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.text) {
           const existing = rawEmails.trim() ? rawEmails + '\n\n' : '';
           set({ rawEmails: existing + data.text, isProcessing: false });
        } else {
           set({ isProcessing: false });
        }
        return true;
      } else {
        set({ error: data.error || 'Failed to fetch Gmail data', isProcessing: false });
        return false;
      }
    } catch (err) {
      set({ error: 'Network error fetching Gmail', isProcessing: false });
      return false;
    }
  },

  saveProfileToDB: async () => {
    const { token, studentProfile } = get();
    if (!token) return false;
    try {
      set({ isProcessing: true, error: null });
      const res = await fetch(buildApiUrl('/api/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentProfile)
      });
      if (res.ok) {
        set({ isProcessing: false });
        return true;
      } else {
        const data = await res.json();
        set({ error: data.error || 'Failed to save profile', isProcessing: false });
        return false;
      }
    } catch (err) {
      set({ error: 'Network error saving profile', isProcessing: false });
      return false;
    }
  },

  // Actions
  setRawEmails: (rawEmails) => set({ rawEmails }),
  setProfile: (patch) =>
    set((s) => ({ studentProfile: { ...s.studentProfile, ...patch } })),
  togglePreferredType: (type) =>
    set((s) => {
      const cur = s.studentProfile.preferredTypes
      const next = cur.includes(type)
        ? cur.filter((t) => t !== type)
        : [...cur, type]
      return { studentProfile: { ...s.studentProfile, preferredTypes: next } }
    }),
  setError: (error) => set({ error }),
  goToStep: (step) => set({ currentStep: step }),
  reset: () =>
    set({
      currentStep: 'input',
      rawEmails: '',
      studentProfile: defaultProfile,
      opportunities: [],
      rejected: [],
      error: null,
      usage: null,
    }),

  // ── Main analysis action ──────────────────────────────────────────────────
  analyse: async (useSampleData = false) => {
    const { rawEmails, studentProfile } = get()

    set({ isProcessing: true, error: null, currentStep: 'processing' })

    try {
      const { opportunities: raw, rejected, usage, limitedDemo } = await extractOpportunities(
        rawEmails,
        studentProfile,
        null, // No API key passed from frontend anymore
        useSampleData
      )

      if (limitedDemo) {
        // Show an alert explicitly mapping to the edge cases
        alert(`Processing first ${MAX_ANALYSIS_EMAILS} emails. The rest have been truncated to prevent overflow/API issues.`)
      }

      const scored = scoreAndRank(raw, studentProfile)

      set({
        opportunities: scored,
        rejected,
        usage,
        isProcessing: false,
        currentStep: 'results',
      })
    } catch (err) {
      set({
        isProcessing: false,
        error: err.message || 'Something went wrong. Please try again.',
        currentStep: 'input',
      })
    }
  },
}))

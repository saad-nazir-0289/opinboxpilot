import { create } from 'zustand'
import { extractOpportunities } from '../lib/aiApi'
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
        alert("Processing first 10 emails for demo. The rest have been truncated to prevent overflow/API issues.")
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

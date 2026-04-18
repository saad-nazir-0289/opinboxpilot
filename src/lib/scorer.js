/**
 * scorer.js — Deterministic opportunity scoring engine
 *
 * Total score: 100 points
 *   Urgency      → 30 pts  (deadline proximity)
 *   Profile fit  → 40 pts  (degree, CGPA, skills, type preference, location)
 *   Completeness → 20 pts  (how actionable is the opportunity)
 *   Bonus        → 10 pts  (financial need match, confidence, no CGPA barrier)
 */

const CGPA_MIDPOINTS = {
  '< 2.0':     1.5,
  '2.0 – 2.5': 2.25,
  '2.5 – 3.0': 2.75,
  '3.0 – 3.5': 3.25,
  '3.5 – 4.0': 3.75,
}

const DEGREE_MAP = {
  'BS': ['BS', 'Bachelor', 'Undergraduate', 'UG'],
  'MS': ['MS', 'Master', 'Graduate', 'Postgraduate'],
  'PhD': ['PhD', 'Doctorate', 'Doctoral'],
  'BBA': ['BBA', 'Bachelor', 'Undergraduate'],
  'MBA': ['MBA', 'Master'],
  'MBBS': ['MBBS', 'Medicine'],
  'BE': ['BE', 'Bachelor', 'Engineering'],
}


// ── 1. URGENCY SCORE (0–30) ─────────────────────────────────────────────────

function urgencyScore(opp) {
  const days = opp.days_until_deadline

  if (days === null || days === undefined) {
    return { score: 5, label: 'No deadline found', color: 'gray' }
  }
  if (days < 0) {
    return { score: 0, label: 'Deadline passed', color: 'red' }
  }
  if (days <= 3)  return { score: 30, label: `${days}d left — URGENT`,     color: 'red'    }
  if (days <= 7)  return { score: 26, label: `${days}d left — Very soon`,  color: 'red'    }
  if (days <= 14) return { score: 20, label: `${days}d left — Act soon`,   color: 'amber'  }
  if (days <= 30) return { score: 14, label: `${days}d left — This month`, color: 'amber'  }
  if (days <= 60) return { score: 8,  label: `${days}d left — Upcoming`,   color: 'teal'   }
  return              { score: 4,  label: `${days}d left — Future`,     color: 'green'  }
}


// ── 2. PROFILE FIT SCORE (0–40) ─────────────────────────────────────────────

function profileFitScore(opp, profile) {
  let score = 0
  const breakdown = []

  // Type preference match (12 pts)
  if (profile.preferredTypes && profile.preferredTypes.length > 0) {
    if (profile.preferredTypes.includes(opp.type)) {
      score += 12
      breakdown.push({ label: 'Matches your preferred type', pts: 12 })
    } else {
      breakdown.push({ label: 'Type not in your preferences', pts: 0 })
    }
  } else {
    score += 6 // neutral if no preference set
    breakdown.push({ label: 'No type preference set', pts: 6 })
  }

  // CGPA eligibility (10 pts)
  const studentCGPA = CGPA_MIDPOINTS[profile.cgpa]
  if (opp.cgpa_requirement && studentCGPA) {
    if (studentCGPA >= opp.cgpa_requirement) {
      score += 10
      breakdown.push({ label: `CGPA eligible (req: ${opp.cgpa_requirement})`, pts: 10 })
    } else if (studentCGPA >= opp.cgpa_requirement - 0.25) {
      score += 5
      breakdown.push({ label: `CGPA borderline (req: ${opp.cgpa_requirement})`, pts: 5 })
    } else {
      breakdown.push({ label: `CGPA below requirement (${opp.cgpa_requirement})`, pts: 0 })
    }
  } else {
    score += 7 // no CGPA requirement stated = neutral bonus
    breakdown.push({ label: 'No CGPA requirement stated', pts: 7 })
  }

  // Degree match (8 pts)
  const degreeAliases = DEGREE_MAP[profile.degree] || []
  const oppDegrees = opp.degree_requirement || []
  if (oppDegrees.length === 0) {
    score += 5
    breakdown.push({ label: 'Open to all degrees', pts: 5 })
  } else {
    const matches = oppDegrees.some((d) =>
      degreeAliases.some((a) => d.toLowerCase().includes(a.toLowerCase()))
    )
    if (matches) {
      score += 8
      breakdown.push({ label: `Degree match (${profile.degree})`, pts: 8 })
    } else {
      breakdown.push({ label: 'Degree requirement mismatch', pts: 0 })
    }
  }

  // Location match (5 pts)
  const loc = opp.location || 'unspecified'
  const prefLoc = (profile.locationPreference || '').toLowerCase()
  if (loc === 'remote' || loc === 'unspecified') {
    score += 3
    breakdown.push({ label: 'Remote / open location', pts: 3 })
  } else if (
    (loc === 'pakistan' && (prefLoc.includes('pakistan') || prefLoc === '')) ||
    (loc === 'international' && (prefLoc.includes('international') || prefLoc.includes('abroad')))
  ) {
    score += 5
    breakdown.push({ label: 'Location matches preference', pts: 5 })
  } else {
    score += 1
    breakdown.push({ label: 'Location outside preference', pts: 1 })
  }

  // Skills / interests keyword match (5 pts)
  const profileText = `${profile.skills} ${profile.interests} ${profile.pastExperience}`.toLowerCase()
  const oppText = `${opp.title} ${opp.summary} ${(opp.eligibility || []).join(' ')}`.toLowerCase()
  const keywords = profileText.split(/[\s,]+/).filter((w) => w.length > 3)
  const matchCount = keywords.filter((kw) => oppText.includes(kw)).length
  const skillPts = Math.min(5, Math.floor(matchCount * 1.2))
  score += skillPts
  breakdown.push({ label: `Skills/interests keyword match (${matchCount} hits)`, pts: skillPts })

  return { score: Math.min(40, score), breakdown }
}


// ── 3. COMPLETENESS SCORE (0–20) ────────────────────────────────────────────

function completenessScore(opp) {
  let score = 0
  const breakdown = []

  if (opp.deadline) {
    score += 6; breakdown.push({ label: 'Deadline specified', pts: 6 })
  } else {
    breakdown.push({ label: 'No deadline found', pts: 0 })
  }

  if (opp.link) {
    score += 6; breakdown.push({ label: 'Application link provided', pts: 6 })
  } else {
    breakdown.push({ label: 'No application link', pts: 0 })
  }

  if (opp.required_docs && opp.required_docs.length > 0) {
    score += 4; breakdown.push({ label: 'Required documents listed', pts: 4 })
  } else {
    breakdown.push({ label: 'Documents not specified', pts: 0 })
  }

  if (opp.eligibility && opp.eligibility.length > 0) {
    score += 4; breakdown.push({ label: 'Eligibility criteria clear', pts: 4 })
  } else {
    breakdown.push({ label: 'Eligibility unclear', pts: 0 })
  }

  return { score, breakdown }
}


// ── 4. BONUS SCORE (0–10) ───────────────────────────────────────────────────

function bonusScore(opp, profile) {
  let score = 0
  const breakdown = []

  // Financial need bonus
  if (profile.financialNeed && opp.is_financial_need_based) {
    score += 5; breakdown.push({ label: 'Need-based — matches your flag', pts: 5 })
  }

  // High confidence extraction
  if (opp.confidence === 'high') {
    score += 3; breakdown.push({ label: 'High extraction confidence', pts: 3 })
  } else if (opp.confidence === 'medium') {
    score += 1; breakdown.push({ label: 'Medium extraction confidence', pts: 1 })
  }

  // Has stipend / benefit info
  if (opp.stipend_or_benefit) {
    score += 2; breakdown.push({ label: 'Financial benefit described', pts: 2 })
  }

  return { score: Math.min(10, score), breakdown }
}


// ── GAP WARNINGS ────────────────────────────────────────────────────────────

function gapWarnings(opp, profile) {
  const warnings = []
  const studentCGPA = CGPA_MIDPOINTS[profile.cgpa]

  if (opp.cgpa_requirement && studentCGPA && studentCGPA < opp.cgpa_requirement) {
    warnings.push({
      type: 'cgpa',
      message: `Requires CGPA ${opp.cgpa_requirement} — your range (${profile.cgpa}) may be below threshold. Some programs accept waiver requests.`,
    })
  }

  if (opp.days_until_deadline !== null && opp.days_until_deadline < 0) {
    warnings.push({ type: 'expired', message: 'This deadline has already passed.' })
  }

  if (opp.degree_requirement && opp.degree_requirement.length > 0 && profile.degree) {
    const aliases = DEGREE_MAP[profile.degree] || []
    const match = opp.degree_requirement.some((d) =>
      aliases.some((a) => d.toLowerCase().includes(a.toLowerCase()))
    )
    if (!match) {
      warnings.push({
        type: 'degree',
        message: `Requires ${opp.degree_requirement.join(' or ')} — you are enrolled in ${profile.degree}.`,
      })
    }
  }

  return warnings
}


// ── ACTION CHECKLIST ────────────────────────────────────────────────────────

function actionChecklist(opp) {
  const steps = []

  if (opp.required_docs && opp.required_docs.length > 0) {
    opp.required_docs.forEach((doc) => {
      steps.push({ action: `Prepare: ${doc}`, priority: 'high' })
    })
  }

  if (opp.link) {
    steps.push({ action: `Visit the application portal: ${opp.link}`, priority: 'high' })
  }

  if (opp.deadline) {
    const daysLeft = opp.days_until_deadline
    if (daysLeft !== null && daysLeft <= 7) {
      steps.push({ action: `⚡ Submit before ${opp.deadline_raw || opp.deadline} — only ${daysLeft} days left`, priority: 'urgent' })
    } else {
      steps.push({ action: `Mark deadline in calendar: ${opp.deadline_raw || opp.deadline}`, priority: 'medium' })
    }
  }

  if (opp.contact) {
    steps.push({ action: `Contact for queries: ${opp.contact}`, priority: 'low' })
  }

  if (steps.length === 0) {
    steps.push({ action: 'Search online for the full application details', priority: 'medium' })
  }

  return steps
}


// ── MAIN SCORER ─────────────────────────────────────────────────────────────

/**
 * Score and rank all opportunities against the student profile
 * @param {Array} opportunities - extracted from AI
 * @param {Object} profile - student profile from store
 * @returns {Array} scored + sorted opportunities
 */
export function scoreAndRank(opportunities, profile) {
  const scored = opportunities
    .filter((opp) => opp.is_opportunity)
    .map((opp) => {
      const urgency      = urgencyScore(opp)
      const fit          = profileFitScore(opp, profile)
      const completeness = completenessScore(opp)
      const bonus        = bonusScore(opp, profile)

      const totalScore = Math.min(100, Math.max(0, urgency.score + fit.score + completeness.score + bonus.score))

      return {
        ...opp,
        score: totalScore,
        scoreBreakdown: {
          urgency:      { score: urgency.score,      max: 30, label: urgency.label,      color: urgency.color },
          fit:          { score: fit.score,           max: 40, label: 'Profile fit',      breakdown: fit.breakdown },
          completeness: { score: completeness.score,  max: 20, label: 'Completeness',     breakdown: completeness.breakdown },
          bonus:        { score: bonus.score,          max: 10, label: 'Bonus',            breakdown: bonus.breakdown },
        },
        warnings: gapWarnings(opp, profile),
        checklist: actionChecklist(opp),
      }
    })

  // Sort: expired opportunities go to the bottom
  const sorted = scored.sort((a, b) => {
    const aExpired = a.days_until_deadline !== null && a.days_until_deadline < 0
    const bExpired = b.days_until_deadline !== null && b.days_until_deadline < 0
    if (aExpired && !bExpired) return 1
    if (!aExpired && bExpired) return -1
    return b.score - a.score
  })

  // Deduplicate opportunities by title + deadline
  const seen = new Set();
  return sorted.filter(opp => {
      const key = `${opp.title}-${opp.deadline}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
  });
}


// ── URGENCY COLOR HELPER (used by UI) ───────────────────────────────────────

export function urgencyColor(days) {
  if (days === null || days === undefined) return 'var(--text3)'
  if (days < 0)   return 'var(--red)'
  if (days <= 7)  return 'var(--red)'
  if (days <= 14) return 'var(--amber)'
  if (days <= 30) return 'var(--amber)'
  return 'var(--teal)'
}

export function urgencyBg(days) {
  if (days === null || days === undefined) return 'var(--bg3)'
  if (days < 0)   return 'var(--red-bg)'
  if (days <= 7)  return 'var(--red-bg)'
  if (days <= 14) return 'var(--amber-bg)'
  if (days <= 30) return 'var(--amber-bg)'
  return 'var(--teal-bg)'
}

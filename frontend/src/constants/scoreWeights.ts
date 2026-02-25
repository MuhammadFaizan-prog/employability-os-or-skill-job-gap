/**
 * Step 1 — Score dimension weights (README).
 * Technical 40%, Projects 20%, Resume 15%, Practical 15%, Interview 10%.
 */
export const SCORE_WEIGHTS = {
  technical: 0.4,
  projects: 0.2,
  resume: 0.15,
  practical: 0.15,
  interview: 0.1,
} as const

export const ROLE_IDS = [
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'Mobile Developer',
] as const

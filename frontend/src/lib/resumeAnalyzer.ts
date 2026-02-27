/**
 * Step 6 — Resume analyzer (stub). Same interface as backend.
 * For now: fixed score + placeholder suggestions; analyze uses random/sample resume text.
 */

export interface ResumeSubScores {
  keywords: number
  format: number
  skillsGap: number
  clarity: number
}

export interface ResumeAnalysisResult {
  score: number
  subScores: ResumeSubScores
  suggestions: string[]
  keywordMatch?: Record<string, boolean>
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)))
}

/**
 * Analyze resume (stub). Accepts file or text; for now returns fixed score + suggestions (no parsing yet).
 * Dynamic: same interface for future real implementation (parse PDF/DOCX + NLP/GPT).
 */
export function analyzeResume(_fileOrText: string | File | null | undefined): ResumeAnalysisResult {
  const score = 50
  return {
    score,
    subScores: {
      keywords: clamp(score + 4),
      format: clamp(score + 13),
      skillsGap: clamp(score - 14),
      clarity: clamp(score - 4),
    },
    suggestions: [
      'Add 2–3 projects relevant to your target role.',
      'Quantify achievements with numbers where possible.',
      'Ensure ATS-friendly formatting (clear headings, no graphics).',
    ],
  }
}

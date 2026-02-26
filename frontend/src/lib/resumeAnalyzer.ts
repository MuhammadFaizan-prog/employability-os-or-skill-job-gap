/**
 * Step 6 — Resume analyzer (stub). Same interface as backend.
 * For now: fixed score + placeholder suggestions; analyze uses random/sample resume text.
 */

export interface ResumeAnalysisResult {
  score: number
  suggestions: string[]
  keywordMatch?: Record<string, boolean>
}

/**
 * Analyze resume (stub). Accepts file or text; for now returns fixed score + suggestions (no parsing yet).
 * Dynamic: same interface for future real implementation (parse PDF/DOCX + NLP/GPT).
 */
export function analyzeResume(_fileOrText: string | File | null | undefined): ResumeAnalysisResult {
  // Stub: return fixed score + suggestions; later replace with real parsing (e.g. randomResumeText() or PDF/DOCX)
  return {
    score: 50,
    suggestions: [
      'Add 2–3 projects relevant to your target role.',
      'Quantify achievements with numbers where possible.',
      'Ensure ATS-friendly formatting (clear headings, no graphics).',
    ],
  }
}

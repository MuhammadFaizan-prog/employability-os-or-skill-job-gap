/**
 * Resume analyzer — stub for MVP.
 * Later: parse PDF/DOCX, NLP/GPT for keyword match, ATS, quantification.
 */

export interface ResumeAnalysisResult {
  score: number; // 0–100
  suggestions: string[];
  keywordMatch?: Record<string, boolean>;
}

/**
 * Stub: returns a fixed score and placeholder suggestions.
 * Replace with real parsing + analysis when resume pipeline is built.
 */
export function analyzeResume(_fileOrText: unknown): ResumeAnalysisResult {
  return {
    score: 50,
    suggestions: [
      'Add 2–3 projects relevant to your target role.',
      'Quantify achievements with numbers where possible.',
      'Ensure ATS-friendly formatting (clear headings, no graphics).',
    ],
  };
}

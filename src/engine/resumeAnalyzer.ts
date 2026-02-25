/**
 * Step 6 — Resume analyzer (stub).
 * Interface: analyzeResume(fileOrText) → { score, suggestions }.
 * Stub: fixed score 50 + placeholder suggestions until real PDF/DOCX + NLP/GPT.
 */

export interface ResumeAnalysisResult {
  score: number; // 0–100
  suggestions: string[];
  keywordMatch?: Record<string, boolean>;
}

export type ResumeInput = string | File | null | undefined;

/**
 * Analyze resume: file upload or raw text.
 * Stub: returns fixed score (50) and placeholder suggestions.
 * Dynamic: same interface for future real implementation (Supabase Storage + parse + NLP/GPT).
 */
export function analyzeResume(_fileOrText: ResumeInput): ResumeAnalysisResult {
  // Stub: fixed score + placeholder suggestions; same interface for future real implementation
  return {
    score: 50,
    suggestions: [
      'Add 2–3 projects relevant to your target role.',
      'Quantify achievements with numbers where possible.',
      'Ensure ATS-friendly formatting (clear headings, no graphics).',
    ],
  };
}

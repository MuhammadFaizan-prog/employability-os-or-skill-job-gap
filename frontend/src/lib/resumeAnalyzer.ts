/**
 * Step 6 — Resume analyzer (stub). Same interface as backend.
 * For now: fixed score + placeholder suggestions; analyze uses random/sample resume text.
 */

export interface ResumeAnalysisResult {
  score: number
  suggestions: string[]
  keywordMatch?: Record<string, boolean>
}

/** Generate random/sample resume text for stub analysis (no real parsing yet). */
function randomResumeText(): string {
  const samples = [
    'Frontend Developer with 2 years experience. Skills: React, TypeScript, HTML, CSS. Project: E-commerce dashboard.',
    'Software Engineer. Education: BS Computer Science. Experience: Intern at Tech Co. Skills: JavaScript, Node.js, SQL.',
    'Recent graduate seeking role in Web Development. Portfolio: 3 projects. Proficient in HTML, CSS, JS, React.',
  ]
  return samples[Math.floor(Math.random() * samples.length)]
}

/**
 * Analyze resume (stub). Accepts file or text; for now uses random sample text and returns fixed shape.
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

/**
 * Step 4 — Resume analyzer (real implementation).
 * Extracts text from .txt or PDF, scores by keyword match, sections, quantified achievements, formatting.
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

/** Extract plain text from a File. Supports .txt and .pdf (via pdfjs-dist). */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = (file.name || '').toLowerCase()
  const isTxt = name.endsWith('.txt')
  const isPdf = name.endsWith('.pdf')

  if (isTxt) {
    return file.text()
  }

  if (isPdf) {
    try {
      const { getDocument } = await import('pdfjs-dist')
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      const parts: string[] = []
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const text = content.items
          .map((item: unknown) => (item && typeof item === 'object' && 'str' in item ? String((item as { str?: string }).str ?? '') : ''))
          .join(' ')
        parts.push(text)
      }
      return parts.join('\n')
    } catch (e) {
      console.warn('PDF extraction failed:', e)
      return ''
    }
  }

  // DOCX / other: try as text for basic support
  try {
    return await file.text()
  } catch {
    return ''
  }
}

const SECTION_HEADINGS = [
  'experience', 'work experience', 'employment', 'education', 'skills',
  'summary', 'objective', 'projects', 'technical skills', 'certifications',
  'achievements', 'qualifications',
]

/** Detect how many standard sections appear in the text. */
function countSections(text: string): number {
  const lower = text.toLowerCase()
  let count = 0
  for (const heading of SECTION_HEADINGS) {
    if (lower.includes(heading)) count++
  }
  return count
}

/** Count phrases that look like quantified achievements (numbers + context). */
function countQuantified(text: string): number {
  const patterns = [
    /\d+%/,           // e.g. 40%
    /\d+x\s*(faster|improvement|increase)/i,
    /\d+\s*(years?|yrs?)\s*(of|experience)/i,
    /\d+\s*(million|thousand|k)\s*/i,
    /(reduced|increased|improved|saved)\s*(by\s*)?\d+/i,
    /\$\d+/,
  ]
  let count = 0
  for (const p of patterns) {
    const matches = text.match(new RegExp(p.source, 'gi'))
    if (matches) count += matches.length
  }
  return Math.min(count, 10) // cap so one dimension doesn't dominate
}

/**
 * Analyze resume: extract text, score by keyword match, sections, quantified achievements, clarity.
 * roleSkillNames: skill names for the target role (e.g. from skills table) for keyword matching.
 */
export async function analyzeResume(
  file: File | null | undefined,
  roleSkillNames: string[] = []
): Promise<ResumeAnalysisResult> {
  if (!file) {
    return {
      score: 0,
      subScores: { keywords: 0, format: 0, skillsGap: 0, clarity: 0 },
      suggestions: ['Upload a resume file to analyze.'],
    }
  }

  const rawText = await extractTextFromFile(file)
  const text = rawText.replace(/\s+/g, ' ').trim()
  const wordCount = text.split(/\s+/).filter(Boolean).length

  // Keyword match: how many role skills appear in the resume (case-insensitive, partial match)
  const skillNamesNormalized = roleSkillNames.map(s => s.toLowerCase().trim()).filter(Boolean)
  const textLower = text.toLowerCase()
  const keywordMatch: Record<string, boolean> = {}
  let matched = 0
  for (const name of skillNamesNormalized) {
    const words = name.split(/\s+/).filter(Boolean)
    const found = words.length > 0 && words.some(w => textLower.includes(w)) || textLower.includes(name)
    keywordMatch[name] = !!found
    if (found) matched++
  }
  const keywordRatio = skillNamesNormalized.length > 0 ? matched / skillNamesNormalized.length : 0
  const keywordsScore = clamp(keywordRatio * 100)

  // Format: section detection (headings)
  const sectionsFound = countSections(text)
  const formatScore = clamp(Math.min(sectionsFound, 6) * (100 / 6))

  // Quantified achievements
  const quantCount = countQuantified(text)
  const skillsGapScore = clamp(quantCount * 10) // 0–10 achievements -> 0–100

  // Clarity: length and structure (not too short, not too long)
  let clarityScore = 50
  if (wordCount >= 200 && wordCount <= 600) clarityScore = 85
  else if (wordCount >= 100 && wordCount < 200) clarityScore = 70
  else if (wordCount > 600 && wordCount <= 1000) clarityScore = 75
  else if (wordCount > 0 && wordCount < 100) clarityScore = 40
  clarityScore = clamp(clarityScore)

  // Overall score: weighted average of sub-scores (emphasize keywords for role fit)
  const score = clamp(
    keywordsScore * 0.4 + formatScore * 0.25 + skillsGapScore * 0.2 + clarityScore * 0.15
  )

  const suggestions: string[] = []
  if (keywordsScore < 60 && skillNamesNormalized.length > 0) {
    const missing = Object.entries(keywordMatch).filter(([, v]) => !v).map(([k]) => k).slice(0, 3)
    if (missing.length) {
      suggestions.push(`Add or highlight these role-relevant skills: ${missing.join(', ')}.`)
    }
  }
  if (formatScore < 50) {
    suggestions.push('Use clear section headings (e.g. Experience, Education, Skills) for ATS and readability.')
  }
  if (skillsGapScore < 40) {
    suggestions.push('Quantify achievements with numbers (e.g. "Improved performance by 40%", "3 years experience").')
  }
  if (clarityScore < 60) {
    if (wordCount < 100) suggestions.push('Add more detail: expand experience and skills sections.')
    else if (wordCount > 800) suggestions.push('Consider shortening to 1–2 pages; keep the most relevant experience.')
  }
  if (suggestions.length === 0) {
    suggestions.push('Resume looks strong. Tailor bullet points to each job description for best results.')
  }

  return {
    score,
    subScores: {
      keywords: keywordsScore,
      format: formatScore,
      skillsGap: skillsGapScore,
      clarity: clarityScore,
    },
    suggestions,
    keywordMatch,
  }
}

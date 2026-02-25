/**
 * Step 4 — Skill gap analysis (frontend, dynamic from Supabase).
 * Mirrors backend src/engine/skillGap.ts: gaps, strengths, priority focus, suggested next skill.
 */

const MIN_PROFICIENCY_STRENGTH = 4
const MIN_PROFICIENCY_ACCEPTABLE = 3

export interface SkillRow {
  id: string
  name: string
  role: string
  difficulty?: number
  weight?: number
}

export interface SkillGapStrength {
  skill: SkillRow
  proficiency: number
}

export interface SkillGapGap {
  skill: SkillRow
  currentProficiency: number
  recommendedMin: number
}

export interface SkillGapPriority {
  skill: SkillRow
  weight: number
  gapSeverity: number
}

export interface SkillGapResult {
  role: string
  strengths: SkillGapStrength[]
  gaps: SkillGapGap[]
  priorityFocus: SkillGapPriority[]
  suggestedNextSkill?: SkillRow
}

/**
 * Analyze skill gap: compare user proficiencies vs role skills (from Supabase).
 */
export function analyzeSkillGap(
  role: string,
  allSkills: SkillRow[],
  userSkills: Array<{ skillId: string; proficiency: number }>
): SkillGapResult {
  const bySkillId = new Map(userSkills.map((u) => [u.skillId, u.proficiency]))

  const strengths: SkillGapStrength[] = []
  const gaps: SkillGapGap[] = []
  const priorityFocus: SkillGapPriority[] = []

  for (const skill of allSkills) {
    const proficiency = bySkillId.get(skill.id) ?? 0
    const recommendedMin = MIN_PROFICIENCY_ACCEPTABLE

    if (proficiency >= MIN_PROFICIENCY_STRENGTH) {
      strengths.push({ skill, proficiency })
    } else if (proficiency < recommendedMin || !bySkillId.has(skill.id)) {
      gaps.push({
        skill,
        currentProficiency: proficiency || 0,
        recommendedMin,
      })
      const weight = Number(skill.weight) || 1
      const gapSeverity = weight * (recommendedMin - proficiency)
      priorityFocus.push({ skill, weight, gapSeverity })
    }
  }

  priorityFocus.sort((a, b) => b.gapSeverity - a.gapSeverity)

  const orderedGaps = [...allSkills].filter((s) => gaps.some((g) => g.skill.id === s.id))
  const suggestedNextSkill =
    orderedGaps.length > 0
      ? orderedGaps[0]
      : priorityFocus.length > 0
        ? priorityFocus[0].skill
        : undefined

  return {
    role,
    strengths,
    gaps,
    priorityFocus,
    suggestedNextSkill,
  }
}

/**
 * Skill gap analysis: compare user skills vs role competency.
 * Outputs: strengths, gaps, priority focus, suggested next skill.
 */

import type { RoleId, Skill, UserSkill, SkillGapResult } from '../types';
import { getSkillsForRole } from '../data/competency';

export interface SkillGapInput {
  role: RoleId;
  userSkills: Array<{ userSkill: UserSkill; skill: Skill }>;
}

const MIN_PROFICIENCY_STRENGTH = 4; // 4 or 5 = strength
const MIN_PROFICIENCY_ACCEPTABLE = 3; // below this = gap

/**
 * Analyze skill gap for a user in a given role.
 */
export function analyzeSkillGap(input: SkillGapInput): SkillGapResult {
  const { role, userSkills } = input;
  const allSkills = getSkillsForRole(role);
  const bySkillId = new Map(userSkills.map((u) => [u.skill.id, u]));

  const strengths: SkillGapResult['strengths'] = [];
  const gaps: SkillGapResult['gaps'] = [];
  const priorityFocus: SkillGapResult['priorityFocus'] = [];

  for (const skill of allSkills) {
    const entry = bySkillId.get(skill.id);
    const currentProficiency = entry?.userSkill.proficiency ?? 0;
    const recommendedMin = MIN_PROFICIENCY_ACCEPTABLE;

    if (currentProficiency >= MIN_PROFICIENCY_STRENGTH) {
      strengths.push({ skill, proficiency: currentProficiency });
    } else if (currentProficiency < recommendedMin || !entry) {
      gaps.push({
        skill,
        currentProficiency: currentProficiency || 0,
        recommendedMin,
      });
      // Gap severity: higher weight + lower proficiency = higher priority
      const gapSeverity =
        skill.weight * (recommendedMin - currentProficiency);
      priorityFocus.push({ skill, weight: skill.weight, gapSeverity });
    }
  }

  // Sort priority by severity descending
  priorityFocus.sort((a, b) => b.gapSeverity - a.gapSeverity);

  // Suggested next skill: first in roadmap order among gaps, or first by priority
  const orderedGaps = [...allSkills].filter((s) =>
    gaps.some((g) => g.skill.id === s.id)
  );
  const suggestedNextSkill =
    orderedGaps.length > 0
      ? orderedGaps[0]
      : priorityFocus.length > 0
        ? priorityFocus[0].skill
        : undefined;

  return {
    role,
    strengths,
    gaps,
    priorityFocus,
    suggestedNextSkill,
  };
}

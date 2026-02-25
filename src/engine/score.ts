/**
 * Employability Score engine.
 * Weights: Technical 40%, Projects 20%, Resume 15%, Practical 15%, Interview 10%.
 * All dimensions normalized 0–100; final = weighted sum.
 */

import type { UserSkill, Skill, UserProject, Project, ScoreBreakdown } from '../types';
import { SCORE_WEIGHTS, PROJECT_POINTS } from '../types';

export interface ScoreInput {
  userSkills: Array<{ userSkill: UserSkill; skill: Skill }>;
  userProjects: Array<{ userProject: UserProject; project: Project }>;
  resumeScore?: number;   // 0–100, default 0
  practicalScore?: number; // 0–100, default 0
  interviewScore?: number; // 0–100, default 0
}

/**
 * Technical score: (sum of proficiency × skill weight) / (total possible weight × 5).
 * Proficiency 1–5; max per skill = 5 × weight. Normalize to 0–100.
 */
function technicalScore(
  userSkills: Array<{ userSkill: UserSkill; skill: Skill }>
): number {
  if (userSkills.length === 0) return 0;
  let earned = 0;
  let maxPossible = 0;
  for (const { userSkill, skill } of userSkills) {
    earned += userSkill.proficiency * skill.weight;
    maxPossible += 5 * skill.weight;
  }
  if (maxPossible === 0) return 0;
  return Math.min(100, Math.round((earned / maxPossible) * 100));
}

/**
 * Projects score: Beginner=5, Intermediate=10, Advanced=20 pts per completed project.
 * Max possible from seed data (e.g. 5 projects per role) — we use 20+20+10+10+5 = 65 as default max, normalize to 100.
 */
function projectsScore(
  userProjects: Array<{ userProject: UserProject; project: Project }>
): number {
  const completed = userProjects.filter((u) => u.userProject.completed);
  if (completed.length === 0) return 0;
  const totalPoints = completed.reduce(
    (sum, { project }) => sum + (PROJECT_POINTS[project.difficulty] ?? 5),
    0
  );
  // Typical max per role: 5+10+20+20+20 = 75 or similar. Use 75 as cap so a few projects can reach 100.
  const maxPoints = 75;
  return Math.min(100, Math.round((totalPoints / maxPoints) * 100));
}

/**
 * Clamp and default optional scores to 0.
 */
function clampScore(v: number | undefined): number {
  if (v == null || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Calculate full Employability Score and breakdown.
 */
export function calculateScore(input: ScoreInput): ScoreBreakdown {
  const technical = technicalScore(input.userSkills);
  const projects = projectsScore(input.userProjects);
  const resume = clampScore(input.resumeScore);
  const practical = clampScore(input.practicalScore);
  const interview = clampScore(input.interviewScore);

  const final_score =
    technical * SCORE_WEIGHTS.technical +
    projects * SCORE_WEIGHTS.projects +
    resume * SCORE_WEIGHTS.resume +
    practical * SCORE_WEIGHTS.practical +
    interview * SCORE_WEIGHTS.interview;

  return {
    technical,
    projects,
    resume,
    practical,
    interview,
    final_score: Math.round(final_score * 100) / 100,
    last_calculated: new Date().toISOString(),
  };
}

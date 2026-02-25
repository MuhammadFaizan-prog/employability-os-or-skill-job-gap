/**
 * Step 3 — Employability Score (mirrors src/engine/score.ts).
 * Used for dynamic verification in the app using Supabase data.
 */

import { SCORE_WEIGHTS } from '../constants/scoreWeights'

const PROJECT_POINTS: Record<number, number> = {
  1: 5,
  2: 10,
  3: 20,
}

export interface ScoreBreakdown {
  technical: number
  projects: number
  resume: number
  practical: number
  interview: number
  final_score: number
  last_calculated: string
}

interface UserSkillRow {
  proficiency: number
  skill: { weight: number }
}

interface UserProjectRow {
  completed: boolean
  project: { difficulty: number }
}

export function calculateScore(
  userSkills: UserSkillRow[],
  userProjects: UserProjectRow[],
  resumeScore = 0,
  practicalScore = 0,
  interviewScore = 0
): ScoreBreakdown {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

  let technical = 0
  if (userSkills.length > 0) {
    let earned = 0
    let maxPossible = 0
    for (const { proficiency, skill } of userSkills) {
      earned += proficiency * skill.weight
      maxPossible += 5 * skill.weight
    }
    technical = maxPossible > 0 ? Math.min(100, Math.round((earned / maxPossible) * 100)) : 0
  }

  const completed = userProjects.filter((u) => u.completed)
  let projects = 0
  if (completed.length > 0) {
    const totalPoints = completed.reduce(
      (sum, { project }) => sum + (PROJECT_POINTS[project.difficulty] ?? 5),
      0
    )
    projects = Math.min(100, Math.round((totalPoints / 75) * 100))
  }

  const resume = clamp(resumeScore)
  const practical = clamp(practicalScore)
  const interview = clamp(interviewScore)

  const final_score =
    technical * SCORE_WEIGHTS.technical +
    projects * SCORE_WEIGHTS.projects +
    resume * SCORE_WEIGHTS.resume +
    practical * SCORE_WEIGHTS.practical +
    interview * SCORE_WEIGHTS.interview

  return {
    technical,
    projects,
    resume,
    practical,
    interview,
    final_score: Math.round(final_score * 100) / 100,
    last_calculated: new Date().toISOString(),
  }
}

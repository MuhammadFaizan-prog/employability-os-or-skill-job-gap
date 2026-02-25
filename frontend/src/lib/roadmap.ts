/**
 * Step 5 — Roadmap summary (mirrors backend generator rules).
 * Used for dynamic verification in the app with Supabase data.
 */

const PROFICIENCY_DONE = 4

export interface RoadmapSummary {
  role: string
  skillsDone: number
  skillsNext: number
  skillsUpcoming: number
  projectsDone: number
  projectsSuggested: number
  projectsLocked: number
  generatedAt: string
}

interface SkillRow {
  id: string
  name: string
  difficulty?: number
}

interface ProjectRow {
  id: string
  title: string
  required_skills?: string[]
}

interface UserSkillEntry {
  skillId: string
  proficiency: number
}

interface UserProjectEntry {
  projectId: string
  completed: boolean
}

/**
 * Compute roadmap summary from role skills and projects (e.g. from Supabase) and user progress.
 */
export function computeRoadmapSummary(
  role: string,
  skills: SkillRow[],
  projects: ProjectRow[],
  userSkills: UserSkillEntry[],
  userProjects: UserProjectEntry[]
): RoadmapSummary {
  const bySkillId = new Map(userSkills.map((u) => [u.skillId, u.proficiency]))
  const byProjectId = new Map(userProjects.map((u) => [u.projectId, u.completed]))

  const sortedSkills = [...skills].sort((a, b) => (a.difficulty ?? 99) - (b.difficulty ?? 99))
  let skillsDone = 0
  let skillsNext = 0
  let skillsUpcoming = 0
  let seenFirstIncomplete = false
  const skillProficiencyById = new Map<string, number>()

  for (const skill of sortedSkills) {
    const proficiency = bySkillId.get(skill.id) ?? 0
    skillProficiencyById.set(skill.id, proficiency)
    const isDone = proficiency >= PROFICIENCY_DONE
    if (isDone) skillsDone += 1
    else if (!seenFirstIncomplete) {
      seenFirstIncomplete = true
      skillsNext += 1
    } else skillsUpcoming += 1
  }

  let projectsDone = 0
  let projectsSuggested = 0
  let projectsLocked = 0
  for (const project of projects) {
    if (byProjectId.get(project.id)) {
      projectsDone += 1
      continue
    }
    const requiredIds = project.required_skills ?? []
    const allRequiredDone = requiredIds.every((sid) => (skillProficiencyById.get(sid) ?? 0) >= PROFICIENCY_DONE)
    if (allRequiredDone) projectsSuggested += 1
    else projectsLocked += 1
  }

  return {
    role,
    skillsDone,
    skillsNext,
    skillsUpcoming,
    projectsDone,
    projectsSuggested,
    projectsLocked,
    generatedAt: new Date().toISOString(),
  }
}

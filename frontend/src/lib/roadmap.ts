/**
 * Step 5 — Roadmap (mirrors backend generator rules).
 * Used for dynamic verification and full roadmap diagram from Supabase data.
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

/** One skill step in the roadmap (for diagram blocks). */
export interface RoadmapSkillStep {
  id: string
  name: string
  difficulty: number
  weight?: number
  status: 'done' | 'next' | 'upcoming'
  userProficiency?: number
}

/** One project step in the roadmap (for diagram blocks). */
export interface RoadmapProjectStep {
  id: string
  title: string
  difficulty: number
  evaluation_criteria?: string
  required_skills?: string[]
  status: 'done' | 'suggested' | 'locked'
}

/** Full roadmap for the diagram: ordered skills then projects. */
export interface RoadmapSteps {
  role: string
  skillSteps: RoadmapSkillStep[]
  projectSteps: RoadmapProjectStep[]
  generatedAt: string
}

interface SkillRow {
  id: string
  name: string
  difficulty?: number
  weight?: number
}

interface ProjectRow {
  id: string
  title: string
  difficulty?: number
  required_skills?: string[]
  evaluation_criteria?: string
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

/**
 * Compute full roadmap steps (for diagram): ordered skill steps + project steps with status.
 * Data from Supabase; user progress from mock or future user_skills / user_projects.
 */
export function computeRoadmapSteps(
  role: string,
  skills: SkillRow[],
  projects: ProjectRow[],
  userSkills: UserSkillEntry[],
  userProjects: UserProjectEntry[]
): RoadmapSteps {
  const bySkillId = new Map(userSkills.map((u) => [u.skillId, u.proficiency]))
  const byProjectId = new Map(userProjects.map((u) => [u.projectId, u.completed]))

  const sortedSkills = [...skills].sort((a, b) => (a.difficulty ?? 99) - (b.difficulty ?? 99))
  const skillSteps: RoadmapSkillStep[] = []
  let seenFirstIncomplete = false
  const skillProficiencyById = new Map<string, number>()

  for (const skill of sortedSkills) {
    const proficiency = bySkillId.get(skill.id) ?? 0
    skillProficiencyById.set(skill.id, proficiency)
    const isDone = proficiency >= PROFICIENCY_DONE
    let status: RoadmapSkillStep['status'] = 'upcoming'
    if (isDone) status = 'done'
    else if (!seenFirstIncomplete) {
      seenFirstIncomplete = true
      status = 'next'
    }
    skillSteps.push({
      id: skill.id,
      name: skill.name,
      difficulty: skill.difficulty ?? 1,
      weight: skill.weight,
      status,
      userProficiency: proficiency || undefined,
    })
  }

  const projectSteps: RoadmapProjectStep[] = projects.map((project) => {
    const completed = byProjectId.get(project.id)
    if (completed) {
      return {
        id: project.id,
        title: project.title,
        difficulty: project.difficulty ?? 1,
        evaluation_criteria: project.evaluation_criteria,
        required_skills: project.required_skills,
        status: 'done' as const,
      }
    }
    const requiredIds = project.required_skills ?? []
    const allRequiredDone = requiredIds.every((sid) => (skillProficiencyById.get(sid) ?? 0) >= PROFICIENCY_DONE)
    return {
      id: project.id,
      title: project.title,
      difficulty: project.difficulty ?? 1,
      evaluation_criteria: project.evaluation_criteria,
      required_skills: project.required_skills,
      status: allRequiredDone ? ('suggested' as const) : ('locked' as const),
    }
  })

  return {
    role,
    skillSteps,
    projectSteps,
    generatedAt: new Date().toISOString(),
  }
}

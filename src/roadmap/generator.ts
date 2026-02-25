/**
 * Roadmap generator (template-based, no GPT).
 * Returns ordered skills and projects with status: done / next / upcoming, suggested / locked.
 */

import type {
  RoleId,
  Skill,
  UserSkill,
  UserProject,
  Project,
  Roadmap,
  RoadmapSkillStep,
  RoadmapProjectStep,
} from '../types';
import { getSkillsForRole, getProjectsForRole } from '../data/competency';

export interface RoadmapInput {
  role: RoleId;
  userSkills: Array<{ userSkill: UserSkill; skill: Skill }>;
  userProjects: Array<{ userProject: UserProject; project: Project }>;
}

const PROFICIENCY_DONE = 4; // 4 or 5 = consider skill "done" for roadmap

function skillStatus(
  skill: Skill,
  userSkills: RoadmapInput['userSkills'],
  isFirstIncomplete: boolean
): RoadmapSkillStep['status'] {
  const entry = userSkills.find((u) => u.skill.id === skill.id);
  const proficiency = entry?.userSkill.proficiency ?? 0;
  if (proficiency >= PROFICIENCY_DONE) return 'done';
  return isFirstIncomplete ? 'next' : 'upcoming';
}

function projectStatus(
  project: Project,
  userProjects: RoadmapInput['userProjects'],
  skillSteps: RoadmapSkillStep[]
): RoadmapProjectStep['status'] {
  const up = userProjects.find((u) => u.project.id === project.id);
  if (up?.userProject.completed) return 'done';
  const requiredSkillIds = project.required_skills ?? [];
  const allRequiredDone = requiredSkillIds.every((sid) =>
    skillSteps.some(
      (s) => s.skill.id === sid && (s.userProficiency ?? 0) >= PROFICIENCY_DONE
    )
  );
  if (allRequiredDone) return 'suggested';
  return 'locked';
}

/**
 * Generate roadmap for a user in a role.
 */
export function generateRoadmap(input: RoadmapInput): Roadmap {
  const { role, userSkills, userProjects } = input;
  const skills = getSkillsForRole(role).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );
  const projects = getProjectsForRole(role);

  let seenFirstIncomplete = false;
  const skillSteps: RoadmapSkillStep[] = skills.map((skill) => {
    const entry = userSkills.find((u) => u.skill.id === skill.id);
    const proficiency = entry?.userSkill.proficiency ?? 0;
    const isDone = proficiency >= PROFICIENCY_DONE;
    const isFirstIncomplete = !isDone && !seenFirstIncomplete;
    if (!isDone) seenFirstIncomplete = true;
    const status = skillStatus(skill, userSkills, isFirstIncomplete);
    return {
      skill,
      status,
      userProficiency: entry?.userSkill.proficiency,
    };
  });

  const projectSteps: RoadmapProjectStep[] = projects.map((project) => ({
    project,
    status: projectStatus(project, userProjects, skillSteps),
  }));

  return {
    role,
    skills: skillSteps,
    projects: projectSteps,
    generatedAt: new Date().toISOString(),
  };
}

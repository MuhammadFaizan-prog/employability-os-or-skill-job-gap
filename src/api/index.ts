/**
 * Step 8 — API surface: thin layer over engine + Supabase.
 * getScore(userId?, role), getSkillGap(userId?, role), getRoadmap(userId?, role).
 * When userId is null, uses demo data from Supabase (mock user progress).
 * Can be replaced later by Supabase Edge Functions or REST API.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { RoleId, Skill, Project, UserSkill, UserProject, ScoreBreakdown, SkillGapResult, Roadmap } from '../types';
import { calculateScore } from '../engine/score';
import { analyzeSkillGap } from '../engine/skillGap';
import { generateRoadmap } from '../roadmap/generator';

type Role = RoleId | string;

function mapSkill(row: { id: string; name: string; role: string; difficulty: number; weight: number }): Skill {
  return {
    id: row.id,
    name: row.name,
    role: row.role as RoleId,
    difficulty: (row.difficulty as 1 | 2 | 3) || 1,
    weight: Number(row.weight) || 1,
  };
}

function mapProject(row: { id: string; title: string; role: string; difficulty: number; required_skills: unknown }): Project {
  const required_skills = Array.isArray(row.required_skills) ? (row.required_skills as string[]) : [];
  return {
    id: row.id,
    title: row.title,
    role: row.role as RoleId,
    difficulty: (row.difficulty as 1 | 2 | 3) || 1,
    required_skills,
  };
}

/**
 * Fetch skills and projects for role from Supabase; build demo user progress if userId is null.
 */
async function fetchDataForRole(sb: SupabaseClient, role: Role, userId: string | null) {
  const { data: skillsRows, error: se } = await sb
    .from('skills')
    .select('id, name, role, difficulty, weight')
    .eq('role', role)
    .order('difficulty');
  if (se) throw new Error('Skills: ' + se.message);
  const skills = (skillsRows ?? []).map(mapSkill);

  const { data: projectsRows, error: pe } = await sb
    .from('projects')
    .select('id, title, role, difficulty, required_skills')
    .eq('role', role);
  if (pe) throw new Error('Projects: ' + pe.message);
  const projects = (projectsRows ?? []).map(mapProject);

  let userSkills: Array<{ userSkill: UserSkill; skill: Skill }>;
  let userProjects: Array<{ userProject: UserProject; project: Project }>;

  if (userId) {
    const now = new Date().toISOString();
    const { data: usRows } = await sb.from('user_skills').select('skill_id, proficiency').eq('user_id', userId);
    const { data: upRows } = await sb.from('user_projects').select('project_id, completed').eq('user_id', userId);
    const bySkillId = new Map((usRows ?? []).map((r: { skill_id: string; proficiency: number }) => [r.skill_id, r.proficiency]));
    const byProjectId = new Map((upRows ?? []).map((r: { project_id: string; completed: boolean }) => [r.project_id, r.completed]));
    userSkills = skills
      .filter((s) => bySkillId.has(s.id))
      .map((skill) => ({
        userSkill: {
          id: 'us-' + skill.id,
          user_id: userId,
          skill_id: skill.id,
          proficiency: (bySkillId.get(skill.id) ?? 0) as 1 | 2 | 3 | 4 | 5,
          last_updated: now,
        },
        skill,
      }));
    userProjects = projects
      .filter((p) => byProjectId.has(p.id))
      .map((project) => ({
        userProject: {
          id: 'up-' + project.id,
          user_id: userId,
          project_id: project.id,
          completed: byProjectId.get(project.id) ?? false,
          last_updated: now,
        },
        project,
      }));
  } else {
    const now = new Date().toISOString();
    userSkills = skills.slice(0, 4).map((skill, i) => ({
      userSkill: {
        id: 'us-demo-' + skill.id,
        user_id: 'demo',
        skill_id: skill.id,
        proficiency: (i < 2 ? 5 : i < 3 ? 4 : 2) as 1 | 2 | 3 | 4 | 5,
        last_updated: now,
      },
      skill,
    }));
    userProjects = projects.slice(0, 1).map((project) => ({
      userProject: {
        id: 'up-demo-' + project.id,
        user_id: 'demo',
        project_id: project.id,
        completed: true,
        last_updated: now,
      },
      project,
    }));
  }

  return { skills, projects, userSkills, userProjects };
}

export interface GetScoreResult {
  breakdown: ScoreBreakdown;
}

/**
 * Get employability score for a user (or demo) and role. Data from Supabase.
 */
export async function getScore(
  supabase: SupabaseClient,
  role: Role,
  userId: string | null = null,
  resumeScore = 0,
  practicalScore = 0,
  interviewScore = 0
): Promise<GetScoreResult> {
  const { userSkills, userProjects } = await fetchDataForRole(supabase, role, userId);
  const breakdown = calculateScore({
    userSkills,
    userProjects,
    resumeScore,
    practicalScore,
    interviewScore,
  });
  return { breakdown };
}

/**
 * Get skill gap analysis for a user (or demo) and role. Data from Supabase.
 */
export async function getSkillGap(
  supabase: SupabaseClient,
  role: Role,
  userId: string | null = null
): Promise<SkillGapResult> {
  const { skills, userSkills } = await fetchDataForRole(supabase, role, userId);
  return analyzeSkillGap({
    role: role as RoleId,
    userSkills,
    allSkillsForRole: skills,
  });
}

/**
 * Get roadmap for a user (or demo) and role. Data from Supabase.
 */
export async function getRoadmap(
  supabase: SupabaseClient,
  role: Role,
  userId: string | null = null
): Promise<Roadmap> {
  const { skills, projects, userSkills, userProjects } = await fetchDataForRole(supabase, role, userId);
  return generateRoadmap({
    role: role as RoleId,
    userSkills,
    userProjects,
    allSkillsForRole: skills,
    allProjectsForRole: projects,
  });
}

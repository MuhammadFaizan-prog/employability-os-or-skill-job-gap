/**
 * Verify Step 5 (Roadmap generator) dynamically using Supabase.
 * Run from repo root: npx ts-node src/scripts/verify-step5.ts
 * Requires frontend/.env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 */

import path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { RoleId, Skill, Project, UserSkill, UserProject } from '../types';
import { generateRoadmap } from '../roadmap/generator';

const frontendEnv = path.join(process.cwd(), 'frontend', '.env');
config({ path: frontendEnv });
config();

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env');
  process.exit(1);
}

const supabase = createClient(url, anonKey);
const ROLE: RoleId = 'Frontend Developer';

function mapSkill(row: { id: string; name: string; role: string; difficulty: number; weight: number }): Skill {
  return {
    id: row.id,
    name: row.name,
    role: row.role as RoleId,
    difficulty: row.difficulty as 1 | 2 | 3,
    weight: Number(row.weight) || 1,
  };
}

function mapProject(row: { id: string; title: string; role: string; difficulty: number; required_skills: unknown }): Project {
  const required_skills = Array.isArray(row.required_skills) ? row.required_skills as string[] : [];
  return {
    id: row.id,
    title: row.title,
    role: row.role as RoleId,
    difficulty: row.difficulty as 1 | 2 | 3,
    required_skills,
  };
}

async function run() {
  let failed = false;

  console.log('\n--- Step 5 verification (Roadmap generator, Supabase) ---\n');

  const { data: skillRows, error: skillsError } = await supabase
    .from('skills')
    .select('id, name, role, difficulty, weight')
    .eq('role', ROLE)
    .order('id');

  if (skillsError) {
    console.error('Step 5 FAIL: Could not fetch skills.', skillsError.message);
    process.exit(1);
  }

  const { data: projectRows, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, role, difficulty, required_skills')
    .eq('role', ROLE)
    .order('id');

  if (projectsError) {
    console.error('Step 5 FAIL: Could not fetch projects.', projectsError.message);
    process.exit(1);
  }

  const allSkillsForRole = (skillRows ?? []).map(mapSkill);
  const allProjectsForRole = (projectRows ?? []).map(mapProject);

  if (allSkillsForRole.length === 0 || allProjectsForRole.length === 0) {
    console.error('Step 5 FAIL: Missing skills or projects for role. Run npm run seed:step2.');
    process.exit(1);
  }
  console.log('Fetched', allSkillsForRole.length, 'skills and', allProjectsForRole.length, 'projects from Supabase.');

  const now = new Date().toISOString();
  const userSkills = allSkillsForRole.slice(0, 4).map((skill, i) => ({
    userSkill: {
      id: `us-${skill.id}`,
      user_id: 'verify-user',
      skill_id: skill.id,
      proficiency: (i < 2 ? 5 : i < 3 ? 4 : 2) as 1 | 2 | 3 | 4 | 5,
      last_updated: now,
    },
    skill,
  }));

  const userProjects = allProjectsForRole.slice(0, 1).map((project) => ({
    userProject: {
      id: `up-${project.id}`,
      user_id: 'verify-user',
      project_id: project.id,
      completed: true,
      last_updated: now,
    },
    project,
  }));

  const roadmap = generateRoadmap({
    role: ROLE,
    userSkills,
    userProjects,
    allSkillsForRole,
    allProjectsForRole,
  });

  if (roadmap.role !== ROLE) {
    console.error('Step 5 FAIL: roadmap.role mismatch.');
    failed = true;
  }
  if (roadmap.skills.length !== allSkillsForRole.length) {
    console.error('Step 5 FAIL: skills length mismatch.', roadmap.skills.length, 'vs', allSkillsForRole.length);
    failed = true;
  }
  if (roadmap.projects.length !== allProjectsForRole.length) {
    console.error('Step 5 FAIL: projects length mismatch.');
    failed = true;
  }
  const doneSkills = roadmap.skills.filter((s) => s.status === 'done');
  const nextSkills = roadmap.skills.filter((s) => s.status === 'next');
  const suggestedProjects = roadmap.projects.filter((p) => p.status === 'suggested');
  const doneProjects = roadmap.projects.filter((p) => p.status === 'done');
  if (doneSkills.length === 0) {
    console.error('Step 5 FAIL: expected at least one skill done (we have proficiency 4–5 on 3 skills).');
    failed = true;
  }
  if (nextSkills.length === 0 && roadmap.skills.some((s) => (s.userProficiency ?? 0) < 4)) {
    console.error('Step 5 FAIL: expected one skill as "next".');
    failed = true;
  }

  console.log('Skills: done', doneSkills.length, '| next', nextSkills.length, '| upcoming', roadmap.skills.filter((s) => s.status === 'upcoming').length);
  console.log('Projects: done', doneProjects.length, '| suggested', suggestedProjects.length, '| locked', roadmap.projects.filter((p) => p.status === 'locked').length);
  console.log('Generated at:', roadmap.generatedAt);

  if (failed) {
    console.error('\nStep 5 verification FAILED.');
    process.exit(1);
  }
  console.log('\nStep 5 verified successfully (roadmap with Supabase data).');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

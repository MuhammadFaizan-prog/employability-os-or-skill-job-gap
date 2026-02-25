/**
 * Step 2 seed: Insert competency data (skills + projects) into Supabase skilljob.
 * Run from repo root: npm run seed:step2
 * Requires: frontend/.env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * (or SUPABASE_SERVICE_ROLE_KEY for insert if RLS restricts anon).
 * Security: Use only SUPABASE_SERVICE_ROLE_KEY (no VITE_ prefix) so the key is never in the frontend bundle.
 */

import path from 'path';
import { config } from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SKILLS_BY_ROLE,
  PROJECTS_BY_ROLE,
} from '../data/competency';
import type { RoleId } from '../types';

// Load frontend/.env and root .env. Prefer SUPABASE_SERVICE_ROLE_KEY (no VITE_ = not in frontend bundle).
const frontendEnv = path.join(process.cwd(), 'frontend', '.env');
const loaded = config({ path: frontendEnv });
if (!loaded.error) console.log('Loaded env from:', frontendEnv);
config(); // root .env if present

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const key = serviceKey ?? anonKey;

if (!url || !key) {
  console.error(
    'Missing Supabase URL or key. Set in frontend/.env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.',
    'For insert (if RLS blocks anon): add SUPABASE_SERVICE_ROLE_KEY in frontend/.env or root .env (never use VITE_ prefix).'
  );
  process.exit(1);
}

if (!serviceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set — using anon key (inserts may fail due to RLS).');
} else {
  console.log('Using service role key for inserts.');
}

const supabase: SupabaseClient = createClient(url, key, {
  auth: { persistSession: false },
});

const MVP_ROLES: RoleId[] = ['Frontend Developer', 'Backend Developer', 'Data Analyst'];

// Match README schema: id, name, role, difficulty, weight (no "order" in README; add if your DB has it)
interface SkillRow {
  name: string;
  role: string;
  difficulty: number;
  weight: number;
}

// Match README schema: title, role, difficulty, required_skills, evaluation_criteria (no description)
interface ProjectRow {
  title: string;
  role: string;
  difficulty: number;
  required_skills: string[];
  evaluation_criteria: string | null;
}

async function main() {
  // Clear existing competency data in Supabase so re-runs fix/correct the DB (single source of truth).
  console.log('Clearing existing skills/projects for MVP roles in Supabase...');
  for (const role of MVP_ROLES) {
    const { error: delProj } = await supabase.from('projects').delete().eq('role', role);
    if (delProj) {
      console.error(`Failed to delete projects for ${role}:`, delProj);
      process.exit(1);
    }
    const { error: delSkills } = await supabase.from('skills').delete().eq('role', role);
    if (delSkills) {
      console.error(`Failed to delete skills for ${role}:`, delSkills);
      process.exit(1);
    }
  }
  console.log('Cleared. Seeding skills and projects...');

  const idByOurSkillId: Record<string, string> = {};

  for (const role of MVP_ROLES) {
    const skills = SKILLS_BY_ROLE[role];
    if (!skills?.length) continue;

    for (const s of skills) {
      const { data: inserted, error } = await supabase
        .from('skills')
        .insert({ name: s.name, role: s.role, difficulty: s.difficulty, weight: s.weight })
        .select('id')
        .single();

      if (error) {
        if (error.code === '42501') {
          console.error(
            'RLS blocked insert. Add SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard → Project Settings → API → service_role). Do not commit it.'
          );
        }
        console.error(`Skills insert failed for ${role} (${s.name}):`, error);
        process.exit(1);
      }
      if (inserted?.id) idByOurSkillId[s.id] = inserted.id;
    }
    console.log(`Inserted ${skills.length} skills for ${role}.`);
  }

  for (const role of MVP_ROLES) {
    const projects = PROJECTS_BY_ROLE[role];
    if (!projects?.length) continue;

    for (const p of projects) {
      const requiredSkillIds = p.required_skills
        .map((ourId) => idByOurSkillId[ourId])
        .filter((id): id is string => Boolean(id));
      if (requiredSkillIds.length !== p.required_skills.length) {
        const missing = p.required_skills.filter((ourId) => !idByOurSkillId[ourId]);
        console.error(
          `Project ${p.id} (${p.title}): required_skills not found: ${missing.join(', ')}. Seed data integrity failed.`
        );
        process.exit(1);
      }

      const row: ProjectRow = {
        title: p.title,
        role: p.role,
        difficulty: p.difficulty,
        required_skills: requiredSkillIds,
        evaluation_criteria: p.evaluation_criteria ?? null,
      };

      const { error } = await supabase.from('projects').insert(row);
      if (error) {
        console.error(`Project insert failed: ${p.title}`, error);
        process.exit(1);
      }
    }
    console.log(`Inserted ${projects.length} projects for ${role}.`);
  }

  console.log('Step 2 seed done. Verify in app: click "Verify Step 2" on http://localhost:5173');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

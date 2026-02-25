/**
 * Dynamically verify Step 1 and Step 2 against Supabase (skilljob).
 * Run from repo root: npx ts-node src/scripts/verify-steps.ts
 * Uses same .env as frontend (anon key is enough for read).
 */

import path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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

const MVP_ROLES = ['Frontend Developer', 'Backend Developer', 'Data Analyst'];
const EXPECTED_SKILLS_PER_ROLE = 12;
const EXPECTED_PROJECTS_PER_ROLE = 5;

async function verify() {
  let failed = false;

  // ---- Step 1: connection + skills table readable ----
  console.log('\n--- Step 1 verification (Supabase connection + skills) ---');
  const { count: skillsTotal, error: skillsError } = await supabase
    .from('skills')
    .select('*', { count: 'exact', head: true });

  if (skillsError) {
    console.error('Step 1 FAIL: Could not read skills table.', skillsError.message);
    failed = true;
  } else {
    console.log(`Step 1 OK: Skills table readable. Total skills rows: ${skillsTotal ?? 'null'}`);
    if (skillsTotal == null) {
      console.warn('Step 1: count was null; consider checking RLS.');
    }
  }

  // ---- Step 2: competency data per role ----
  console.log('\n--- Step 2 verification (competency data per role) ---');
  let totalSkills = 0;
  let totalProjects = 0;

  for (const role of MVP_ROLES) {
    const { count: sc, error: se } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('role', role);
    if (se) {
      console.error(`Step 2 FAIL: Skills for ${role}:`, se.message);
      failed = true;
      continue;
    }
    const skillCount = sc ?? 0;
    totalSkills += skillCount;
    if (skillCount !== EXPECTED_SKILLS_PER_ROLE) {
      console.error(`Step 2 FAIL: ${role} has ${skillCount} skills (expected ${EXPECTED_SKILLS_PER_ROLE}).`);
      failed = true;
    } else {
      console.log(`Step 2 OK: ${role} skills: ${skillCount}`);
    }

    const { count: pc, error: pe } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('role', role);
    if (pe) {
      console.error(`Step 2 FAIL: Projects for ${role}:`, pe.message);
      failed = true;
      continue;
    }
    const projectCount = pc ?? 0;
    totalProjects += projectCount;
    if (projectCount !== EXPECTED_PROJECTS_PER_ROLE) {
      console.error(`Step 2 FAIL: ${role} has ${projectCount} projects (expected ${EXPECTED_PROJECTS_PER_ROLE}).`);
      failed = true;
    } else {
      console.log(`Step 2 OK: ${role} projects: ${projectCount}`);
    }
  }

  const expectedTotalSkills = MVP_ROLES.length * EXPECTED_SKILLS_PER_ROLE;
  const expectedTotalProjects = MVP_ROLES.length * EXPECTED_PROJECTS_PER_ROLE;
  if (totalSkills !== expectedTotalSkills || totalProjects !== expectedTotalProjects) {
    console.error(
      `Step 2 FAIL: Totals mismatch. Skills: ${totalSkills} (expected ${expectedTotalSkills}). Projects: ${totalProjects} (expected ${expectedTotalProjects}).`
    );
    failed = true;
  }

  // Sample one project to ensure required_skills is populated (data integrity)
  const { data: sampleProjects, error: sampleErr } = await supabase
    .from('projects')
    .select('title, required_skills')
    .eq('role', 'Frontend Developer')
    .limit(1);
  if (!sampleErr && sampleProjects?.length) {
    const p = sampleProjects[0];
    const arr = p?.required_skills;
    if (!Array.isArray(arr) || arr.length === 0) {
      console.error('Step 2 FAIL: At least one project has empty or invalid required_skills.');
      failed = true;
    } else {
      console.log(`Step 2 OK: Sample project "${p?.title}" has required_skills length ${arr.length}.`);
    }
  }

  console.log('\n--- Summary ---');
  if (failed) {
    console.error('Verification FAILED. Fix Supabase data (e.g. run: npm run seed:step2) and re-run this script.');
    process.exit(1);
  }
  console.log('Step 1 and Step 2 verified successfully against Supabase.');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});

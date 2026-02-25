/**
 * Verify Step 4 (Skill gap analysis) dynamically using Supabase.
 * Run from repo root: npx ts-node src/scripts/verify-step4.ts
 * Requires frontend/.env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 */

import path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { RoleId, Skill, UserSkill } from '../types';
import { analyzeSkillGap } from '../engine/skillGap';

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

function mapRowToSkill(row: { id: string; name: string; role: string; difficulty: number; weight: number }): Skill {
  return {
    id: row.id,
    name: row.name,
    role: row.role as RoleId,
    difficulty: row.difficulty as 1 | 2 | 3,
    weight: Number(row.weight) || 1,
  };
}

async function run() {
  let failed = false;

  console.log('\n--- Step 4 verification (Skill gap analysis, Supabase) ---\n');

  const { data: skillRows, error: skillsError } = await supabase
    .from('skills')
    .select('id, name, role, difficulty, weight')
    .eq('role', ROLE)
    .order('id');

  if (skillsError) {
    console.error('Step 4 FAIL: Could not fetch skills from Supabase.', skillsError.message);
    process.exit(1);
  }

  const allSkillsForRole = (skillRows ?? []).map(mapRowToSkill);
  if (allSkillsForRole.length === 0) {
    console.error('Step 4 FAIL: No skills for role', ROLE, 'in Supabase. Run npm run seed:step2.');
    process.exit(1);
  }
  console.log('Fetched', allSkillsForRole.length, 'skills for', ROLE, 'from Supabase.');

  // Mock userSkills: first 3 at proficiency 4–5 (strengths), next 2 at 1–2 (gaps), rest missing (gaps)
  const now = new Date().toISOString();
  const userSkills: Array<{ userSkill: UserSkill; skill: Skill }> = allSkillsForRole.slice(0, 5).map((skill, i) => ({
    userSkill: {
      id: `us-${skill.id}`,
      user_id: 'verify-user',
      skill_id: skill.id,
      proficiency: (i < 2 ? 5 : i < 3 ? 4 : 2) as 1 | 2 | 3 | 4 | 5,
      last_updated: now,
    },
    skill,
  }));

  const result = analyzeSkillGap({
    role: ROLE,
    userSkills,
    allSkillsForRole,
  });

  if (result.role !== ROLE) {
    console.error('Step 4 FAIL: result.role mismatch.', result.role);
    failed = true;
  }
  if (result.strengths.length === 0) {
    console.error('Step 4 FAIL: expected at least one strength (we have proficiency 4–5 on 2 skills).');
    failed = true;
  }
  if (result.gaps.length === 0) {
    console.error('Step 4 FAIL: expected gaps (we have low proficiency and missing skills).');
    failed = true;
  }
  if (result.priorityFocus.length === 0 && result.gaps.length > 0) {
    console.error('Step 4 FAIL: priorityFocus should be populated when there are gaps.');
    failed = true;
  }

  console.log('Strengths:', result.strengths.length, result.strengths.map((s) => s.skill.name).join(', ') || '—');
  console.log('Gaps:', result.gaps.length, result.gaps.slice(0, 3).map((g) => g.skill.name).join(', ') || '—');
  console.log('Priority focus (top 2):', result.priorityFocus.slice(0, 2).map((p) => p.skill.name).join(', ') || '—');
  console.log('Suggested next skill:', result.suggestedNextSkill?.name ?? '—');

  if (failed) {
    console.error('\nStep 4 verification FAILED.');
    process.exit(1);
  }
  console.log('\nStep 4 verified successfully (skill gap analysis with Supabase data).');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

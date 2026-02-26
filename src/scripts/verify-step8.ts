/**
 * Verify Step 8 (API surface) dynamically using Supabase.
 * Calls getScore, getSkillGap, getRoadmap with demo user (userId = null).
 * Run from repo root: npx ts-node src/scripts/verify-step8.ts
 */

import path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getScore, getSkillGap, getRoadmap } from '../api';

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
const ROLE = 'Frontend Developer';

async function verify() {
  console.log('\n--- Step 8 verification (API surface, Supabase) ---\n');

  const scoreResult = await getScore(supabase, ROLE, null, 50, 0, 0);
  if (!scoreResult?.breakdown || typeof scoreResult.breakdown.final_score !== 'number') {
    console.error('Step 8 FAIL: getScore returned invalid shape');
    process.exit(1);
  }
  console.log('getScore OK. Final score:', scoreResult.breakdown.final_score);

  const gapResult = await getSkillGap(supabase, ROLE, null);
  if (!gapResult?.gaps || !Array.isArray(gapResult.strengths)) {
    console.error('Step 8 FAIL: getSkillGap returned invalid shape');
    process.exit(1);
  }
  console.log('getSkillGap OK. Strengths:', gapResult.strengths.length, 'Gaps:', gapResult.gaps.length);

  const roadmapResult = await getRoadmap(supabase, ROLE, null);
  if (!roadmapResult?.skills || !Array.isArray(roadmapResult.projects)) {
    console.error('Step 8 FAIL: getRoadmap returned invalid shape');
    process.exit(1);
  }
  console.log('getRoadmap OK. Skills:', roadmapResult.skills.length, 'Projects:', roadmapResult.projects.length);

  console.log('\nStep 8 verified successfully (API surface: getScore, getSkillGap, getRoadmap).');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});

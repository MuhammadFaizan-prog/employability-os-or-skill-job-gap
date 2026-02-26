/**
 * Verify Step 7 (Interview question bank) dynamically using Supabase.
 * Run from repo root: npx ts-node src/scripts/verify-step7.ts
 * Requires: run supabase/interview-questions.sql in SQL Editor first.
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

async function verify() {
  console.log('\n--- Step 7 verification (Interview questions, Supabase) ---\n');

  const role = 'Frontend Developer';
  const { data: questions, error } = await supabase
    .from('interview_questions')
    .select('id, question_text, role, difficulty_level')
    .eq('role', role)
    .order('difficulty_level');

  if (error) {
    console.error('Step 7 FAIL: Could not read interview_questions.', error.message);
    console.error('Run supabase/interview-questions.sql in Supabase SQL Editor, then retry.');
    process.exit(1);
  }

  if (!questions || questions.length === 0) {
    console.error('Step 7 FAIL: No questions for', role, '- run supabase/interview-questions.sql');
    process.exit(1);
  }

  for (const q of questions) {
    if (!q.question_text || !q.role || q.difficulty_level == null) {
      console.error('Step 7 FAIL: Invalid question row:', q);
      process.exit(1);
    }
  }

  console.log('interview_questions table OK.');
  console.log('Frontend Developer questions:', questions.length);
  console.log('Sample:', questions[0]?.question_text?.slice(0, 50) + '...');

  const { count } = await supabase.from('interview_questions').select('*', { count: 'exact', head: true });
  console.log('Total questions (all roles):', count ?? 0);

  console.log('\nStep 7 verified successfully (interview question bank from Supabase).');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});

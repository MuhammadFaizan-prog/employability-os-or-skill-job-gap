/**
 * Verify Step 6 (Resume upload) dynamically using Supabase.
 * Checks: resume_uploads table exists and is readable; documents storage bucket exists.
 * Run from repo root: npx ts-node src/scripts/verify-step6-resume.ts
 * Requires: run supabase/resume-storage.sql in Supabase SQL Editor first.
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
  console.log('\n--- Step 6 (Resume) verification (Supabase table + storage) ---\n');

  const { count, error: tableErr } = await supabase
    .from('resume_uploads')
    .select('*', { count: 'exact', head: true });

  if (tableErr) {
    console.error('Step 6 FAIL: resume_uploads table missing or not readable.', tableErr.message);
    console.error('Run supabase/resume-storage.sql in Supabase SQL Editor, then retry.');
    process.exit(1);
  }
  console.log('resume_uploads table OK. Rows:', count ?? 0);

  const { data: list, error: storageErr } = await supabase.storage
    .from('documents')
    .list('resumes', { limit: 1 });

  if (storageErr) {
    console.error('Step 6 FAIL: documents bucket missing or not readable.', storageErr.message);
    console.error('Run supabase/resume-storage.sql in Supabase SQL Editor (creates bucket + policies), then retry.');
    process.exit(1);
  }
  console.log('documents bucket OK (resumes folder listable).');

  console.log('\nStep 6 verified successfully (resume storage + DB).');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});

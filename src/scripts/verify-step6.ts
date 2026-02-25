/**
 * Verify Step 6 (Resume analyzer stub) dynamically.
 * Run from repo root: npx ts-node src/scripts/verify-step6.ts
 * Asserts interface analyzeResume(fileOrText) → { score, suggestions }.
 */

import { analyzeResume, type ResumeAnalysisResult } from '../engine/resumeAnalyzer';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error('Step 6 FAIL:', message);
    process.exit(1);
  }
}

function run() {
  console.log('\n--- Step 6 verification (Resume analyzer stub) ---\n');

  const r1 = analyzeResume(null);
  assert(typeof r1.score === 'number', 'result.score is number');
  assert(r1.score >= 0 && r1.score <= 100, 'result.score in 0–100');
  assert(Array.isArray(r1.suggestions), 'result.suggestions is array');
  assert(r1.suggestions.every((s) => typeof s === 'string'), 'every suggestion is string');
  console.log('analyzeResume(null):', { score: r1.score, suggestionsCount: r1.suggestions.length });

  const r2 = analyzeResume('Some resume text');
  assert(typeof r2.score === 'number' && r2.score >= 0 && r2.score <= 100, 'text input: score 0–100');
  assert(Array.isArray(r2.suggestions) && r2.suggestions.length > 0, 'text input: non-empty suggestions');
  console.log('analyzeResume("text"):', { score: r2.score, suggestionsCount: r2.suggestions.length });

  console.log('\nStep 6 verified successfully (resume analyzer stub interface).');
}

run();

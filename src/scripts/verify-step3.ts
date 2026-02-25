/**
 * Verify Step 3 (Employability Score engine) dynamically.
 * Run from repo root: npx ts-node src/scripts/verify-step3.ts
 */

import { calculateScore } from '../engine/score';
import type { UserSkill, Skill, UserProject, Project } from '../types';
import { PROJECT_POINTS } from '../types';

// Sample: one skill proficiency 4, weight 1.5 → earned 4*1.5=6, max 5*1.5=7.5 → technical = 80
const sampleSkill: Skill = {
  id: 'fe-html',
  name: 'HTML5',
  role: 'Frontend Developer',
  difficulty: 1,
  weight: 1.5,
  order: 1,
};
const sampleUserSkill: UserSkill = {
  id: 'us-1',
  user_id: 'u1',
  skill_id: sampleSkill.id,
  proficiency: 4,
  last_updated: new Date().toISOString(),
};

// One completed project difficulty 2 → 10 pts; max 75 → projects = 13.33 → round 13
const sampleProject: Project = {
  id: 'fe-p1',
  title: 'Todo App',
  role: 'Frontend Developer',
  difficulty: 2,
  required_skills: [],
};
const sampleUserProject: UserProject = {
  id: 'up-1',
  user_id: 'u1',
  project_id: sampleProject.id,
  completed: true,
  last_updated: new Date().toISOString(),
};

function run() {
  let failed = false;

  // Test 1: input object form
  const out = calculateScore({
    userSkills: [{ userSkill: sampleUserSkill, skill: sampleSkill }],
    userProjects: [{ userProject: sampleUserProject, project: sampleProject }],
    resumeScore: 0,
    practicalScore: 0,
    interviewScore: 0,
  });

  if (out.technical < 0 || out.technical > 100) {
    console.error('Step 3 FAIL: technical score out of range:', out.technical);
    failed = true;
  }
  if (out.projects < 0 || out.projects > 100) {
    console.error('Step 3 FAIL: projects score out of range:', out.projects);
    failed = true;
  }
  if (out.final_score < 0 || out.final_score > 100) {
    console.error('Step 3 FAIL: final_score out of range:', out.final_score);
    failed = true;
  }
  const expectedTechnical = Math.round((4 * 1.5) / (5 * 1.5) * 100); // 80
  if (out.technical !== expectedTechnical) {
    console.error(`Step 3 FAIL: expected technical ${expectedTechnical}, got ${out.technical}`);
    failed = true;
  }
  const expectedProjects = Math.round((PROJECT_POINTS[2] / 75) * 100); // 13
  if (out.projects !== expectedProjects) {
    console.error(`Step 3 FAIL: expected projects ${expectedProjects}, got ${out.projects}`);
    failed = true;
  }

  // Test 2: spec signature (user, userSkills, userProjects, ...)
  const out2 = calculateScore(
    null,
    [{ userSkill: sampleUserSkill, skill: sampleSkill }],
    [{ userProject: sampleUserProject, project: sampleProject }],
    50,
    50,
    50
  );
  if (out2.resume !== 50 || out2.practical !== 50 || out2.interview !== 50) {
    console.error('Step 3 FAIL: placeholder scores not applied:', out2);
    failed = true;
  }

  console.log('\n--- Step 3 verification (Employability Score engine) ---');
  console.log('Sample breakdown:', JSON.stringify(out, null, 2));
  console.log('Spec-signature test (with placeholders 50,50,50):', out2.final_score.toFixed(2));

  if (failed) {
    console.error('\nStep 3 verification FAILED.');
    process.exit(1);
  }
  console.log('\nStep 3 verified successfully.');
}

run();

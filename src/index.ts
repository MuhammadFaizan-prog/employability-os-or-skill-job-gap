/**
 * EmployabilityOS — entry / demo.
 * Runs core logic (score, skill gap, roadmap) with mock data. No UI.
 */

import { getSkillsForRole, getProjectsForRole } from './data/competency';
import { getQuestionsForRole } from './data/interviewQuestions';
import { calculateScore } from './engine/score';
import { analyzeSkillGap } from './engine/skillGap';
import { analyzeResume } from './engine/resumeAnalyzer';
import { generateRoadmap } from './roadmap/generator';

const ROLE = 'Frontend Developer' as const;

// Mock user skills: some filled, some gaps
function mockUserSkills() {
  const skills = getSkillsForRole(ROLE);
  const now = new Date().toISOString();
  return skills.slice(0, 6).map((skill, i) => ({
    userSkill: {
      id: `us-${skill.id}`,
      user_id: 'user-1',
      skill_id: skill.id,
      proficiency: (i % 3 === 0 ? 5 : i % 3 === 1 ? 4 : 2) as 1 | 2 | 3 | 4 | 5,
      last_updated: now,
    },
    skill,
  }));
}

function mockUserProjects() {
  const projects = getProjectsForRole(ROLE);
  const now = new Date().toISOString();
  return projects.slice(0, 2).map((project, i) => ({
    userProject: {
      id: `up-${project.id}`,
      user_id: 'user-1',
      project_id: project.id,
      completed: i === 0,
      last_updated: now,
    },
    project,
  }));
}

function runDemo() {
  console.log('--- EmployabilityOS Demo (no UI) ---\n');
  console.log('Role:', ROLE);

  const userSkills = mockUserSkills();
  const userProjects = mockUserProjects();

  const scoreInput = {
    userSkills,
    userProjects,
    resumeScore: 50,
    practicalScore: 0,
    interviewScore: 0,
  };

  const score = calculateScore(scoreInput);
  console.log('\n--- Employability Score ---');
  console.log('Technical:', score.technical, '| Projects:', score.projects);
  console.log('Resume:', score.resume, '| Practical:', score.practical, '| Interview:', score.interview);
  console.log('Final Score:', score.final_score);

  const skillGap = analyzeSkillGap({ role: ROLE, userSkills });
  console.log('\n--- Skill Gap ---');
  console.log('Strengths:', skillGap.strengths.length);
  console.log('Gaps:', skillGap.gaps.length);
  console.log('Suggested next skill:', skillGap.suggestedNextSkill?.name ?? '—');

  const roadmap = generateRoadmap({
    role: ROLE,
    userSkills,
    userProjects,
  });
  console.log('\n--- Roadmap ---');
  console.log('Skills:', roadmap.skills.map((s) => `${s.skill.name} (${s.status})`).join(', '));
  console.log('Projects:', roadmap.projects.map((p) => `${p.project.title} (${p.status})`).join(', '));

  const resume = analyzeResume(null);
  console.log('\n--- Resume (stub) ---');
  console.log('Score:', resume.score, '| Suggestions:', resume.suggestions.length);

  const questions = getQuestionsForRole(ROLE);
  console.log('\n--- Interview questions (role) ---');
  console.log('Count:', questions.length);
}

runDemo();

// Export for use as library or from API layer
export {
  calculateScore,
  analyzeSkillGap,
  generateRoadmap,
  analyzeResume,
  getSkillsForRole,
  getProjectsForRole,
  getQuestionsForRole,
};

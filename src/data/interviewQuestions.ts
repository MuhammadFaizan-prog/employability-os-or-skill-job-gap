/**
 * Interview question bank — seed data per role.
 * Used for Interview Prep and (later) interview readiness score.
 */

import type { RoleId, InterviewQuestion } from '../types';

const questions: Omit<InterviewQuestion, 'role'>[] = [
  // Frontend
  {
    id: 'fe-q1',
    question_text: 'Explain the difference between let, const, and var in JavaScript.',
    difficulty_level: 1,
    category: 'technical',
  },
  {
    id: 'fe-q2',
    question_text: 'How does React virtual DOM improve performance?',
    difficulty_level: 2,
    category: 'technical',
  },
  {
    id: 'fe-q3',
    question_text: 'Describe a time you had to debug a complex frontend issue.',
    difficulty_level: 2,
    category: 'behavioral',
  },
  {
    id: 'fe-q4',
    question_text: 'How would you optimize a slow-loading SPA?',
    difficulty_level: 3,
    category: 'technical',
  },
  // Backend
  {
    id: 'be-q1',
    question_text: 'What is the difference between REST and GraphQL?',
    difficulty_level: 1,
    category: 'technical',
  },
  {
    id: 'be-q2',
    question_text: 'How do you secure an API (auth, validation, rate limiting)?',
    difficulty_level: 2,
    category: 'technical',
  },
  {
    id: 'be-q3',
    question_text: 'Describe how you would design a rate limiter.',
    difficulty_level: 3,
    category: 'practical',
  },
  // Data Analyst
  {
    id: 'da-q1',
    question_text: 'Explain the difference between INNER JOIN and LEFT JOIN.',
    difficulty_level: 1,
    category: 'technical',
  },
  {
    id: 'da-q2',
    question_text: 'How do you handle missing or duplicate data in a dataset?',
    difficulty_level: 2,
    category: 'technical',
  },
  {
    id: 'da-q3',
    question_text: 'Tell me about a time you presented data insights to non-technical stakeholders.',
    difficulty_level: 2,
    category: 'behavioral',
  },
];

const roleMap: Record<string, RoleId> = {
  'fe-q1': 'Frontend Developer',
  'fe-q2': 'Frontend Developer',
  'fe-q3': 'Frontend Developer',
  'fe-q4': 'Frontend Developer',
  'be-q1': 'Backend Developer',
  'be-q2': 'Backend Developer',
  'be-q3': 'Backend Developer',
  'da-q1': 'Data Analyst',
  'da-q2': 'Data Analyst',
  'da-q3': 'Data Analyst',
};

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = questions.map(
  (q) =>
    ({
      ...q,
      role: roleMap[q.id] ?? 'Frontend Developer',
    }) as InterviewQuestion
);

export function getQuestionsForRole(
  role: RoleId,
  difficulty?: 1 | 2 | 3
): InterviewQuestion[] {
  let list = INTERVIEW_QUESTIONS.filter((q) => q.role === role);
  if (difficulty != null) {
    list = list.filter((q) => q.difficulty_level === difficulty);
  }
  return list;
}

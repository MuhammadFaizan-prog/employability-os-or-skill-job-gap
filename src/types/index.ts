/**
 * EmployabilityOS — shared types (aligned with README schema).
 * No UI; backend/logic only.
 */

export type RoleId =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Data Analyst'
  | 'AI/ML Engineer'
  | 'Mobile Developer';

export interface User {
  id: string;
  name: string;
  email: string;
  role_selected: RoleId;
  subscription_type: 'free' | 'premium';
  created_at: string; // ISO
}

export interface Skill {
  id: string;
  name: string;
  role: RoleId;
  difficulty: 1 | 2 | 3; // 1=beginner, 2=intermediate, 3=advanced
  weight: number; // for scoring
  order?: number; // for roadmap ordering
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: 1 | 2 | 3 | 4 | 5; // 1=novice .. 5=expert
  last_updated: string;
}

export interface Project {
  id: string;
  title: string;
  role: RoleId;
  difficulty: 1 | 2 | 3;
  required_skills: string[]; // skill IDs
  evaluation_criteria?: string;
  description?: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  project_id: string;
  completed: boolean;
  last_updated: string;
}

/** Score dimensions (README weights). */
export const SCORE_WEIGHTS = {
  technical: 0.4,
  projects: 0.2,
  resume: 0.15,
  practical: 0.15,
  interview: 0.1,
} as const;

export interface ScoreBreakdown {
  technical: number;
  projects: number;
  resume: number;
  practical: number;
  interview: number;
  final_score: number;
  last_calculated: string;
}

export interface ScoreRecord extends ScoreBreakdown {
  id: string;
  user_id: string;
}

/** Project points by difficulty (README). */
export const PROJECT_POINTS = {
  1: 5,   // beginner
  2: 10,  // intermediate
  3: 20,  // advanced
} as const;

export interface SkillGapResult {
  role: RoleId;
  strengths: Array<{ skill: Skill; proficiency: number }>;
  gaps: Array<{ skill: Skill; currentProficiency: number; recommendedMin: number }>;
  priorityFocus: Array<{ skill: Skill; weight: number; gapSeverity: number }>;
  suggestedNextSkill?: Skill;
}

export interface RoadmapSkillStep {
  skill: Skill;
  status: 'done' | 'next' | 'upcoming';
  userProficiency?: number;
}

export interface RoadmapProjectStep {
  project: Project;
  status: 'done' | 'suggested' | 'locked';
}

export interface Roadmap {
  role: RoleId;
  skills: RoadmapSkillStep[];
  projects: RoadmapProjectStep[];
  generatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  question_text: string;
  role: RoleId;
  difficulty_level: 1 | 2 | 3;
  category?: 'technical' | 'behavioral' | 'practical';
}

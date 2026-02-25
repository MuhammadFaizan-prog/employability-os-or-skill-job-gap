/**
 * Competency frameworks: roles, skills, and projects per role.
 * MVP: Frontend Developer, Backend Developer, Data Analyst.
 */

import type { RoleId, Skill, Project } from '../types';

export const ROLES: RoleId[] = [
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'Mobile Developer',
];

const frontendSkills: Omit<Skill, 'role'>[] = [
  { id: 'fe-html', name: 'HTML5', difficulty: 1, weight: 1.2, order: 1 },
  { id: 'fe-css', name: 'CSS3', difficulty: 1, weight: 1.2, order: 2 },
  { id: 'fe-js', name: 'JavaScript (ES6+)', difficulty: 1, weight: 1.5, order: 3 },
  { id: 'fe-react', name: 'React', difficulty: 2, weight: 1.8, order: 4 },
  { id: 'fe-state', name: 'State Management (Redux/Zustand)', difficulty: 2, weight: 1.3, order: 5 },
  { id: 'fe-ts', name: 'TypeScript', difficulty: 2, weight: 1.4, order: 6 },
  { id: 'fe-responsive', name: 'Responsive Design', difficulty: 1, weight: 1.1, order: 7 },
  { id: 'fe-git', name: 'Git / Version Control', difficulty: 1, weight: 1.0, order: 8 },
  { id: 'fe-testing', name: 'Testing (Jest, React Testing Library)', difficulty: 2, weight: 1.2, order: 9 },
  { id: 'fe-build', name: 'Build Tools (Vite, Webpack)', difficulty: 2, weight: 1.0, order: 10 },
  { id: 'fe-api', name: 'REST APIs / Fetch', difficulty: 1, weight: 1.2, order: 11 },
  { id: 'fe-a11y', name: 'Accessibility (a11y)', difficulty: 2, weight: 0.9, order: 12 },
];

const backendSkills: Omit<Skill, 'role'>[] = [
  { id: 'be-node', name: 'Node.js', difficulty: 1, weight: 1.5, order: 1 },
  { id: 'be-js', name: 'JavaScript / TypeScript', difficulty: 1, weight: 1.3, order: 2 },
  { id: 'be-sql', name: 'SQL & Databases', difficulty: 1, weight: 1.4, order: 3 },
  { id: 'be-api', name: 'REST API Design', difficulty: 2, weight: 1.5, order: 4 },
  { id: 'be-auth', name: 'Authentication (JWT, OAuth)', difficulty: 2, weight: 1.3, order: 5 },
  { id: 'be-orm', name: 'ORM (e.g. Prisma, TypeORM)', difficulty: 2, weight: 1.1, order: 6 },
  { id: 'be-cache', name: 'Caching (Redis)', difficulty: 2, weight: 1.0, order: 7 },
  { id: 'be-testing', name: 'API Testing', difficulty: 2, weight: 1.0, order: 8 },
  { id: 'be-docker', name: 'Docker / Containers', difficulty: 2, weight: 1.1, order: 9 },
  { id: 'be-git', name: 'Git', difficulty: 1, weight: 1.0, order: 10 },
  { id: 'be-security', name: 'Security Basics', difficulty: 3, weight: 1.2, order: 11 },
  { id: 'be-message', name: 'Message Queues / Async', difficulty: 3, weight: 0.9, order: 12 },
];

const dataAnalystSkills: Omit<Skill, 'role'>[] = [
  { id: 'da-sql', name: 'SQL', difficulty: 1, weight: 1.5, order: 1 },
  { id: 'da-excel', name: 'Excel / Spreadsheets', difficulty: 1, weight: 1.2, order: 2 },
  { id: 'da-python', name: 'Python', difficulty: 1, weight: 1.4, order: 3 },
  { id: 'da-pandas', name: 'Pandas / DataFrames', difficulty: 2, weight: 1.5, order: 4 },
  { id: 'da-viz', name: 'Data Visualization (Matplotlib, Seaborn)', difficulty: 2, weight: 1.3, order: 5 },
  { id: 'da-stats', name: 'Statistics', difficulty: 2, weight: 1.3, order: 6 },
  { id: 'da-bi', name: 'BI Tools (Tableau, Power BI)', difficulty: 2, weight: 1.2, order: 7 },
  { id: 'da-cleaning', name: 'Data Cleaning & ETL', difficulty: 2, weight: 1.4, order: 8 },
  { id: 'da-dashboards', name: 'Dashboards & Reporting', difficulty: 2, weight: 1.2, order: 9 },
  { id: 'da-git', name: 'Git', difficulty: 1, weight: 0.8, order: 10 },
  { id: 'da-storytelling', name: 'Data Storytelling', difficulty: 2, weight: 1.0, order: 11 },
  { id: 'da-ml-intro', name: 'Intro to ML (optional)', difficulty: 3, weight: 0.9, order: 12 },
];

function withRole<T extends Omit<Skill, 'role'>>(role: RoleId, items: T[]): Skill[] {
  return items.map((s) => ({ ...s, role }));
}

export const SKILLS_BY_ROLE: Record<RoleId, Skill[]> = {
  'Frontend Developer': withRole('Frontend Developer', frontendSkills),
  'Backend Developer': withRole('Backend Developer', backendSkills),
  'Data Analyst': withRole('Data Analyst', dataAnalystSkills),
  'AI/ML Engineer': [], // placeholder for Phase 2
  'Mobile Developer': [], // placeholder for Phase 2
};

// ---- Projects ----

const frontendProjects: Omit<Project, 'role'>[] = [
  {
    id: 'fe-p1',
    title: 'Personal Portfolio Site',
    difficulty: 1,
    required_skills: ['fe-html', 'fe-css', 'fe-js'],
    description: 'Responsive portfolio with sections: About, Projects, Contact.',
    evaluation_criteria: 'Clean layout, mobile-friendly, semantic HTML.',
  },
  {
    id: 'fe-p2',
    title: 'Todo App (React)',
    difficulty: 1,
    required_skills: ['fe-react', 'fe-js'],
    description: 'CRUD todo list with filters and local storage.',
    evaluation_criteria: 'Component structure, state management, persistence.',
  },
  {
    id: 'fe-p3',
    title: 'Weather Dashboard',
    difficulty: 2,
    required_skills: ['fe-react', 'fe-api', 'fe-ts'],
    description: 'Fetch weather API, show forecast, search by city.',
    evaluation_criteria: 'API integration, error handling, TypeScript types.',
  },
  {
    id: 'fe-p4',
    title: 'E-commerce Product Listing',
    difficulty: 2,
    required_skills: ['fe-react', 'fe-state', 'fe-responsive'],
    description: 'Product grid, filters, cart state, responsive design.',
    evaluation_criteria: 'State management, filter logic, responsive layout.',
  },
  {
    id: 'fe-p5',
    title: 'Full-stack Capstone (Frontend)',
    difficulty: 3,
    required_skills: ['fe-react', 'fe-ts', 'fe-testing', 'fe-build'],
    description: 'Multi-page app with auth flow, tests, and production build.',
    evaluation_criteria: 'Testing coverage, build config, code quality.',
  },
];

const backendProjects: Omit<Project, 'role'>[] = [
  {
    id: 'be-p1',
    title: 'REST API (CRUD)',
    difficulty: 1,
    required_skills: ['be-node', 'be-api', 'be-sql'],
    description: 'Simple CRUD API for a resource (e.g. tasks).',
    evaluation_criteria: 'REST conventions, status codes, DB persistence.',
  },
  {
    id: 'be-p2',
    title: 'Auth API (JWT)',
    difficulty: 2,
    required_skills: ['be-auth', 'be-node'],
    description: 'Register, login, protected routes with JWT.',
    evaluation_criteria: 'Secure auth flow, token refresh, validation.',
  },
  {
    id: 'be-p3',
    title: 'Blog API with Comments',
    difficulty: 2,
    required_skills: ['be-api', 'be-orm', 'be-sql'],
    description: 'Posts and comments, pagination, relations.',
    evaluation_criteria: 'Relations, pagination, clean schema.',
  },
  {
    id: 'be-p4',
    title: 'Caching Layer (Redis)',
    difficulty: 2,
    required_skills: ['be-cache', 'be-node'],
    description: 'Add Redis cache to an existing API.',
    evaluation_criteria: 'Cache invalidation, TTL, performance.',
  },
  {
    id: 'be-p5',
    title: 'Microservice / Message Queue',
    difficulty: 3,
    required_skills: ['be-message', 'be-docker'],
    description: 'Small service that consumes from a queue.',
    evaluation_criteria: 'Async processing, error handling, deployment.',
  },
];

const dataAnalystProjects: Omit<Project, 'role'>[] = [
  {
    id: 'da-p1',
    title: 'SQL Queries for Business Metrics',
    difficulty: 1,
    required_skills: ['da-sql', 'da-excel'],
    description: 'Write queries for revenue, retention, conversion.',
    evaluation_criteria: 'Correct aggregations, filters, joins.',
  },
  {
    id: 'da-p2',
    title: 'Exploratory Data Analysis (Python)',
    difficulty: 2,
    required_skills: ['da-python', 'da-pandas', 'da-viz'],
    description: 'Load dataset, clean, visualize distributions.',
    evaluation_criteria: 'Cleaning steps, visualizations, summary stats.',
  },
  {
    id: 'da-p3',
    title: 'Dashboard (Tableau / Power BI)',
    difficulty: 2,
    required_skills: ['da-bi', 'da-dashboards'],
    description: 'Build a dashboard with filters and KPIs.',
    evaluation_criteria: 'Clarity, filters, key metrics.',
  },
  {
    id: 'da-p4',
    title: 'ETL Pipeline',
    difficulty: 2,
    required_skills: ['da-cleaning', 'da-pandas'],
    description: 'Script to extract, transform, load data.',
    evaluation_criteria: 'Reproducibility, error handling, documentation.',
  },
  {
    id: 'da-p5',
    title: 'End-to-end Analysis Report',
    difficulty: 3,
    required_skills: ['da-sql', 'da-pandas', 'da-viz', 'da-storytelling'],
    description: 'Full analysis: question, data, viz, recommendations.',
    evaluation_criteria: 'Story, visuals, actionable insights.',
  },
];

function projectsWithRole(role: RoleId, items: Omit<Project, 'role'>[]): Project[] {
  return items.map((p) => ({ ...p, role }));
}

export const PROJECTS_BY_ROLE: Record<RoleId, Project[]> = {
  'Frontend Developer': projectsWithRole('Frontend Developer', frontendProjects),
  'Backend Developer': projectsWithRole('Backend Developer', backendProjects),
  'Data Analyst': projectsWithRole('Data Analyst', dataAnalystProjects),
  'AI/ML Engineer': [],
  'Mobile Developer': [],
};

export function getSkillsForRole(role: RoleId): Skill[] {
  return SKILLS_BY_ROLE[role] ?? [];
}

export function getProjectsForRole(role: RoleId): Project[] {
  return PROJECTS_BY_ROLE[role] ?? [];
}

export function getSkillById(skillId: string, role: RoleId): Skill | undefined {
  return getSkillsForRole(role).find((s) => s.id === skillId);
}

export function getProjectById(projectId: string, role: RoleId): Project | undefined {
  return getProjectsForRole(role).find((p) => p.id === projectId);
}

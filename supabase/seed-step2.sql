-- Step 2 seed: competency data for skilljob (run in Supabase SQL Editor if RLS blocks Node script).
-- Run once. Deletes existing skills/projects for the three MVP roles then inserts fresh data.
-- Uses a temporary column seed_code for deterministic skill→project mapping (dropped at end).

-- Delete in correct order (projects reference skills)
DELETE FROM projects WHERE role IN ('Frontend Developer', 'Backend Developer', 'Data Analyst');
DELETE FROM skills WHERE role IN ('Frontend Developer', 'Backend Developer', 'Data Analyst');

-- Temporary column for deterministic mapping (same codes as src/data/competency.ts). Dropped at end.
ALTER TABLE skills ADD COLUMN IF NOT EXISTS seed_code TEXT;

INSERT INTO skills (name, role, difficulty, weight, seed_code)
VALUES
  ('HTML5', 'Frontend Developer', 1, 1.2, 'fe-html'),
  ('CSS3', 'Frontend Developer', 1, 1.2, 'fe-css'),
  ('JavaScript (ES6+)', 'Frontend Developer', 1, 1.5, 'fe-js'),
  ('React', 'Frontend Developer', 2, 1.8, 'fe-react'),
  ('State Management (Redux/Zustand)', 'Frontend Developer', 2, 1.3, 'fe-state'),
  ('TypeScript', 'Frontend Developer', 2, 1.4, 'fe-ts'),
  ('Responsive Design', 'Frontend Developer', 1, 1.1, 'fe-responsive'),
  ('Git / Version Control', 'Frontend Developer', 1, 1.0, 'fe-git'),
  ('Testing (Jest, React Testing Library)', 'Frontend Developer', 2, 1.2, 'fe-testing'),
  ('Build Tools (Vite, Webpack)', 'Frontend Developer', 2, 1.0, 'fe-build'),
  ('REST APIs / Fetch', 'Frontend Developer', 1, 1.2, 'fe-api'),
  ('Accessibility (a11y)', 'Frontend Developer', 2, 0.9, 'fe-a11y'),
  ('Node.js', 'Backend Developer', 1, 1.5, 'be-node'),
  ('JavaScript / TypeScript', 'Backend Developer', 1, 1.3, 'be-js'),
  ('SQL & Databases', 'Backend Developer', 1, 1.4, 'be-sql'),
  ('REST API Design', 'Backend Developer', 2, 1.5, 'be-api'),
  ('Authentication (JWT, OAuth)', 'Backend Developer', 2, 1.3, 'be-auth'),
  ('ORM (e.g. Prisma, TypeORM)', 'Backend Developer', 2, 1.1, 'be-orm'),
  ('Caching (Redis)', 'Backend Developer', 2, 1.0, 'be-cache'),
  ('API Testing', 'Backend Developer', 2, 1.0, 'be-testing'),
  ('Docker / Containers', 'Backend Developer', 2, 1.1, 'be-docker'),
  ('Git', 'Backend Developer', 1, 1.0, 'be-git'),
  ('Security Basics', 'Backend Developer', 3, 1.2, 'be-security'),
  ('Message Queues / Async', 'Backend Developer', 3, 0.9, 'be-message'),
  ('SQL', 'Data Analyst', 1, 1.5, 'da-sql'),
  ('Excel / Spreadsheets', 'Data Analyst', 1, 1.2, 'da-excel'),
  ('Python', 'Data Analyst', 1, 1.4, 'da-python'),
  ('Pandas / DataFrames', 'Data Analyst', 2, 1.5, 'da-pandas'),
  ('Data Visualization (Matplotlib, Seaborn)', 'Data Analyst', 2, 1.3, 'da-viz'),
  ('Statistics', 'Data Analyst', 2, 1.3, 'da-stats'),
  ('BI Tools (Tableau, Power BI)', 'Data Analyst', 2, 1.2, 'da-bi'),
  ('Data Cleaning & ETL', 'Data Analyst', 2, 1.4, 'da-cleaning'),
  ('Dashboards & Reporting', 'Data Analyst', 2, 1.2, 'da-dashboards'),
  ('Git', 'Data Analyst', 1, 0.8, 'da-git'),
  ('Data Storytelling', 'Data Analyst', 2, 1.0, 'da-storytelling'),
  ('Intro to ML (optional)', 'Data Analyst', 3, 0.9, 'da-ml-intro');

-- Projects: required_skills by seed_code (matches competency.ts). da-excel is required for "SQL Queries for Business Metrics".
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Personal Portfolio Site', 'Frontend Developer', 1,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['fe-html','fe-css','fe-js'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['fe-html','fe-css','fe-js'])),
  'Clean layout, mobile-friendly, semantic HTML.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Todo App (React)', 'Frontend Developer', 1,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['fe-js','fe-react'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['fe-react','fe-js'])),
  'Component structure, state management, persistence.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Weather Dashboard', 'Frontend Developer', 2,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['fe-react','fe-api','fe-ts'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['fe-react','fe-api','fe-ts'])),
  'API integration, error handling, TypeScript types.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'E-commerce Product Listing', 'Frontend Developer', 2,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['fe-react','fe-state','fe-responsive'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['fe-react','fe-state','fe-responsive'])),
  'State management, filter logic, responsive layout.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Full-stack Capstone (Frontend)', 'Frontend Developer', 3,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['fe-react','fe-ts','fe-testing','fe-build'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['fe-react','fe-ts','fe-testing','fe-build'])),
  'Testing coverage, build config, code quality.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'REST API (CRUD)', 'Backend Developer', 1,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['be-node','be-api','be-sql'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['be-node','be-api','be-sql'])),
  'REST conventions, status codes, DB persistence.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Auth API (JWT)', 'Backend Developer', 2,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['be-auth','be-node'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['be-auth','be-node'])),
  'Secure auth flow, token refresh, validation.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Blog API with Comments', 'Backend Developer', 2,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['be-api','be-orm','be-sql'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['be-api','be-orm','be-sql'])),
  'Relations, pagination, clean schema.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Caching Layer (Redis)', 'Backend Developer', 2,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['be-cache','be-node'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['be-cache','be-node'])),
  'Cache invalidation, TTL, performance.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Microservice / Message Queue', 'Backend Developer', 3,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['be-message','be-docker'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['be-message','be-docker'])),
  'Async processing, error handling, deployment.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'SQL Queries for Business Metrics', 'Data Analyst', 1,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['da-sql','da-excel'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['da-sql','da-excel'])),
  'Correct aggregations, filters, joins.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Exploratory Data Analysis (Python)', 'Data Analyst', 2,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['da-python','da-pandas','da-viz'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['da-python','da-pandas','da-viz'])),
  'Cleaning steps, visualizations, summary stats.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Dashboard (Tableau / Power BI)', 'Data Analyst', 2,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['da-bi','da-dashboards'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['da-bi','da-dashboards'])),
  'Clarity, filters, key metrics.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'ETL Pipeline', 'Data Analyst', 2,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['da-cleaning','da-pandas'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['da-cleaning','da-pandas'])),
  'Reproducibility, error handling, documentation.';
INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'End-to-end Analysis Report', 'Data Analyst', 3,
  (SELECT array_agg(id ORDER BY array_position(ARRAY['da-sql','da-pandas','da-viz','da-storytelling'], seed_code)) FROM skills WHERE seed_code = ANY(ARRAY['da-sql','da-pandas','da-viz','da-storytelling'])),
  'Story, visuals, actionable insights.';

ALTER TABLE skills DROP COLUMN IF EXISTS seed_code;

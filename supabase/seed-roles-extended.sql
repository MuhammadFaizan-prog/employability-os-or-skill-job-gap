-- ============================================================
-- Step 2: Seed Data for All 5 Roles + MCQ Questions + Coding Challenges
-- Applied via Supabase migrations. This file is a reference copy.
-- ============================================================

-- ============================================================
-- SECTION 1: Skills for AI/ML Engineer & Mobile Developer
-- ============================================================

ALTER TABLE skills ADD COLUMN IF NOT EXISTS seed_code TEXT;

INSERT INTO skills (name, role, difficulty, weight, seed_code) VALUES
  ('Python', 'AI/ML Engineer', 1, 1.5, 'ai-python'),
  ('Machine Learning Fundamentals', 'AI/ML Engineer', 1, 1.8, 'ai-ml-fundamentals'),
  ('Deep Learning (Neural Networks)', 'AI/ML Engineer', 2, 1.8, 'ai-deep-learning'),
  ('TensorFlow / PyTorch', 'AI/ML Engineer', 2, 1.6, 'ai-frameworks'),
  ('Natural Language Processing', 'AI/ML Engineer', 3, 1.4, 'ai-nlp'),
  ('Computer Vision', 'AI/ML Engineer', 3, 1.3, 'ai-cv'),
  ('Data Preprocessing & Feature Engineering', 'AI/ML Engineer', 1, 1.5, 'ai-preprocessing'),
  ('Model Evaluation & Metrics', 'AI/ML Engineer', 2, 1.4, 'ai-evaluation'),
  ('Statistics & Probability', 'AI/ML Engineer', 1, 1.3, 'ai-stats'),
  ('MLOps & Model Deployment', 'AI/ML Engineer', 3, 1.2, 'ai-mlops'),
  ('SQL for Data Engineering', 'AI/ML Engineer', 1, 1.1, 'ai-sql'),
  ('Linear Algebra & Calculus', 'AI/ML Engineer', 2, 1.0, 'ai-math'),
  ('React Native / Flutter', 'Mobile Developer', 1, 1.8, 'mob-crossplatform'),
  ('iOS Development (Swift)', 'Mobile Developer', 2, 1.5, 'mob-ios'),
  ('Android Development (Kotlin)', 'Mobile Developer', 2, 1.5, 'mob-android'),
  ('Mobile UI/UX Patterns', 'Mobile Developer', 1, 1.3, 'mob-uiux'),
  ('State Management (Provider/Riverpod/Redux)', 'Mobile Developer', 2, 1.4, 'mob-state'),
  ('RESTful API Integration', 'Mobile Developer', 1, 1.3, 'mob-api'),
  ('Push Notifications', 'Mobile Developer', 2, 1.1, 'mob-push'),
  ('App Store Deployment', 'Mobile Developer', 2, 1.1, 'mob-deploy'),
  ('Mobile Testing (Unit & Widget)', 'Mobile Developer', 2, 1.2, 'mob-testing'),
  ('Performance Optimization', 'Mobile Developer', 3, 1.2, 'mob-perf'),
  ('Offline Storage (SQLite, Hive)', 'Mobile Developer', 2, 1.0, 'mob-storage'),
  ('Authentication & Security', 'Mobile Developer', 2, 1.2, 'mob-auth');


-- ============================================================
-- SECTION 2: Projects for AI/ML Engineer & Mobile Developer
-- ============================================================

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Iris / MNIST Classifier', 'AI/ML Engineer', 1,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['ai-python','ai-ml-fundamentals','ai-preprocessing']))),
  'Accuracy, train/test split, confusion matrix.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Sentiment Analysis Pipeline', 'AI/ML Engineer', 2,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['ai-python','ai-nlp','ai-evaluation']))),
  'Preprocessing steps, model selection, F1 score.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Image Classification with CNN', 'AI/ML Engineer', 2,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['ai-deep-learning','ai-frameworks','ai-cv']))),
  'Architecture choices, data augmentation, accuracy.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Recommendation System', 'AI/ML Engineer', 3,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['ai-ml-fundamentals','ai-preprocessing','ai-evaluation','ai-sql']))),
  'Collaborative filtering, evaluation metrics, scalability.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'End-to-end ML Pipeline with MLOps', 'AI/ML Engineer', 3,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['ai-frameworks','ai-mlops','ai-evaluation']))),
  'CI/CD for ML, model versioning, monitoring.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Hello World App (Cross-platform)', 'Mobile Developer', 1,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['mob-crossplatform','mob-uiux']))),
  'Navigation, layout, platform consistency.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Weather App with API', 'Mobile Developer', 1,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['mob-crossplatform','mob-api','mob-uiux']))),
  'API integration, loading states, error handling.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Todo App with Offline Sync', 'Mobile Developer', 2,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['mob-crossplatform','mob-state','mob-storage']))),
  'State management, offline persistence, sync logic.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'Chat App with Push Notifications', 'Mobile Developer', 2,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['mob-crossplatform','mob-push','mob-auth','mob-api']))),
  'Real-time messaging, notification handling, auth flow.';

INSERT INTO projects (title, role, difficulty, required_skills, evaluation_criteria)
SELECT 'E-commerce App (Full Capstone)', 'Mobile Developer', 3,
  to_jsonb((SELECT array_agg(id::text) FROM skills WHERE seed_code = ANY(ARRAY['mob-crossplatform','mob-state','mob-testing','mob-deploy','mob-perf']))),
  'Testing coverage, performance, store-ready build.';

ALTER TABLE skills DROP COLUMN IF EXISTS seed_code;


-- ============================================================
-- SECTION 3: MCQ format for ALL interview questions
-- (existing questions updated + new questions inserted)
-- See migration files for full details
-- ============================================================
-- Each question now has: options (JSONB array of 4 choices),
-- correct_answer (TEXT matching one option), hint (TEXT)
--
-- Role counts after seeding:
--   Frontend Developer: ~15 questions
--   Backend Developer: ~15 questions
--   Data Analyst: ~15 questions
--   AI/ML Engineer: ~15 questions
--   Mobile Developer: ~15 questions


-- ============================================================
-- SECTION 4: Coding Challenges for all 5 roles
-- ============================================================
-- Frontend Developer: Debounce, Flatten Array, Promise.all, Deep Clone (4)
-- Backend Developer: Rate Limiter, LRU Cache, Two Sum, Balanced Parens (4)
-- Data Analyst: Group By Sum, Moving Average, Find Duplicates (3)
-- AI/ML Engineer: Matrix Multiply, KNN, Softmax, Normalize (4)
-- Mobile Developer: Paginated Loader, Event Emitter, Throttle, Async Queue (4)

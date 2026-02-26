-- Interview question bank: table + seed (Step 7).
-- Run in Supabase SQL Editor once. Then verify with npm run verify:step7 or "Verify Step 7" on localhost.

CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  role TEXT NOT NULL,
  difficulty_level INT NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 3),
  category TEXT
);

-- If table already existed without category, add it
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS category TEXT;

COMMENT ON TABLE public.interview_questions IS 'Role-specific interview questions (technical, behavioral, practical).';

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interview_questions_select" ON public.interview_questions;
CREATE POLICY "interview_questions_select" ON public.interview_questions FOR SELECT USING (true);

-- Seed: clear and insert (same data as src/data/interviewQuestions.ts)
DELETE FROM public.interview_questions WHERE role IN ('Frontend Developer', 'Backend Developer', 'Data Analyst');

INSERT INTO public.interview_questions (question_text, role, difficulty_level, category) VALUES
('Explain the difference between let, const, and var in JavaScript.', 'Frontend Developer', 1, 'technical'),
('How does React virtual DOM improve performance?', 'Frontend Developer', 2, 'technical'),
('Describe a time you had to debug a complex frontend issue.', 'Frontend Developer', 2, 'behavioral'),
('How would you optimize a slow-loading SPA?', 'Frontend Developer', 3, 'technical'),
('What is the difference between REST and GraphQL?', 'Backend Developer', 1, 'technical'),
('How do you secure an API (auth, validation, rate limiting)?', 'Backend Developer', 2, 'technical'),
('Describe how you would design a rate limiter.', 'Backend Developer', 3, 'practical'),
('Explain the difference between INNER JOIN and LEFT JOIN.', 'Data Analyst', 1, 'technical'),
('How do you handle missing or duplicate data in a dataset?', 'Data Analyst', 2, 'technical'),
('Tell me about a time you presented data insights to non-technical stakeholders.', 'Data Analyst', 2, 'behavioral');

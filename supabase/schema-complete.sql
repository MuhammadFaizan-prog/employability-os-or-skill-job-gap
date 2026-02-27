-- ============================================================
-- EmployabilityOS — Step 1: Complete Database Schema & RLS
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New query → paste → Run
--
-- This migration is IDEMPOTENT: safe to run multiple times.
-- It uses DO blocks with EXCEPTION handling, DROP POLICY IF EXISTS,
-- CREATE TABLE IF NOT EXISTS, and ADD COLUMN IF NOT EXISTS throughout.
-- ============================================================


-- ============================================================
-- SECTION 1: FIX EXISTING TABLES (add missing columns)
-- ============================================================

-- 1a. interview_questions — add MCQ columns
DO $fix1$ BEGIN
  ALTER TABLE public.interview_questions ADD COLUMN hint TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $fix1$;

DO $fix2$ BEGIN
  ALTER TABLE public.interview_questions ADD COLUMN options JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $fix2$;

DO $fix3$ BEGIN
  ALTER TABLE public.interview_questions ADD COLUMN correct_answer TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $fix3$;

DO $fix4$ BEGIN
  ALTER TABLE public.interview_questions ADD COLUMN company_tags TEXT[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $fix4$;


-- 1b. resume_uploads — add columns the frontend expects
DO $fix5$ BEGIN
  ALTER TABLE public.resume_uploads ADD COLUMN file_path TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $fix5$;

DO $fix6$ BEGIN
  ALTER TABLE public.resume_uploads ADD COLUMN mime_type TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $fix6$;

DO $fix7$ BEGIN
  ALTER TABLE public.resume_uploads ADD COLUMN analysis_result JSONB DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $fix7$;

DO $fix8$ BEGIN
  ALTER TABLE public.resume_uploads ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $fix8$;


-- 1c. user_skills
CREATE TABLE IF NOT EXISTS public.user_skills (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id     UUID,
  proficiency  INT NOT NULL DEFAULT 0 CHECK (proficiency >= 0 AND proficiency <= 5),
  last_updated TIMESTAMPTZ DEFAULT now()
);

DO $fix9$ BEGIN
  ALTER TABLE public.user_skills
    ADD CONSTRAINT user_skills_user_skill_unique UNIQUE (user_id, skill_id);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $fix9$;


-- 1d. user_projects
CREATE TABLE IF NOT EXISTS public.user_projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   UUID,
  completed    BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT now()
);

DO $fix10$ BEGIN
  ALTER TABLE public.user_projects
    ADD CONSTRAINT user_projects_user_project_unique UNIQUE (user_id, project_id);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $fix10$;


-- 1e. scores
CREATE TABLE IF NOT EXISTS public.scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technical       NUMERIC(5,2) DEFAULT 0,
  projects        NUMERIC(5,2) DEFAULT 0,
  resume          NUMERIC(5,2) DEFAULT 0,
  practical       NUMERIC(5,2) DEFAULT 0,
  interview       NUMERIC(5,2) DEFAULT 0,
  final_score     NUMERIC(5,2) DEFAULT 0,
  last_calculated TIMESTAMPTZ DEFAULT now()
);

DO $fix11$ BEGIN
  ALTER TABLE public.scores
    ADD CONSTRAINT scores_user_unique UNIQUE (user_id);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $fix11$;


-- ============================================================
-- SECTION 2: CREATE NEW TABLES
-- ============================================================

-- 2a. user_roadmap
CREATE TABLE IF NOT EXISTS public.user_roadmap (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT '',
  roadmap_json  JSONB NOT NULL DEFAULT '{}',
  progress_json JSONB NOT NULL DEFAULT '{}',
  last_updated  TIMESTAMPTZ DEFAULT now()
);

DO $fix12$ BEGIN
  ALTER TABLE public.user_roadmap
    ADD CONSTRAINT user_roadmap_user_unique UNIQUE (user_id);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $fix12$;


-- 2b. user_interview_progress
CREATE TABLE IF NOT EXISTS public.user_interview_progress (
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id        UUID NOT NULL,
  answer_selected    TEXT DEFAULT '',
  is_correct         BOOLEAN DEFAULT false,
  time_spent_seconds INT DEFAULT 0,
  practiced_at       TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);


-- 2c. coding_challenges
CREATE TABLE IF NOT EXISTS public.coding_challenges (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  description        TEXT NOT NULL,
  difficulty         TEXT NOT NULL DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  role               TEXT NOT NULL,
  category           TEXT DEFAULT 'algorithm',
  starter_code       TEXT DEFAULT '',
  solution_code      TEXT DEFAULT '',
  test_cases         JSONB DEFAULT '[]',
  hints              JSONB DEFAULT '[]',
  time_limit_minutes INT DEFAULT 30,
  company_tags       TEXT[] DEFAULT '{}'
);


-- 2d. user_coding_attempts
CREATE TABLE IF NOT EXISTS public.user_coding_attempts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id       UUID NOT NULL REFERENCES public.coding_challenges(id) ON DELETE CASCADE,
  submitted_code     TEXT DEFAULT '',
  passed             BOOLEAN DEFAULT false,
  time_spent_seconds INT DEFAULT 0,
  attempted_at       TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- SECTION 3: ROW LEVEL SECURITY
-- ============================================================

-- Drop old permissive anon policies on resume_uploads first
DROP POLICY IF EXISTS "resume_uploads_select" ON public.resume_uploads;
DROP POLICY IF EXISTS "resume_uploads_insert" ON public.resume_uploads;

-- 3a. user_skills — owner only
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_skills_select" ON public.user_skills;
CREATE POLICY "user_skills_select"
  ON public.user_skills FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_skills_insert" ON public.user_skills;
CREATE POLICY "user_skills_insert"
  ON public.user_skills FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_skills_update" ON public.user_skills;
CREATE POLICY "user_skills_update"
  ON public.user_skills FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_skills_delete" ON public.user_skills;
CREATE POLICY "user_skills_delete"
  ON public.user_skills FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- 3b. user_projects — owner only
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_projects_select" ON public.user_projects;
CREATE POLICY "user_projects_select"
  ON public.user_projects FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_projects_insert" ON public.user_projects;
CREATE POLICY "user_projects_insert"
  ON public.user_projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_projects_update" ON public.user_projects;
CREATE POLICY "user_projects_update"
  ON public.user_projects FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_projects_delete" ON public.user_projects;
CREATE POLICY "user_projects_delete"
  ON public.user_projects FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- 3c. scores — owner only
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scores_select" ON public.scores;
CREATE POLICY "scores_select"
  ON public.scores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_insert" ON public.scores;
CREATE POLICY "scores_insert"
  ON public.scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_update" ON public.scores;
CREATE POLICY "scores_update"
  ON public.scores FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_delete" ON public.scores;
CREATE POLICY "scores_delete"
  ON public.scores FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- 3d. resume_uploads — owner only
ALTER TABLE public.resume_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resume_uploads_owner_select" ON public.resume_uploads;
CREATE POLICY "resume_uploads_owner_select"
  ON public.resume_uploads FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "resume_uploads_owner_insert" ON public.resume_uploads;
CREATE POLICY "resume_uploads_owner_insert"
  ON public.resume_uploads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resume_uploads_owner_update" ON public.resume_uploads;
CREATE POLICY "resume_uploads_owner_update"
  ON public.resume_uploads FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resume_uploads_owner_delete" ON public.resume_uploads;
CREATE POLICY "resume_uploads_owner_delete"
  ON public.resume_uploads FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- 3e. user_roadmap — owner only
ALTER TABLE public.user_roadmap ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roadmap_select" ON public.user_roadmap;
CREATE POLICY "user_roadmap_select"
  ON public.user_roadmap FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_roadmap_insert" ON public.user_roadmap;
CREATE POLICY "user_roadmap_insert"
  ON public.user_roadmap FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_roadmap_update" ON public.user_roadmap;
CREATE POLICY "user_roadmap_update"
  ON public.user_roadmap FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_roadmap_delete" ON public.user_roadmap;
CREATE POLICY "user_roadmap_delete"
  ON public.user_roadmap FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- 3f. user_interview_progress — owner only
ALTER TABLE public.user_interview_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_interview_progress_select" ON public.user_interview_progress;
CREATE POLICY "user_interview_progress_select"
  ON public.user_interview_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_interview_progress_insert" ON public.user_interview_progress;
CREATE POLICY "user_interview_progress_insert"
  ON public.user_interview_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_interview_progress_update" ON public.user_interview_progress;
CREATE POLICY "user_interview_progress_update"
  ON public.user_interview_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_interview_progress_delete" ON public.user_interview_progress;
CREATE POLICY "user_interview_progress_delete"
  ON public.user_interview_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- 3g. user_coding_attempts — owner only
ALTER TABLE public.user_coding_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_coding_attempts_select" ON public.user_coding_attempts;
CREATE POLICY "user_coding_attempts_select"
  ON public.user_coding_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_coding_attempts_insert" ON public.user_coding_attempts;
CREATE POLICY "user_coding_attempts_insert"
  ON public.user_coding_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_coding_attempts_update" ON public.user_coding_attempts;
CREATE POLICY "user_coding_attempts_update"
  ON public.user_coding_attempts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_coding_attempts_delete" ON public.user_coding_attempts;
CREATE POLICY "user_coding_attempts_delete"
  ON public.user_coding_attempts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- 3h. coding_challenges — read-only for authenticated users
ALTER TABLE public.coding_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coding_challenges_select" ON public.coding_challenges;
CREATE POLICY "coding_challenges_select"
  ON public.coding_challenges FOR SELECT TO authenticated
  USING (true);


-- ============================================================
-- SECTION 4: TRIGGERS (auto-update last_updated / last_calculated)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $trigger_fn$
BEGIN
  NEW.last_updated := now();
  RETURN NEW;
END;
$trigger_fn$;

DROP TRIGGER IF EXISTS trg_user_skills_updated ON public.user_skills;
CREATE TRIGGER trg_user_skills_updated
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_user_projects_updated ON public.user_projects;
CREATE TRIGGER trg_user_projects_updated
  BEFORE UPDATE ON public.user_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- scores uses last_calculated (set by frontend), not last_updated; no trigger needed

DROP TRIGGER IF EXISTS trg_user_roadmap_updated ON public.user_roadmap;
CREATE TRIGGER trg_user_roadmap_updated
  BEFORE UPDATE ON public.user_roadmap
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- SECTION 5: STORAGE BUCKETS
-- ============================================================

-- 5a. documents bucket — private, 10 MB, PDF/DOCX/TXT/images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit    = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "documents_upload" ON storage.objects;
DROP POLICY IF EXISTS "documents_select" ON storage.objects;

DROP POLICY IF EXISTS "documents_insert_auth" ON storage.objects;
CREATE POLICY "documents_insert_auth" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents_select_auth" ON storage.objects;
CREATE POLICY "documents_select_auth" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');


-- 5b. avatars bucket — public, 2 MB, images only
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit    = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "avatars_insert_auth" ON storage.objects;
CREATE POLICY "avatars_insert_auth" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_update_auth" ON storage.objects;
CREATE POLICY "avatars_update_auth" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');


-- ============================================================
-- SECTION 6: HELPER RPC — delete_user_data
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $rpc_delete$
BEGIN
  IF auth.uid() IS DISTINCT FROM target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: you can only delete your own data';
  END IF;

  DELETE FROM public.user_coding_attempts   WHERE user_id = target_user_id;
  DELETE FROM public.user_interview_progress WHERE user_id = target_user_id;
  DELETE FROM public.user_roadmap           WHERE user_id = target_user_id;
  DELETE FROM public.resume_uploads         WHERE user_id = target_user_id;
  DELETE FROM public.scores                 WHERE user_id = target_user_id;
  DELETE FROM public.user_projects          WHERE user_id = target_user_id;
  DELETE FROM public.user_skills            WHERE user_id = target_user_id;
  DELETE FROM public.users                  WHERE id = target_user_id;
END;
$rpc_delete$;


-- ============================================================
-- DONE. All tables, columns, constraints, RLS policies,
-- triggers, storage buckets, and helper RPCs are in place.
-- ============================================================

-- System Design attempts: store user responses for scenario-based questions.
CREATE TABLE IF NOT EXISTS public.system_design_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_key  TEXT NOT NULL,
  response_text TEXT DEFAULT '',
  submitted_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_design_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "system_design_attempts_select" ON public.system_design_attempts;
CREATE POLICY "system_design_attempts_select"
  ON public.system_design_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "system_design_attempts_insert" ON public.system_design_attempts;
CREATE POLICY "system_design_attempts_insert"
  ON public.system_design_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update delete_user_data to also remove system_design_attempts
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $rpc_delete$
BEGIN
  IF auth.uid() IS DISTINCT FROM target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: you can only delete your own data';
  END IF;

  DELETE FROM public.system_design_attempts WHERE user_id = target_user_id;
  DELETE FROM public.user_coding_attempts    WHERE user_id = target_user_id;
  DELETE FROM public.user_interview_progress WHERE user_id = target_user_id;
  DELETE FROM public.user_roadmap            WHERE user_id = target_user_id;
  DELETE FROM public.resume_uploads          WHERE user_id = target_user_id;
  DELETE FROM public.scores                  WHERE user_id = target_user_id;
  DELETE FROM public.user_projects           WHERE user_id = target_user_id;
  DELETE FROM public.user_skills             WHERE user_id = target_user_id;
  DELETE FROM public.users                   WHERE id = target_user_id;
END;
$rpc_delete$;

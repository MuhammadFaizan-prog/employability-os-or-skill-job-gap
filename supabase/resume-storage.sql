-- Resume uploads: table + storage bucket for documents (PDF, DOCX, images).
-- Run this ENTIRE file in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
-- If you see "Bucket not found" when uploading a resume, the bucket does not exist yet; running this file creates it.
-- If PDF upload fails with "not allowed" or MIME type error, run this file again to update the bucket.
-- Then: npm run verify:step6 from repo root, or open localhost /verify and click "Verify Step 6 (resume)".

-- Table: resume_uploads (metadata for each uploaded document)
-- user_id optional until auth is enabled (can link to auth.users later)
CREATE TABLE IF NOT EXISTS public.resume_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  analysis_score NUMERIC(5,2),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.resume_uploads IS 'Metadata for uploaded resumes/documents (file lives in Storage bucket documents)';

-- RLS: allow read/write for anon and authenticated (for MVP verification without auth, anon can insert/select)
ALTER TABLE public.resume_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resume_uploads_select" ON public.resume_uploads;
CREATE POLICY "resume_uploads_select" ON public.resume_uploads FOR SELECT USING (true);

DROP POLICY IF EXISTS "resume_uploads_insert" ON public.resume_uploads;
CREATE POLICY "resume_uploads_insert" ON public.resume_uploads FOR INSERT WITH CHECK (true);

-- Storage bucket: documents (resumes, PDFs, images, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Ensure existing bucket allows PDF and other types (run after first deploy or if uploads fail)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    file_size_limit = 10485760
WHERE id = 'documents';

-- Storage policies: allow anon to upload and read (for localhost verification without auth)
DROP POLICY IF EXISTS "documents_upload" ON storage.objects;
CREATE POLICY "documents_upload" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents_select" ON storage.objects;
CREATE POLICY "documents_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'documents');

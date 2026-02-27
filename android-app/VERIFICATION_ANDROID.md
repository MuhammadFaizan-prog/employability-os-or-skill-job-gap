# Android–Web Parity Checklist

Use this checklist to verify that the Android app and the web app stay in parity for data and behavior.

## Auth
- [ ] Login (email/password) works with the same Supabase project; same user can log in on web and Android.
- [ ] Signup creates a row in `public.users` (via trigger or app upsert).
- [ ] Sign out clears session on the device; web session is independent.

## Scores
- [ ] For the same user and same role: same skills, projects, resume score, interview score → Dashboard shows the same final score and breakdown on web and Android (ScoreCalculator weights: Technical 40%, Projects 20%, Resume 15%, Practical 15%, Interview 10%).

## Data persistence
- [ ] Updates from Android are visible on the web (and vice versa) for: `user_skills`, `user_projects`, `scores`, `user_roadmap`, `resume_uploads`, `user_interview_progress`, `user_coding_attempts`, `system_design_attempts`, `users` (profile).

## Schema & RLS
- [ ] Android uses the same tables and column names as the web (see `data/SupabaseModels.kt`).
- [ ] All repository calls use the authenticated user; RLS allows only `auth.uid()` data.

## Known differences
- Google OAuth on Android may use a different flow (e.g. native Google Sign-In + token exchange) than the web redirect flow; both should write to the same `auth.users` and `public.users`.
- Resume upload on Android uses the same Storage bucket and `resume_uploads` table; client-side analysis may be limited (e.g. text-only) compared to web PDF parsing.

## How to run parity checks
1. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `gradle.properties` to the same values as the web `.env`.
2. Create or use one test user; log in on web and on Android.
3. On web: set role, rate skills, complete a project, upload a resume, answer an interview question.
4. On Android: open Dashboard, Skills, Projects, Resume, Interview; confirm the same data appears and scores match.
5. On Android: change a skill rating or project completion; refresh the web app and confirm the change is visible.

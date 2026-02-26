# What Step 5, 6, and 7 Do

## Step 5 — Roadmap generator

**Purpose:** Build a **learning roadmap** for a role (e.g. Frontend Developer) from Supabase data.

- **Input:** A role + the user’s current skills and projects (or demo data).
- **Data:** Reads **skills** and **projects** for that role from Supabase (ordered by difficulty).
- **Output:** A roadmap that splits:
  - **Skills:** done (user has them), next (suggested), upcoming (later).
  - **Projects:** done, suggested (unlockable now), locked (need more skills).
- **Logic:** No AI — order comes from the competency data (difficulty/order). Used for the Roadmap page and “Load Roadmap” on `/verify`.

**Files:** `src/roadmap/generator.ts`, frontend `lib/roadmap.ts`, Roadmap page + Verify Step 5.

---

## Step 6 — Resume analyzer (stub + storage)

**Purpose:** Let users **upload a resume**, store it in Supabase, and get a **simple analysis** (stub).

- **Upload:** User picks a file (PDF, DOC, DOCX, or image) on the Resume page → file is uploaded to **Supabase Storage** (bucket `documents`, path `resumes/{uuid}_{filename}`).
- **Database:** A row is added to **`resume_uploads`** with file name, storage path, type, size, and optional analysis score.
- **Analysis (stub):** Returns a fixed score (e.g. 50) and placeholder suggestions. Real PDF/DOCX parsing or NLP is planned later.
- **Security:** Table and bucket are created/updated via `supabase/resume-storage.sql` (RLS and storage policies).

**Files:** `src/engine/resumeAnalyzer.ts`, `supabase/resume-storage.sql`, frontend Resume page (`/resume`).

---

## Step 7 — Interview question bank

**Purpose:** Provide **role-based interview questions** from the database for the Interview Prep page.

- **Data:** Table **`interview_questions`** with `question_text`, `role`, `difficulty_level` (1–3), and optional `category`.
- **Seed:** `supabase/interview-questions.sql` inserts questions for Frontend Developer, Backend Developer, and Data Analyst.
- **Frontend:** The Interview page (`/interview`) loads questions from Supabase and lets users filter by **role** and **difficulty** (all / 1 / 2 / 3).
- **Use:** Prep for technical/behavioral interviews; no AI yet — just stored questions.

**Files:** `supabase/interview-questions.sql`, frontend Interview page (`/interview`), Verify Step 7.

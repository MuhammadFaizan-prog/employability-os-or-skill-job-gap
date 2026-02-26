# Steps 1–8 verification report

All steps are verified **dynamically** against Supabase (project **skilljob**). No hardcoded counts or static data.

---

## Backend verification (Supabase + logic)

From repo root, with `frontend/.env` containing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`:

```bash
npm run verify:all
```

This runs in order:

| Step | Script | What it checks |
|------|--------|----------------|
| **1 + 2** | `verify-steps.ts` | Supabase connection; `skills` table readable (count); per-role counts: 12 skills + 5 projects for Frontend, Backend, Data Analyst; sample project `required_skills` populated |
| **3** | `verify-step3.ts` | Fetches skills/projects from Supabase, runs `calculateScore()`, checks breakdown and final score |
| **4** | `verify-step4.ts` | Fetches skills for Frontend Developer from Supabase, runs `analyzeSkillGap()`, checks strengths/gaps/priority/suggested next |
| **5** | `verify-step5.ts` | Fetches skills + projects from Supabase, runs `generateRoadmap()`, checks done/next/upcoming and projects done/suggested/locked |
| **6** | `verify-step6-resume.ts` | `resume_uploads` table readable; `documents` storage bucket listable (run `supabase/resume-storage.sql` in SQL Editor first) |
| **7** | `verify-step7.ts` | `interview_questions` table readable; questions for Frontend Developer (run `supabase/interview-questions.sql` in SQL Editor first) |
| **8** | `verify-step8.ts` | API surface: getScore, getSkillGap, getRoadmap with Supabase (demo user) |

**Last run:** Steps 1–6 and 8 pass when Supabase is configured. Step 7 passes after running `supabase/interview-questions.sql`.

---

## Frontend verification (localhost)

1. **Start the app**
   ```bash
   cd frontend && npm run dev
   ```
2. Open **http://localhost:5173** (or the port Vite prints).
3. Go to **/verify** (or click “Verify” in the nav).
4. Click in order:
   - **Verify Step 1 (Supabase)** → expect “Step 1 verified” and skills count.
   - **Verify Step 2 (competency data)** → expect “Step 2 verified” and counts by role.
   - **Verify Step 3 (score engine)** → expect “Step 3 verified” and score breakdown.
   - **Verify Step 4 (skill gap)** → expect “Step 4 verified” and strengths/gaps/suggested next.
   - **Verify Step 5 (roadmap)** → expect “Step 5 verified” and roadmap summary + diagram.
   - **Verify Step 6 (resume)** → expect “Step 6 verified: resume_uploads table + documents bucket” (run `supabase/resume-storage.sql` in SQL Editor first if this fails).
   - **Verify Step 7 (interview)** → expect “Step 7 verified: interview_questions” (run `supabase/interview-questions.sql` first if this fails).
   - **Verify Step 8 (API surface)** → expect “Step 8 verified: getScore, getSkillGap, getRoadmap”.
   - **Load Roadmap** → same data as Step 5, block diagram only.
5. **Console:** In the “Console (verification)” section there should be **“No console errors or warnings.”** If you open DevTools (F12), the Console tab should show no errors when clicking the buttons.
6. **Resume upload:** Go to **/resume**, choose a file (PDF, DOC, DOCX, or image), click **Upload & Analyze**. File is stored in Supabase Storage (bucket `documents`) and a row in `resume_uploads`; stub analysis shows score + suggestions.
7. **Interview questions:** Go to **/interview**, select role and difficulty; questions load from Supabase `interview_questions` (run `supabase/interview-questions.sql` if empty).

The same Supabase project and env are used by both backend scripts and the frontend.

---

## Summary

- **Step 1:** Types + Supabase connection; app reads from `skills` (dynamic count).
- **Step 2:** Competency data in Supabase; app fetches skills/projects by role (dynamic).
- **Step 3:** Employability Score engine; app fetches from Supabase and runs `calculateScore()` (dynamic).
- **Step 4:** Skill gap analysis; app fetches skills from Supabase and runs `analyzeSkillGap()` (dynamic).
- **Step 5:** Roadmap generator; app fetches skills + projects from Supabase and runs `computeRoadmapSummary()` + `computeRoadmapSteps()`; diagram shows blocks with click-to-open details (dynamic).
- **Step 6:** Resume upload; app stores file in Supabase Storage (bucket `documents`) and metadata in `resume_uploads`; stub analyzer returns score + suggestions (dynamic; run `supabase/resume-storage.sql` once).
- **Step 7:** Interview question bank; `interview_questions` table in Supabase; frontend `/interview` fetches by role and difficulty (dynamic; run `supabase/interview-questions.sql` once).
- **Step 8:** API surface; `src/api/index.ts` exports getScore, getSkillGap, getRoadmap; each uses Supabase and engine (dynamic; demo user when userId is null).

All verification is **dynamic**; the only fixed values are the expected counts in `verify-steps.ts` (12 skills and 5 projects per role after seed), which match the seed data.

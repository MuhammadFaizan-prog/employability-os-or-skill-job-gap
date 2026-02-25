# EmployabilityOS — Implementation Steps (Backend / Logic First)

> UI will be implemented later. This document breaks the product into ordered steps and tracks what we implement now.

---

## Summary

**EmployabilityOS** bridges the skill–job gap via:
- **Employability Score** (0–100) from 5 weighted dimensions
- **Skill gap analysis** vs role competency
- **Structured roadmap** (skills order + projects)
- **Resume analysis** and **interview question bank** (later)

We implement **logic and data** first; UI comes later.

---

## Step 1 — Project & types ✅ (verified with Supabase skilljob)

- [x] TypeScript project (Node), no UI
- [x] Shared types: `User`, `Skill`, `UserSkill`, `Project`, `UserProject`, `Score`, `Role`
- [x] Score dimension weights (Technical 40%, Projects 20%, Resume 15%, Practical 15%, Interview 10%)
- [x] **Supabase (skilljob):** Tables created (`users`, `skills`, `user_skills`, `projects`, `user_projects`, `scores`, `interview_questions`, `user_roadmap`) + RLS policies
- [x] **React frontend:** `frontend/` — Vite + React + TS; "Verify Step 1" button reads from Supabase

**Deliverable:** `src/types/` + `package.json`, `tsconfig.json`, Supabase schema, `frontend/` app.  
**Run verification:** `cd frontend && cp .env.example .env` (add anon key from Supabase Dashboard), `npm run dev`, open http://localhost:5173, click **Verify Step 1 (Supabase)**.  
**Console check:** App shows a "Console (verification)" section: must show "No console errors or warnings." before proceeding to Step 2.

**Dynamic verification:** The app reads from Supabase (skilljob) only; no hardcoded table counts. Run `npx ts-node src/scripts/verify-steps.ts` from repo root to assert Step 1 + Step 2 against the live DB.

---

## Step 2 — Competency frameworks (data)

- [x] **Roles:** Frontend Developer, Backend Developer, Data Analyst (MVP)
- [x] **Skills table** per role: `id`, `name`, `role`, `difficulty` (1–3), `weight`
- [x] **Projects table** per role: `id`, `title`, `role`, `difficulty` (1–3), `required_skills`, `evaluation_criteria`
- [x] Seed data: realistic skills and projects for each role (canonical: Node script `npm run seed:step2`; Supabase is source of truth)

**Deliverable:** `src/data/competency.ts` + Supabase tables `skills` and `projects` populated via seed script.

**Fix Supabase data (single source of truth):** From repo root, set `SUPABASE_SERVICE_ROLE_KEY` in `frontend/.env` or root `.env` (from Supabase Dashboard → Project Settings → API). Then run:
1. `npm run seed:step2` — clears and re-seeds competency data in Supabase (36 skills, 15 projects).
2. `npx ts-node src/scripts/verify-steps.ts` — verifies Step 1 and Step 2 against Supabase (must pass before Step 3).
3. Open http://localhost:5173, click **Verify Step 1** and **Verify Step 2**, confirm no console errors.

---

## Step 3 — Employability Score engine

- [ ] **Technical score (40%):** From `user_skills`: `(sum of proficiency × skill weight) / total_possible_weight`, normalized 0–100
- [ ] **Projects score (20%):** Beginner = 5, Intermediate = 10, Advanced = 20 pts; normalize to 100
- [ ] **Resume (15%), Practical (15%), Interview (10%):** Placeholder 0–100 (or simple rules) until resume/experience/interview modules exist
- [ ] **Final score:** Weighted sum, 0–100
- [ ] Recalculation on any progress update (function only; no DB yet)

**Deliverable:** `src/engine/score.ts` — `calculateScore(user, userSkills, userProjects, resumeScore?, practicalScore?, interviewScore?)`

---

## Step 4 — Skill gap analysis

- [ ] Input: `role`, `userSkills[]` (skill id + proficiency 1–5)
- [ ] Load role competency: all skills for that role
- [ ] Output: **gaps** (skills missing or low), **strengths** (skills at 4–5), **priority focus** (high-weight + low proficiency first)
- [ ] Optional: “suggested next skill” (e.g. first gap by order or weight)

**Deliverable:** `src/engine/skillGap.ts` — `analyzeSkillGap(role, userSkills, allSkillsForRole)`

---

## Step 5 — Roadmap generator (template-based)

- [ ] Input: `role`, `userSkills` (current state)
- [ ] Use role’s ordered skills (by difficulty / dependency) + projects
- [ ] Output: ordered list of **skills** (with “done” / “next” / “upcoming”), and **suggested projects** per skill or phase
- [ ] No GPT in Step 5; pure template/order from competency data
- [ ] Later: GPT refinement (Phase 2)

**Deliverable:** `src/roadmap/generator.ts` — `generateRoadmap(role, userSkills, options?)` → roadmap JSON

---

## Step 6 — Resume analyzer (stub)

- [ ] Interface: `analyzeResume(fileOrText): { score, suggestions }`
- [ ] Stub: return fixed score (e.g. 50) + placeholder suggestions until real parsing/NLP
- [ ] Later: PDF/DOCX parse + keyword/ATS + GPT

**Deliverable:** `src/engine/resumeAnalyzer.ts` (stub)

---

## Step 7 — Interview question bank (data only)

- [ ] Data: `interview_questions` — `question_text`, `role`, `difficulty_level` (1–3)
- [ ] Seed a few questions per role (technical, behavioral)
- [ ] API: `getQuestions(role, difficulty?)` (no DB, in-memory)

**Deliverable:** `src/data/interviewQuestions.ts` + use in score when “interview readiness” is implemented

---

## Step 8 — API surface (optional, local)

- [ ] Thin layer: functions that use engine + data (e.g. `getScore(userId)`, `getSkillGap(userId, role)`, `getRoadmap(userId, role)`)
- [ ] Can be replaced later by Supabase Edge Functions or REST API

**Deliverable:** `src/api/` or single `src/index.ts` exporting all services

---

## Out of scope for now (later)

- **UI:** All pages (Landing, Onboarding, Dashboard, Skills, Roadmap, Project, Resume, Interview, Profile)
- **Auth:** Supabase Auth (or any login)
- **Database:** Supabase tables + RLS (schema is defined in README; we use in-memory / JSON for now)
- **Resume parsing:** Real PDF/DOCX and NLP/GPT
- **GPT roadmap refinement:** Phase 2
- **Payments / premium:** Phase 2

---

## File structure (current)

```
skill job gap/
├── README (1).md
├── IMPLEMENTATION_STEPS.md          # this file
├── package.json
├── tsconfig.json
├── src/
│   ├── types/
│   │   └── index.ts                 # User, Skill, Score, Role, etc.
│   ├── data/
│   │   ├── competency.ts            # roles, skills, projects (seed)
│   │   └── interviewQuestions.ts   # question bank
│   ├── engine/
│   │   ├── score.ts                 # calculateScore()
│   │   ├── skillGap.ts              # analyzeSkillGap()
│   │   └── resumeAnalyzer.ts         # stub
│   ├── roadmap/
│   │   └── generator.ts            # generateRoadmap()
│   └── index.ts                     # export all / run demo
```

---

## How to run (after implementation)

- `npm install`
- `npx ts-node src/index.ts` or `npm run build && node dist/index.js` — run a small demo that:
  - Builds a mock user with some skills/projects
  - Computes Employability Score
  - Runs skill gap analysis
  - Generates a roadmap

UI will be done later.

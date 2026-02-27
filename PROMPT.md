# EmployabilityOS — Design & Build Prompt

> Use this prompt to generate the complete frontend UI for EmployabilityOS.
> Feed this to any AI design tool, coding assistant, or designer.

---

## Context

**EmployabilityOS** is an AI-powered career readiness platform that bridges the skill–job gap for final-year students and fresh graduates. It gives users a dynamic **Employability Score** (0–100), identifies skill gaps, generates structured learning roadmaps, suggests portfolio projects, analyzes resumes, and provides interview prep — all personalized to a target career role.

The **backend logic is fully built** (Steps 1–8). All data comes from **Supabase** (PostgreSQL + Storage). The frontend is **React + TypeScript + Vite**. We now need to build a **polished, modern, responsive UI** for each page.

---

## Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Routing:** React Router v6 (already configured)
- **State:** React Query (for data fetching) + React Context (for user state like selected role)
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Fonts:** Inter (body text), JetBrains Mono (scores, code, numbers)
- **Icons:** Lucide React (or Heroicons)

---

## Color Palette

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Dark | `#152219` | `--color-dark` | Primary text, headings, nav background, buttons |
| Light | `#EAECE9` | `--color-light` | Page background, subtle borders |
| Accent | `#9BBF89` | `--color-accent` | Highlights, active states, badges, progress fills, CTA hover |
| White | `#FFFFFF` | `--color-white` | Card backgrounds, input fields |
| Error | `#DC2626` | — | Error states, gap indicators |
| Warning | `#F59E0B` | — | In-progress, medium states |

**Status colors (consistent across all pages):**
- Green (`#9BBF89` or Tailwind `green-500`): Done, Strength, Success, Completed
- Yellow/Amber (`#F59E0B`): In Progress, Next, Improving
- Red (`#DC2626`): Gap, Error, Missing
- Gray (`#6B7280`): Upcoming, Locked, Not Started, Disabled

---

## Design Principles

1. **Clean and minimal** — lots of whitespace, no visual clutter. Data should breathe.
2. **Cards-based layout** — every data item (skill, project, question) lives in a card.
3. **Status = color** — users instantly recognize done/gap/upcoming by color alone.
4. **Score is the hero** — the Employability Score (0–100) is the most prominent visual element. Use a large circular gauge or ring on the Dashboard.
5. **Progressive disclosure** — show summary first, details on click/expand.
6. **Responsive / mobile-first** — cards stack vertically on mobile; 2–3 column grid on desktop.
7. **Consistent spacing** — use Tailwind spacing: `gap-4`, `gap-6`, `p-6`, `p-8`, etc.
8. **Badges for metadata** — difficulty (1/2/3), role, status, category, weight.
9. **Accessible** — proper contrast ratios, focus indicators, ARIA labels, semantic HTML.
10. **No auth yet** — no login/signup forms. Landing page CTA goes to `/onboarding`. All pages are publicly accessible for MVP.

---

## Existing Routes (React Router)

```
/              → Landing page
/onboarding    → Role selection + optional skill self-assessment
/dashboard     → Central hub: score, breakdown, skill summary, roadmap preview
/skills        → Skill gap analysis: full skill list, strengths, gaps, priority
/roadmap       → Visual roadmap diagram (skill blocks + project blocks)
/projects      → Portfolio projects: cards, filter, completion toggle
/resume        → Resume upload + analysis result + Supabase storage
/interview     → Interview question bank: role/difficulty filter
/profile       → User info, role, subscription status
/verify        → Dev-only: verification buttons for Steps 1–8
```

All routes are wrapped in a shared `<Layout />` component with a top navigation bar.

---

## Page-by-Page Specification

### PAGE 1: Landing (`/`)

**Goal:** First impression. Convince the user to get started.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  NAV BAR (Logo + Links)                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  HERO SECTION                                    │
│  ┌────────────────────────────────────────────┐  │
│  │  H1: "Bridge the Skill–Job Gap"            │  │
│  │  P: "Measure and improve your job          │  │
│  │     readiness with a real-time              │  │
│  │     Employability Score."                   │  │
│  │  [Get Started] button → /onboarding        │  │
│  │  "Explore Dashboard" link → /dashboard     │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  HOW IT WORKS (4 step cards in a row)            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │ 1.Choose│ │ 2.Assess│ │ 3.Follow│ │4.Track ││
│  │  Role   │ │  Skills │ │ Roadmap │ │ Score  ││
│  └─────────┘ └─────────┘ └─────────┘ └────────┘│
│                                                  │
│  FEATURES GRID (6 feature cards, 3×2)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Score    │ │ Skill Gap│ │ Roadmap  │         │
│  ├──────────┤ ├──────────┤ ├──────────┤         │
│  │ Projects │ │ Resume   │ │Interview │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                  │
│  SCORE PREVIEW                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Mock gauge: 72/100                        │  │
│  │  5 dimension bars (Tech 40%, Projects 20%, │  │
│  │  Resume 15%, Practical 15%, Interview 10%) │  │
│  │  "Your score updates dynamically."         │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  CTA FOOTER                                      │
│  "Ready to start?" [Get Started Free] button     │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Key elements:**
- Hero with large heading + subheading + primary CTA button (accent bg, dark text)
- 4 "How it works" cards (icon + step number + title + 1-line description)
- 6 feature cards (icon + title + one-liner) in a responsive grid
- Score preview section with a mock gauge and dimension breakdown bars
- Bottom CTA section

---

### PAGE 2: Onboarding (`/onboarding`)

**Goal:** User selects their target career role. Optionally rates a few skills.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  H1: "Choose Your Career Goal"                   │
│  P: "We'll build your personalized roadmap."     │
│                                                  │
│  ROLE CARDS (3 cards, clickable, one selected)   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ Frontend Dev │ │ Backend Dev  │ │Data Analyst│ │
│  │ "Build web   │ │ "Server-side │ │"Data-driven│ │
│  │  interfaces" │ │  systems"    │ │ insights"  │ │
│  │ 12 skills    │ │ 12 skills    │ │ 12 skills  │ │
│  │ 5 projects   │ │ 5 projects   │ │ 5 projects │ │
│  │ [selected]   │ │              │ │            │ │
│  └──────────────┘ └──────────────┘ └──────────┘ │
│                                                  │
│  SKILL SELF-ASSESSMENT (appears after selection) │
│  ┌────────────────────────────────────────────┐  │
│  │  "Rate your current level"                 │  │
│  │  HTML/CSS          [1] [2] [3] [4] [5]    │  │
│  │  JavaScript        [1] [2] [3] [4] [5]    │  │
│  │  React             [1] [2] [3] [4] [5]    │  │
│  │  TypeScript         [1] [2] [3] [4] [5]   │  │
│  │  ...                                      │  │
│  │  [Skip for now]                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [Start My Journey] button → /dashboard          │
└──────────────────────────────────────────────────┘
```

**Data source:** Roles come from distinct `role` values in `skills` table. Skills for self-assessment come from `skills` filtered by selected role (top 5–6 by difficulty).

---

### PAGE 3: Dashboard (`/dashboard`)

**Goal:** Central hub. Show score, breakdown, skill summary, roadmap preview, next steps.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  WELCOME HEADER                                  │
│  "Your Dashboard" + role badge + last updated    │
│                                                  │
│  ┌─────────────────┐  ┌──────────────────────┐   │
│  │ SCORE GAUGE     │  │ SCORE BREAKDOWN      │   │
│  │    ┌───┐        │  │ Technical   ████░ 65 │   │
│  │    │72 │        │  │ Projects    ██░░░ 40 │   │
│  │    └───┘        │  │ Resume      █░░░░ 20 │   │
│  │ Employability   │  │ Practical   ░░░░░  0 │   │
│  │ Score           │  │ Interview   ░░░░░  0 │   │
│  └─────────────────┘  └──────────────────────┘   │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │STRENGTHS │ │  GAPS    │ │ PRIORITY │         │
│  │  4 skills│ │ 8 skills │ │ 3 skills │         │
│  │  (green) │ │  (red)   │ │ (amber)  │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│  "View All Skills →"                             │
│                                                  │
│  ROADMAP PREVIEW                                 │
│  ┌────────────────────────────────────────────┐  │
│  │ Next: TypeScript (upcoming)                │  │
│  │ Then: React Testing (upcoming)             │  │
│  │ Then: Performance Optimization (upcoming)  │  │
│  │ "View Full Roadmap →"                      │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  PROJECTS: 1/5 completed  ██░░░░░░░░            │
│  "View Projects →"                               │
│                                                  │
│  QUICK ACTIONS                                   │
│  [Upload Resume] [Practice Interview]            │
│  [View Roadmap]  [Update Skills]                 │
│                                                  │
│  SUGGESTED NEXT STEP                             │
│  ┌────────────────────────────────────────────┐  │
│  │ Focus next: "TypeScript" — high weight,    │  │
│  │ low proficiency. Start learning →          │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Data sources:**
- Score: `getScore()` → final score + 5 dimension breakdown
- Skill summary: `getSkillGap()` → strengths/gaps/priority counts + suggestedNextSkill
- Roadmap preview: `getRoadmap()` → next 2–3 upcoming skill steps
- Projects: project completion count from Supabase

---

### PAGE 4: Skills (`/skills`)

**Goal:** Full skill list for the role. Show proficiency, status, gaps, strengths, priority.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  H1: "Skill Gap Assessment"                      │
│  Role badge: "Frontend Developer"                │
│                                                  │
│  SUMMARY STRIP (3 stat boxes)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │Strengths │ │   Gaps   │ │ Priority │         │
│  │  4       │ │   8      │ │   3      │         │
│  │ (green)  │ │  (red)   │ │ (amber)  │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                  │
│  SUGGESTED NEXT SKILL                            │
│  ┌────────────────────────────────────────────┐  │
│  │ Focus Next: "TypeScript"                   │  │
│  │ Reason: High weight, low proficiency       │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  SKILLS TABLE                                    │
│  ┌──────────┬──────┬──────┬──────┬──────────┐   │
│  │ Skill    │ Diff │Weight│Prof. │ Status    │   │
│  ├──────────┼──────┼──────┼──────┼──────────┤   │
│  │ HTML/CSS │  1   │ 1.0  │ 5/5  │ Strength │   │
│  │ JS       │  1   │ 1.5  │ 5/5  │ Strength │   │
│  │ React    │  2   │ 2.0  │ 4/5  │ Strength │   │
│  │ TypeScript│ 2   │ 1.5  │ 2/5  │ Gap      │   │
│  │ Testing  │  2   │ 1.0  │ 0/5  │ Not started│  │
│  │ ...      │      │      │      │          │   │
│  └──────────┴──────┴──────┴──────┴──────────┘   │
│                                                  │
│  PRIORITY FOCUS (sorted by urgency)              │
│  1. TypeScript (weight 1.5, proficiency 2)       │
│  2. Testing (weight 1.0, proficiency 0)          │
│  3. Performance (weight 1.0, proficiency 0)      │
│                                                  │
│  [Save Proficiency] [View Roadmap →]             │
└──────────────────────────────────────────────────┘
```

**Data source:** Skills from Supabase `skills` table filtered by role. Gap analysis from `analyzeSkillGap()`.

---

### PAGE 5: Roadmap (`/roadmap`)

**Goal:** Visual learning path. Skill blocks + project blocks. Click to expand.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  H1: "Your Career Roadmap"                       │
│  Role badge + "Generated from competency data"   │
│                                                  │
│  STATS: Skills 3 done / 1 next / 8 upcoming     │
│         Projects 1 done / 0 suggested / 4 locked │
│                                                  │
│  SKILL BLOCKS (vertical flow, connected)         │
│                                                  │
│  ┌──────────────┐                                │
│  │ HTML/CSS     │  ✅ Done (green)               │
│  │ Difficulty: 1│                                │
│  └──────┬───────┘                                │
│         │                                        │
│  ┌──────▼───────┐                                │
│  │ JavaScript   │  ✅ Done (green)               │
│  └──────┬───────┘                                │
│         │                                        │
│  ┌──────▼───────┐                                │
│  │ React        │  ✅ Done (green)               │
│  └──────┬───────┘                                │
│         │                                        │
│  ┌──────▼───────┐                                │
│  │ TypeScript   │  🟡 Next (accent)              │
│  └──────┬───────┘                                │
│         │                                        │
│  ┌──────▼───────┐                                │
│  │ Testing      │  ⬜ Upcoming (gray)            │
│  └──────┬───────┘                                │
│         │                                        │
│      ... more ...                                │
│                                                  │
│  PROJECT BLOCKS                                  │
│  ┌────────────────┐ ┌────────────────┐           │
│  │ Personal       │ │ E-commerce     │           │
│  │ Portfolio      │ │ Dashboard      │           │
│  │ ✅ Done        │ │ 🔒 Locked      │           │
│  └────────────────┘ └────────────────┘           │
│                                                  │
│  CLICK ANY BLOCK → Detail panel slides open:     │
│  - Name, difficulty, weight                      │
│  - Current proficiency                           │
│  - Related projects                              │
│  - Suggested resources (placeholder)             │
└──────────────────────────────────────────────────┘
```

**Data source:** `computeRoadmapSteps()` from `lib/roadmap.ts` using Supabase skills + projects.

---

### PAGE 6: Projects (`/projects`)

**Goal:** Browse and track portfolio projects for the role.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  H1: "Portfolio Projects"                        │
│  Role badge + "Build these to boost your score"  │
│                                                  │
│  FILTERS: [All ▾] [Beginner ▾] [Completed ▾]    │
│                                                  │
│  PROJECT CARDS (2–3 column grid)                 │
│  ┌───────────────────┐ ┌───────────────────┐     │
│  │ Personal Portfolio│ │ E-commerce App    │     │
│  │ Beginner (5 pts)  │ │ Intermediate (10) │     │
│  │ "Build a personal │ │ "Build a product  │     │
│  │  website..."      │ │  listing app..."  │     │
│  │                   │ │                   │     │
│  │ Skills: HTML ✅   │ │ Skills: React ✅  │     │
│  │   CSS ✅ JS ✅    │ │   Node ❌ DB ❌   │     │
│  │                   │ │                   │     │
│  │ [✅ Completed]    │ │ [Start Project]   │     │
│  └───────────────────┘ └───────────────────┘     │
│                                                  │
│  PROGRESS: 1/5 completed  ██░░░░░░░░             │
│  Score contribution: 5/100                       │
└──────────────────────────────────────────────────┘
```

**Data source:** Projects from Supabase `projects` table. User progress from `user_projects`.

---

### PAGE 7: Resume (`/resume`)

**Goal:** Upload resume, see analysis, confirm Supabase storage.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  H1: "Resume Analyzer"                           │
│  P: "Upload for ATS analysis and suggestions"    │
│                                                  │
│  UPLOAD AREA                                     │
│  ┌────────────────────────────────────────────┐  │
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │  📄 Drag & drop or click to upload  │   │  │
│  │  │  PDF, DOC, DOCX, JPEG, PNG          │   │  │
│  │  └─────────────────────────────────────┘   │  │
│  │  Selected: new cv.pdf (137.1 KB)           │  │
│  │  [Upload & Analyze]                        │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ANALYSIS RESULT (after upload)                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Score: 50/100  ██████████░░░░░░░░░░      │  │
│  │                                            │  │
│  │  Suggestions:                              │  │
│  │  • Add 2–3 relevant projects               │  │
│  │  • Quantify achievements with numbers      │  │
│  │  • Ensure ATS-friendly formatting          │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  SUCCESS CONFIRMATION (green box)                │
│  ┌────────────────────────────────────────────┐  │
│  │  ✅ Stored in Supabase                     │  │
│  │  File: new cv.pdf                          │  │
│  │  Path: resumes/6b279503-..._new_cv.pdf     │  │
│  │  Uploaded: 26/02/2026, 07:06:35            │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Data source:** `analyzeResume()` stub. Supabase Storage + `resume_uploads` table.

---

### PAGE 8: Interview (`/interview`)

**Goal:** Browse and filter role-specific interview questions.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  H1: "Interview Preparation"                     │
│  P: "Practice role-specific questions"           │
│                                                  │
│  FILTERS                                         │
│  Role: [Frontend Developer ▾]                    │
│  Difficulty: [All ▾]                             │
│                                                  │
│  Showing 4 questions for Frontend Developer      │
│                                                  │
│  QUESTIONS LIST                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ L1  Explain the difference between let,    │  │
│  │     const, and var in JavaScript.          │  │
│  │     [technical]                            │  │
│  ├────────────────────────────────────────────┤  │
│  │ L2  How does React virtual DOM improve     │  │
│  │     performance?                           │  │
│  │     [technical]                            │  │
│  ├────────────────────────────────────────────┤  │
│  │ L2  Describe a time you had to debug a     │  │
│  │     complex frontend issue.                │  │
│  │     [behavioral]                           │  │
│  ├────────────────────────────────────────────┤  │
│  │ L3  How would you optimize a slow-loading  │  │
│  │     SPA?                                   │  │
│  │     [technical]                            │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Data source:** `interview_questions` from Supabase filtered by role + difficulty.

---

### PAGE 9: Profile (`/profile`)

**Goal:** User info, role management, subscription status.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  H1: "Your Profile"                              │
│                                                  │
│  USER INFO CARD                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  (Avatar)  Name: [___________]             │  │
│  │            Email: [___________]            │  │
│  │            [Save]                          │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ROLE                                            │
│  Current: Frontend Developer [Change Role ▾]     │
│  ⚠️ Changing role recalculates roadmap & score.   │
│                                                  │
│  SUBSCRIPTION                                    │
│  Plan: Free                                      │
│  [Upgrade to Premium] (placeholder)              │
│                                                  │
│  ACCOUNT ACTIONS                                 │
│  [Log Out] [Delete Account]                      │
└──────────────────────────────────────────────────┘
```

---

### PAGE 10: Verify (`/verify`) — Dev Only

Already built. Keep as-is for testing.

---

## Global Navigation Bar

```
┌─────────────────────────────────────────────────────────────┐
│ [E] EmployabilityOS v1.0  │ Dashboard │ Skills │ Roadmap │ │
│                            │ Projects │ Resume │ Interview│ │
│                            │ Profile                      │ │
└─────────────────────────────────────────────────────────────┘
```

- Logo: dark square with "E" in accent color
- Active link: accent background
- Mobile: hamburger menu → slide-out sidebar

---

## Supabase Tables (for reference)

| Table | Key Columns | Used By Page |
|-------|------------|--------------|
| `users` | id, name, email, role_selected, subscription_type | Profile |
| `skills` | id, name, role, difficulty, weight | Skills, Roadmap, Dashboard, Onboarding |
| `user_skills` | user_id, skill_id, proficiency | Skills, Dashboard, Roadmap |
| `projects` | id, title, role, difficulty, required_skills, evaluation_criteria, description | Projects, Roadmap |
| `user_projects` | user_id, project_id, completed | Projects, Dashboard |
| `scores` | user_id, technical, projects, resume, practical, interview, final_score | Dashboard |
| `interview_questions` | question_text, role, difficulty_level, category | Interview |
| `resume_uploads` | file_name, storage_path, file_type, file_size, analysis_score | Resume |
| `user_roadmap` | user_id, roadmap_json | Roadmap |

**Storage:** `documents` bucket for resume files.

---

## Score Weights (constant across app)

| Dimension | Weight | Displayed On |
|-----------|--------|-------------|
| Technical Skills | 40% | Dashboard, Score breakdown |
| Projects & Portfolio | 20% | Dashboard, Projects page |
| Resume Quality | 15% | Dashboard, Resume page |
| Practical Experience | 15% | Dashboard |
| Interview Readiness | 10% | Dashboard, Interview page |

---

## Key UX Patterns

1. **Score gauge on Dashboard** — circular ring or arc, large number in center (JetBrains Mono), color based on value.
2. **Roadmap blocks** — vertical flow of rectangles connected by lines (like roadmap.sh). Click to expand detail.
3. **Skill table** — sortable/filterable. Proficiency shown as dots or slider. Status as color badge.
4. **Project cards** — title, difficulty badge, description, required skills as tags (green = have, red = missing), completion button.
5. **Resume dropzone** — styled upload area with drag-and-drop. Result shows score + suggestions list.
6. **Interview list** — clean card per question with difficulty badge (L1/L2/L3) and category tag.
7. **Filter bars** — consistent placement: below page header, above content. Dropdowns or pill buttons.
8. **Empty states** — friendly message + action (e.g. "No skills rated yet. Start on the Onboarding page.").
9. **Loading states** — skeleton placeholders or spinner + "Loading..." text.
10. **Error states** — red card with error message + guidance text.

---

## What to Build (Priority Order)

1. **Landing** — hero + features + CTA (static, no backend)
2. **Onboarding** — role cards + skill self-assessment (reads `skills` from Supabase)
3. **Dashboard** — score gauge + breakdown + skill summary + roadmap preview + quick actions
4. **Skills** — gap analysis table + summary strip + priority list
5. **Roadmap** — block diagram + detail panels
6. **Projects** — project cards + filters + completion
7. **Resume** — upload + analysis + confirmation (already partially built)
8. **Interview** — question list + filters (already partially built)
9. **Profile** — user info + role + subscription
10. **Layout** — polish nav bar + footer + mobile responsiveness

---

## Important Notes

- **No auth system yet.** All pages are open. User state (selected role, skill ratings) stored in React Context or localStorage.
- **All data is dynamic from Supabase.** No hardcoded skill names, project titles, or question text.
- **The backend functions exist.** Frontend just needs to call them and display the results beautifully.
- **Resume upload already works.** Just needs a nicer UI (dropzone instead of raw file input).
- **Interview page already works.** Just needs better styling (cards, badges, spacing).
- **The Verify page (`/verify`) stays as-is** — it's for development testing only.

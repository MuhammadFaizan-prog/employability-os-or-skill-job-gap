# EmployabilityOS — UI Structure & Page Blueprint

> This document defines **what each page should contain** — sections, elements, buttons, inputs, data displays.
> Use this as a wireframe guide: you know exactly what goes where. Design however you want.

---

## Color Palette (from PRD)

| Token | Hex | Usage |
|-------|-----|-------|
| Dark (primary text/bg) | `#152219` | Headings, nav, buttons |
| Light (page bg) | `#EAECE9` | Backgrounds |
| Accent (green) | `#9BBF89` | Highlights, badges, progress |
| White | `#FFFFFF` | Cards, inputs |

**Fonts:** Inter (body), JetBrains Mono (code/scores)
**Stack hint:** Tailwind CSS + shadcn/ui (per README tech stack)

---

## Global Layout (all pages share this)

**Route:** Wraps all pages via `<Layout />`

### Top Navigation Bar
- **Left:** Logo + app name "EmployabilityOS" + version badge (v1.0)
- **Right:** Nav links — Landing, Dashboard, Skills, Roadmap, Projects, Resume, Interview, Profile
- **Active link:** Highlighted (accent color)
- **Mobile:** Hamburger menu / collapsible sidebar

### Footer (optional, minimal)
- "EmployabilityOS" + copyright

---

## Page 1: Landing / Welcome Page

**Route:** `/`
**Purpose:** First impression. Convince user to sign up or get started.
**Backend:** None yet (no auth). For now, links to `/onboarding`.

### Sections (top to bottom)

1. **Hero Section**
   - Large heading: "Bridge the Skill–Job Gap"
   - Subheading: "Measure and improve your job readiness with a real-time Employability Score."
   - **CTA button:** "Get Started" → links to `/onboarding`
   - Optional: secondary link "Explore Dashboard" → `/dashboard`

2. **How It Works (3–4 steps)**
   - Step cards in a row (icon + title + short text):
     - "1. Choose Your Role" — Select your target career path
     - "2. Assess Your Skills" — See where you stand
     - "3. Follow Your Roadmap" — Structured learning path
     - "4. Track Your Score" — Watch your employability grow

3. **Core Features Grid (2×3 or 3×2 cards)**
   - Each card: icon + title + one-liner
     - Employability Score (0–100 dynamic score)
     - Skill Gap Analysis (strengths vs gaps)
     - Career Roadmap (ordered skills + projects)
     - Project Builder (role-specific portfolio projects)
     - Resume Analyzer (upload + feedback)
     - Interview Prep (role-based question bank)

4. **Score Preview / Teaser**
   - Show a mockup or demo of the score gauge (e.g. 72/100)
   - Breakdown: Technical 40%, Projects 20%, Resume 15%, Practical 15%, Interview 10%
   - Text: "Your score updates dynamically as you progress."

5. **CTA Footer**
   - "Ready to start?" + button "Get Started Free" → `/onboarding`

---

## Page 2: Onboarding / Role Selection

**Route:** `/onboarding`
**Purpose:** User picks their target career role. Optional skill self-assessment.
**Backend:** Reads roles from `skills` table (distinct roles). Later: creates user record.

### Sections

1. **Heading**
   - "Choose Your Career Goal"
   - Subtext: "We'll build your personalized roadmap based on this."

2. **Role Selector (radio cards or big clickable cards)**
   - One card per role. Each shows:
     - Role name (e.g. "Frontend Developer")
     - Short description (1 line)
     - Number of skills in framework (e.g. "12 skills")
     - Number of projects (e.g. "5 projects")
   - **Roles available:** Frontend Developer, Backend Developer, Data Analyst
   - Selected card gets accent border/highlight

3. **Optional: Quick Skill Self-Assessment**
   - After role is selected, show top 5–6 skills for that role
   - Each skill: name + slider or dropdown (1–5 proficiency)
   - Label: "Rate your current level (1 = Beginner, 5 = Expert)"
   - Skip button: "Skip for now"

4. **Submit Button**
   - "Start My Journey" → navigates to `/dashboard`
   - If self-assessment filled: saves to state/context (later: Supabase `user_skills`)

---

## Page 3: Dashboard (Central Hub)

**Route:** `/dashboard`
**Purpose:** Overview of everything. The "home base" after onboarding.
**Backend:** `getScore()`, `getSkillGap()`, `getRoadmap()` from `src/api/index.ts`; all from Supabase.

### Sections

1. **Welcome Header**
   - "Welcome back" (or "Your Dashboard")
   - Selected role badge (e.g. "Frontend Developer")
   - Last updated timestamp

2. **Employability Score Card (hero/prominent)**
   - Large circular gauge or progress ring: **Final Score** (0–100)
   - Font: JetBrains Mono, large
   - Color: green (>70), yellow (40–70), red (<40)
   - Below gauge: "Your Employability Score"

3. **Score Breakdown (5 dimensions)**
   - Horizontal bar chart or 5 mini progress bars, each labeled:
     - Technical Skills — 40% weight — bar shows current value
     - Projects & Portfolio — 20%
     - Resume Quality — 15%
     - Practical Experience — 15%
     - Interview Readiness — 10%
   - Each bar: label + value (e.g. "Technical: 65/100") + weight tag

4. **Skill Progress Summary**
   - Small card or section:
     - "Strengths: X skills" (green)
     - "Gaps: Y skills" (red/orange)
     - "Priority Focus: Z skills"
   - Link: "View All Skills →" → `/skills`

5. **Roadmap Preview**
   - Show next 2–3 upcoming roadmap items (skill name + status badge)
   - Link: "View Full Roadmap →" → `/roadmap`

6. **Project Status**
   - "X / Y projects completed"
   - Mini progress bar
   - Link: "View Projects →" → `/projects`

7. **Quick Actions Row (buttons/links)**
   - "Upload Resume" → `/resume`
   - "Practice Interview" → `/interview`
   - "View Roadmap" → `/roadmap`
   - "Update Skills" → `/skills`

8. **Suggested Next Step**
   - One highlighted card: "Next: Learn [skill name]" or "Build [project name]"
   - Based on `suggestedNextSkill` from skill gap analysis

---

## Page 4: Skills / Skill Gap Page

**Route:** `/skills`
**Purpose:** View all skills for the selected role, see proficiency, identify gaps and strengths.
**Backend:** `analyzeSkillGap()` from `src/engine/skillGap.ts`; skills from Supabase.

### Sections

1. **Page Header**
   - "Skill Gap Assessment"
   - Role badge: "Frontend Developer"
   - Subtext: "See where you stand against role requirements."

2. **Summary Strip**
   - Three stat boxes in a row:
     - Strengths count (green) — proficiency 4–5
     - Gaps count (red/orange) — proficiency 0–2
     - Priority Focus count (amber) — high-weight + low proficiency

3. **Suggested Next Skill (highlight card)**
   - "Focus Next: [Skill Name]"
   - Why: "High weight, low proficiency"
   - Button: "Mark as Learning" (future: updates `user_skills`)

4. **Skills Table / List**
   - One row per skill for the role. Columns:
     - Skill name
     - Difficulty badge (1/2/3 or Beginner/Intermediate/Advanced)
     - Weight (e.g. "1.5")
     - Your proficiency: editable slider or dropdown (1–5), or display-only for now
     - Status badge: "Strength" (green) / "Gap" (red) / "Improving" (yellow) / "Not started" (gray)
   - Sort/filter: by difficulty, by status, by weight

5. **Priority Focus List**
   - Separate section or highlighted rows
   - Skills sorted by priority (highest weight + lowest proficiency first)
   - Each shows: skill name + current proficiency + target (5) + weight

6. **Action Button**
   - "Save Proficiency" (future: saves to Supabase `user_skills`)
   - "View Roadmap for This Role" → `/roadmap`

---

## Page 5: Roadmap Page

**Route:** `/roadmap`
**Purpose:** Visual learning path — ordered skills and projects for the role.
**Backend:** `generateRoadmap()` / `computeRoadmapSteps()` from `src/roadmap/generator.ts`; data from Supabase.

### Sections

1. **Page Header**
   - "Your Career Roadmap"
   - Role badge
   - "Generated from your current skills and the role competency framework."

2. **Roadmap Diagram (main visual)**
   - Vertical or horizontal flow of **skill blocks** (like roadmap.sh):
     - Each block: skill name + difficulty badge
     - Color by status:
       - Done (green) — proficiency >= 4
       - Next (accent/yellow) — the current focus
       - Upcoming (gray) — not yet started
     - Blocks connected by lines/arrows showing order
   - **Click a block** → expands/opens a detail panel:
     - Skill name, difficulty, weight
     - Current proficiency
     - Suggested resources (placeholder for now)
     - Related projects

3. **Projects Section (below skills)**
   - Project blocks (similar visual):
     - Done (green), Suggested (accent), Locked (gray)
     - Each shows: title, difficulty, required skills list
   - **Click a project** → detail panel:
     - Title, description, difficulty
     - Required skills (with status: have / don't have)
     - Evaluation criteria
     - "Mark as Complete" button (future)

4. **Roadmap Summary Stats**
   - "Skills: X done / Y next / Z upcoming"
   - "Projects: A done / B suggested / C locked"
   - Progress bar

5. **Export / Share (future)**
   - "Download Roadmap" button (placeholder)

---

## Page 6: Projects Page

**Route:** `/projects`
**Purpose:** Browse and track role-specific portfolio projects.
**Backend:** Projects from Supabase `projects` table; user progress from `user_projects`.

### Sections

1. **Page Header**
   - "Portfolio Projects"
   - Role badge
   - "Build these projects to boost your Employability Score."

2. **Filter Bar**
   - Difficulty filter: All / Beginner (1) / Intermediate (2) / Advanced (3)
   - Status filter: All / Completed / In Progress / Not Started

3. **Project Cards Grid (2 or 3 columns)**
   - Each card:
     - Title (bold)
     - Difficulty badge (color-coded: green/yellow/red)
     - Description (2–3 lines)
     - Required skills (tags/chips — green if user has, red if missing)
     - Evaluation criteria (collapsible or tooltip)
     - Points value: Beginner = 5, Intermediate = 10, Advanced = 20
     - Status toggle: "Not Started" / "In Progress" / "Completed"
     - **Button:** "Mark Complete" or "Start Project"

4. **Progress Summary**
   - "X / Y projects completed"
   - "Projects score contribution: Z/100"
   - Progress bar

---

## Page 7: Resume Analyzer Page

**Route:** `/resume`
**Purpose:** Upload resume, get analysis and suggestions. File stored in Supabase.
**Backend:** `analyzeResume()` stub; Supabase Storage (`documents` bucket) + `resume_uploads` table.

### Sections

1. **Page Header**
   - "Resume Analyzer"
   - "Upload your resume for ATS analysis and improvement suggestions."

2. **Upload Section**
   - File input (styled as a dropzone or button):
     - Accepted: PDF, DOC, DOCX, JPEG, PNG, WebP, GIF
     - Label: "Choose resume file" or drag-and-drop area
   - Selected file info: file name + size
   - **Button:** "Upload & Analyze" (disabled until file selected)
   - Loading state: "Uploading..."

3. **Analysis Result (appears after upload)**
   - **Score display:** Large number (e.g. 50/100) with color
   - **Score bar:** Visual progress bar for resume score
   - **Suggestions list:**
     - Bullet points with improvement tips:
       - "Add 2–3 projects relevant to your target role."
       - "Quantify achievements with numbers where possible."
       - "Ensure ATS-friendly formatting (clear headings, no graphics)."
   - Each suggestion: icon + text

4. **Upload Confirmation (success state)**
   - Green box: "Stored in Supabase"
   - Details: file name, storage path, uploaded timestamp
   - "Your file is saved in Supabase Storage (bucket: documents) and a row was added to the resume_uploads table."

5. **Upload History (future)**
   - List of previously uploaded resumes
   - Each: file name, date, score, "Re-analyze" button

6. **Error State**
   - Red box: error message
   - Guidance: "Ensure the Supabase bucket documents allows your file type..."

---

## Page 8: Interview Prep Page

**Route:** `/interview`
**Purpose:** Browse role-specific interview questions by difficulty.
**Backend:** `interview_questions` from Supabase.

### Sections

1. **Page Header**
   - "Interview Preparation"
   - "Practice role-specific questions to boost your interview readiness."

2. **Filter Bar**
   - **Role selector:** Dropdown — Frontend Developer / Backend Developer / Data Analyst
   - **Difficulty selector:** All / Easy (1) / Medium (2) / Hard (3)
   - Filters update the list dynamically

3. **Questions Count**
   - "Showing X questions for [Role] — Difficulty: [All/Easy/Medium/Hard]"

4. **Questions List**
   - Each question card/row:
     - Difficulty badge (left): L1 / L2 / L3 (color-coded)
     - Question text (main content)
     - Category tag (if available): "technical" / "behavioral" / "practical"
   - Clean, readable list (no clutter)

5. **Question Detail (click to expand, future)**
   - Hint / sample answer (placeholder)
   - "Mark as Practiced" toggle
   - Notes field

6. **Progress Summary (future)**
   - "X / Y questions practiced"
   - Progress bar for interview readiness

7. **Empty State**
   - "No questions found. Seed interview_questions table."
   - Link to docs or SQL file

---

## Page 9: Profile / Settings Page

**Route:** `/profile`
**Purpose:** User info, role selection, settings.
**Backend:** `users` table (future). For now, display/edit local state.

### Sections

1. **Page Header**
   - "Your Profile"

2. **User Info Card**
   - Avatar placeholder (circle with initials)
   - Name field (text input, editable)
   - Email field (text input, editable)
   - "Save" button

3. **Role Selection**
   - Current role displayed as badge
   - "Change Role" dropdown or card selector
   - Warning: "Changing role will recalculate your roadmap and score."

4. **Subscription Status**
   - Badge: "Free" or "Premium"
   - Description of current plan
   - **Button:** "Upgrade to Premium" (placeholder, links nowhere for now)

5. **Resume Management (future)**
   - List of uploaded resumes
   - "Upload New Resume" → `/resume`

6. **Account Actions**
   - "Delete Account" (placeholder, dangerous action styling)
   - "Log Out" (placeholder)

---

## Page 10: Verify Page (Dev / Testing)

**Route:** `/verify`
**Purpose:** Dynamic verification of all implementation steps against Supabase. Dev-only.
**Backend:** All verify handlers (Steps 1–8).

### Sections

1. **Page Header**
   - "Verify Steps 1–8"
   - "Dynamic verification against Supabase (skilljob)"

2. **Score Weights Display**
   - List: technical 40%, projects 20%, resume 15%, practical 15%, interview 10%

3. **Verify Buttons (one per step)**
   - "Verify Step 1 (Supabase)"
   - "Verify Step 2 (competency data)"
   - "Verify Step 3 (score engine)"
   - "Verify Step 4 (skill gap)"
   - "Verify Step 5 (roadmap)"
   - "Load Roadmap" (shows diagram)
   - "Verify Step 6 (resume)"
   - "Verify Step 7 (interview)"
   - "Verify Step 8 (API surface)"
   - Each button: disabled while any is loading

4. **Results Area**
   - After each click: success (green) or error (red) box
   - Shows: message + details (counts, breakdowns, etc.)
   - Roadmap diagram (if loaded)

5. **Console Section**
   - "No console errors or warnings." (green) or list of errors/warnings

---

## Route ↔ Step ↔ Functionality Map

| Route | Page Name | Related Steps | Key Functionality |
|-------|-----------|---------------|-------------------|
| `/` | Landing | — | Hero, features, CTA |
| `/onboarding` | Onboarding | Step 2 | Role selection, optional skill self-assessment |
| `/dashboard` | Dashboard | Steps 3, 4, 5 | Score gauge, breakdown, skill summary, roadmap preview, next step |
| `/skills` | Skills | Step 4 | Skill list, gap analysis, strengths/gaps, priority focus |
| `/roadmap` | Roadmap | Step 5 | Visual roadmap diagram (blocks), skill/project steps |
| `/projects` | Projects | Step 2, 3 | Project cards, difficulty filter, completion toggle |
| `/resume` | Resume | Step 6 | File upload, analysis result, Supabase storage confirmation |
| `/interview` | Interview | Step 7 | Question list, role/difficulty filter |
| `/profile` | Profile | Step 1 | User info, role, subscription |
| `/verify` | Verify (dev) | Steps 1–8 | All verification buttons |

---

## Design Guidelines

1. **Cards everywhere** — each data item (skill, project, question) is a card
2. **Color = status** — green (done/strength), yellow/accent (next/in-progress), red (gap/error), gray (upcoming/locked)
3. **Badges for metadata** — difficulty, role, status, category
4. **Progress bars** — score dimensions, project completion, skills done
5. **Large score display** — the Employability Score is the hero metric; make it visually dominant
6. **Responsive** — mobile-first, cards stack vertically on small screens
7. **Minimal** — no clutter; PRD says "measurable progress", so data should breathe
8. **Consistent spacing** — use Tailwind's spacing scale (4, 6, 8, 12, 16, 20)

---

## What Does NOT Need a Page (yet)

- **Auth (login/signup):** No auth system yet; Landing page has placeholder CTA
- **Notifications / Milestones:** Phase 2
- **Gamification / Badges:** Phase 2
- **Mentor / Peer Feedback:** Phase 2
- **Job Matching:** Phase 2
- **Payment / Subscription flow:** Phase 2

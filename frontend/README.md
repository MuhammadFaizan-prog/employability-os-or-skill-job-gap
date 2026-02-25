# EmployabilityOS — Frontend (Step 1)

React + Vite + TypeScript app. **Step 1** verifies types and Supabase (skilljob project) connection.

## Setup

1. **Copy env and add your Supabase keys (skilljob project):**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `VITE_SUPABASE_URL` — `https://tkrqfwaszfzkkrkrtbyi.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` — from [Supabase Dashboard](https://supabase.com/dashboard/project/tkrqfwaszfzkkrkrtbyi/settings/api) → Project API → anon public

2. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:5173

3. **Verify Step 1:** Click **"Verify Step 1 (Supabase)"**. You should see success and table/skills info from the skilljob database.

## Scripts

- `npm run dev` — dev server (localhost)
- `npm run build` — production build
- `npm run preview` — preview production build

## Android App (EmployabilityOS / Skill Job Gap)

This folder contains the **Android** implementation of the EmployabilityOS / Skill Job Gap app.

- **Language**: Kotlin
- **UI**: XML layouts (no Compose), designed to mirror the existing web UI pixel-for-pixel as closely as the platform allows.
- **Backend**: Shared Supabase project (same database, tables, RLS, and RPCs as the web app).

### Project structure (initial skeleton)

- `android-app/` — Android-only project root (does not modify the existing `frontend/` web app).
  - `settings.gradle.kts` — Includes the `:app` module.
  - `build.gradle.kts` — Root Gradle configuration for the Android project.
  - `app/` — Main Android application module.
    - `build.gradle.kts` — Module-level config (applicationId, SDK versions, dependencies).
    - `src/main/AndroidManifest.xml` — Manifest with single-activity setup.
    - `src/main/java/.../MainActivity.kt` — Host activity for Navigation.
    - `src/main/res/layout/activity_main.xml` — Root container for fragments and nav host.

When opening this project in Android Studio, open the `android-app/` directory as a standalone Gradle project so it remains isolated from the web app.

### Supabase configuration (env credentials = frontend)

The app uses the same Supabase project and env credentials as the web app (`frontend/.env`). Values are set in `gradle.properties`:

- `SUPABASE_URL` — same as `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` — same as `VITE_SUPABASE_ANON_KEY`

They are injected into BuildConfig and used by `EmployabilityApp` to configure `SupabaseClient` at startup. To override locally without committing (e.g. for a different project), add to `android-app/local.properties` (this file is gitignored):

- `supabase.url=https://your-project.supabase.co`
- `supabase.anonKey=your_anon_key`

### Data layer

- data/SupabaseClient.kt — OkHttp-based Supabase REST client (auth, PostgREST, storage).
- data/SupabaseModels.kt — Kotlin data classes for all Supabase tables.
- Repositories: AuthRepository, RoleDataRepository, ResumeRepository, InterviewRepository, ProfileRepository — mirror web hooks and perform all reads/writes via SupabaseClient.


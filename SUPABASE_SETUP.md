# Supabase Setup

This app can store your budget in the cloud (Supabase) behind a login, instead
of only in your browser. Until you add your keys, it keeps working exactly as
before — local-only, no login. Once the keys are set, it requires a login and
syncs your data to the cloud.

## 1. Create a Supabase project (~5 min, in your browser)

1. Go to **https://supabase.com** and sign up (free).
2. Click **New Project**. Name it `family-budget`, set a database password
   (save it), pick a region near you, and create it.
3. Wait ~2 minutes for it to finish provisioning.

## 2. Create the database table

1. In your project, open **SQL Editor → New query**.
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   This creates the `budgets` table and locks it down so a logged-in user can
   only ever read/write their own data.

## 3. Create your shared login

Since you chose one shared login for both of you:

- **Option A (recommended):** In Supabase, go to **Authentication → Users →
  Add user**, and create the one account you'll both use (email + password).
- **Option B:** Use the **Create account** link on the app's login screen once,
  then (optionally) turn off public sign-ups in **Authentication → Providers →
  Email** so no one else can register.

> Tip: To skip email confirmation for a personal app, go to
> **Authentication → Providers → Email** and turn **Confirm email** off.

## 4. Add your keys to the app

1. In Supabase, go to **Settings → API** and copy your **Project URL** and
   **anon public** key.
2. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Paste your values into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   `.env.local` is gitignored, so these never get committed.
4. Restart the dev server (`npm run dev`) so it picks up the new values.

## 5. Use it

- Open the app — you'll now see a **login screen**.
- Sign in with the shared account.
- The first time you log in, your current local budget is copied up to the
  cloud. After that, every edit auto-saves (with a short debounce), and logging
  in from any device/browser loads the same data.

## Notes

- The **anon key is safe to ship** in the frontend — row-level security (from
  the SQL in step 2) is what actually protects your data, not the key.
- Free Supabase projects **pause after ~7 days of inactivity**. Your data is
  not deleted; just open the dashboard and restore it.
- Your browser's localStorage is still used as an offline cache, so the app
  keeps showing your last-known data even if you're briefly offline.

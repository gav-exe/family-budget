import { createClient } from '@supabase/supabase-js';

// These come from your Supabase project: Settings -> API.
// Put them in a .env.local file (which is gitignored) as:
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// When the keys aren't set, the app quietly falls back to local-only mode
// (data stays in the browser, no login) so nothing breaks before setup.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Frontend Supabase client used for Documents + Organogram CRUD.
 *
 * Configuration is read from Vite-exposed env vars:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 *
 * When either is missing, `getSupabase()` returns null and the calling code
 * should gracefully fall back to localStorage (offline mode).
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabase(): SupabaseClient | null {
  return client;
}

export function isSupabaseConfigured(): boolean {
  return client !== null;
}

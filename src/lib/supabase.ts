import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let client: SupabaseClient | null = null;

/**
 * Singleton Supabase client. Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * to be set in `.env` (Supabase project → Settings → API).
 *
 * Reads/writes are scoped by the signed-in user's JWT via Row Level Security, so
 * each account only ever sees its own rows.
 */
export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    );
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

/** Resolve the signed-in user's id, or null when logged out. */
export async function currentUid(): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
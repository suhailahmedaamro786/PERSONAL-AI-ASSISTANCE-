import { getSupabase, currentUid } from '../lib/supabase';

/**
 * Generic per-user CRUD against the Supabase `user_data` table.
 * Each row is scoped to the signed-in user via Row Level Security.
 * Entities are stored whole as `data` jsonb keyed by (kind, id).
 */

async function ownerId(): Promise<string> {
  const u = await currentUid();
  if (!u) throw new Error('Not authenticated');
  return u;
}

/** List all rows of a kind, newest first. */
export async function listKind<T>(kind: string): Promise<T[]> {
  const u = await ownerId();
  const { data, error } = await getSupabase()
    .from('user_data')
    .select('data')
    .eq('user_id', u)
    .eq('kind', kind)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => r.data as T);
}

/** Find a single row. */
async function findKind<T>(kind: string, id: string): Promise<T> {
  const u = await ownerId();
  const { data, error } = await getSupabase()
    .from('user_data')
    .select('data')
    .eq('kind', kind)
    .eq('user_id', u)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`${kind} record ${id} not found`);
  return data.data as T;
}

/** Insert a full entity (must already carry its `id`). */
export async function createKind<T extends { id: string }>(kind: string, entity: T): Promise<T> {
  const u = await ownerId();
  const { error } = await getSupabase().from('user_data').insert({
    kind,
    id: entity.id,
    user_id: u,
    data: entity,
  });
  if (error) throw error;
  return entity;
}

/** Merge a patch into an existing row and persist the result. */
export async function updateKind<T extends { id: string }>(
  kind: string,
  id: string,
  patch: Partial<T>,
): Promise<T> {
  const u = await ownerId();
  const existing = await findKind<T>(kind, id);
  const merged = { ...existing, ...patch };
  const { error } = await getSupabase()
    .from('user_data')
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq('kind', kind)
    .eq('id', id)
    .eq('user_id', u);
  if (error) throw error;
  return merged;
}

/** Delete one row. */
export async function deleteKind(kind: string, id: string): Promise<void> {
  const u = await ownerId();
  const { error } = await getSupabase()
    .from('user_data')
    .delete()
    .eq('kind', kind)
    .eq('id', id)
    .eq('user_id', u);
  if (error) throw error;
}

/** Delete all rows of a kind (used for bulk ops like mark-all-read). */
export async function clearKind(kind: string): Promise<void> {
  const u = await ownerId();
  const { error } = await getSupabase()
    .from('user_data')
    .delete()
    .eq('kind', kind)
    .eq('user_id', u);
  if (error) throw error;
}
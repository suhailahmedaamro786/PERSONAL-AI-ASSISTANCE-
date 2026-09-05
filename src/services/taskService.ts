import type {
  CreateTaskInput,
  Priority,
  RecurrencePattern,
  Status,
  Task,
  TaskCategory,
  TaskSource,
} from '../types';
import { getSupabase, currentUid } from '../lib/supabase';

/**
 * Task persistence backed by Supabase (per-user via RLS on the `tasks` table).
 * Public method signatures are unchanged so `taskStore`, the AI coach and the
 * email task sync keep working without modification.
 */

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  deadline: string | null;
  due_time: string | null;
  created_at: string;
  updated_at: string;
  estimated_minutes: number;
  actual_minutes: number | null;
  recurrence: string | null;
  tags: unknown;
  source: string;
  linked_job_id: string | null;
  linked_course_id: string | null;
  ord: number;
}

function mapRow(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    priority: r.priority as Priority,
    status: r.status as Status,
    category: r.category as TaskCategory,
    deadline: r.deadline ?? null,
    dueTime: r.due_time ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    estimatedMinutes: r.estimated_minutes,
    actualMinutes: r.actual_minutes,
    recurrence: (r.recurrence as RecurrencePattern) ?? null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    source: (r.source as TaskSource) ?? 'user',
    linkedJobId: r.linked_job_id ?? null,
    linkedCourseId: r.linked_course_id ?? null,
    order: r.ord,
  };
}

interface TaskInsert {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  deadline: string | null;
  due_time: string | null;
  created_at: string;
  updated_at: string;
  estimated_minutes: number;
  actual_minutes: number | null;
  recurrence: string | null;
  tags: unknown;
  source: string;
  linked_job_id: string | null;
  linked_course_id: string | null;
  ord: number;
}

function mapInsert(input: CreateTaskInput, uid: string, id: string, now: string): TaskInsert {
  return {
    id,
    user_id: uid,
    title: input.title,
    description: input.description ?? '',
    priority: input.priority,
    status: input.status ?? 'todo',
    category: input.category,
    deadline: input.deadline ?? null,
    due_time: input.dueTime ?? input.deadline ?? null,
    created_at: input.createdAt ?? now,
    updated_at: input.updatedAt ?? now,
    estimated_minutes: input.estimatedMinutes ?? 0,
    actual_minutes: input.actualMinutes ?? null,
    recurrence: input.recurrence ?? null,
    tags: input.tags ?? [],
    source: input.source ?? 'user',
    linked_job_id: input.linkedJobId ?? null,
    linked_course_id: input.linkedCourseId ?? null,
    ord: input.order ?? 0,
  };
}

/** Map a camelCase Task (partial) patch to snake_case DB columns. */
function toPatch(p: Partial<Task>): Record<string, unknown> {
  const col: Record<string, unknown> = {};
  if ('title' in p) col.title = p.title;
  if ('description' in p) col.description = p.description;
  if ('priority' in p) col.priority = p.priority;
  if ('status' in p) col.status = p.status;
  if ('category' in p) col.category = p.category;
  if ('deadline' in p) col.deadline = p.deadline;
  if ('dueTime' in p) col.due_time = p.dueTime;
  if ('estimatedMinutes' in p) col.estimated_minutes = p.estimatedMinutes;
  if ('actualMinutes' in p) col.actual_minutes = p.actualMinutes;
  if ('recurrence' in p) col.recurrence = p.recurrence;
  if ('tags' in p) col.tags = p.tags;
  if ('source' in p) col.source = p.source;
  if ('linkedJobId' in p) col.linked_job_id = p.linkedJobId;
  if ('linkedCourseId' in p) col.linked_course_id = p.linkedCourseId;
  if ('order' in p) col.ord = p.order;
  col.updated_at = new Date().toISOString();
  return col;
}

async function ensureUid(): Promise<string> {
  const uid = await currentUid();
  if (!uid) throw new Error('Not authenticated');
  return uid;
}

export async function getTasks(): Promise<Task[]> {
  const uid = await ensureUid();
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('*')
    .eq('user_id', uid)
    .order('ord', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const uid = await ensureUid();
  const now = new Date().toISOString();
  const id = input.id ?? `task_${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await getSupabase()
    .from('tasks')
    .insert(mapInsert(input, uid, id, now))
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as TaskRow);
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task> {
  await ensureUid();
  const { data, error } = await getSupabase()
    .from('tasks')
    .update(toPatch(patch))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error('Task not found');
  return mapRow(data as TaskRow);
}

export async function deleteTask(id: string): Promise<void> {
  await ensureUid();
  const { error } = await getSupabase().from('tasks').delete().eq('id', id);
  if (error) throw error;
}

/** Reassign `ord` 0..n for the given ordered ids, scoped to the current user. */
export async function reorderTasks(ids: string[]): Promise<Task[]> {
  const uid = await ensureUid();
  const supabase = getSupabase();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from('tasks')
      .update({ ord: i, updated_at: new Date().toISOString() })
      .eq('id', ids[i])
      .eq('user_id', uid);
    if (error) throw error;
  }
  return getTasks();
}

export async function bulkUpdate(ids: string[], patch: Partial<Task>): Promise<Task[]> {
  await ensureUid();
  if (ids.length === 0) return [];
  const { error } = await getSupabase()
    .from('tasks')
    .update(toPatch(patch))
    .in('id', ids);
  if (error) throw error;
  return getTasks();
}
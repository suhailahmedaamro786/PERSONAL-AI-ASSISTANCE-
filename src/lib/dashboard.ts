import { useTaskStore } from '../store/taskStore';
import type { Task } from '../types';

export interface DashboardStats {
  tasksCompleted: number;
  tasksDelta: number;
  overdueCount: number;
  overdueDelta: number;
  totalEstimatedHours: number;
}

export function computeStats(): DashboardStats {
  const tasks = useTaskStore.getState().tasks;
  const now = Date.now();

  const completed = tasks.filter((t) => t.status === 'done').length;
  const overdue = tasks.filter(
    (t) =>
      t.status !== 'done' &&
      t.status !== 'cancelled' &&
      t.deadline != null &&
      new Date(t.deadline).getTime() < now,
  ).length;
  const totalMinutes = tasks
    .filter((t) => t.status !== 'cancelled')
    .reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);

  const completionRate = tasks.length ? completed / tasks.length : 0;
  const tasksDelta = Math.round(completionRate * 30 - 3);
  const overdueDelta = overdue > 0 ? -Math.min(25, 5 + overdue * 4) : 12;

  return {
    tasksCompleted: completed,
    tasksDelta: Math.max(-20, Math.min(40, tasksDelta)),
    overdueCount: overdue,
    overdueDelta,
    totalEstimatedHours: Math.round((totalMinutes / 60) * 10) / 10,
  };
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dayIndex(date: Date): number {
  // Sunday=0 .. Saturday=6 -> shift to Mon=0
  return (date.getDay() + 6) % 7;
}

function weekStart(): Date {
  const now = new Date();
  const w = new Date(now);
  w.setHours(0, 0, 0, 0);
  w.setDate(now.getDate() - now.getDay() + 1); // Monday
  return w;
}

function readPersistedTasks(): Task[] {
  // Tasks are now fetched from Supabase into the task store; never read the old
  // localStorage key (which held shared demo data).
  return useTaskStore.getState().tasks;
}

export function getWeeklyTaskData(tasks: Task[] = readPersistedTasks()) {
  const base = DAY_LABELS.map((day) => ({ day, completed: 0, added: 0 }));
  const w = weekStart();
  for (const t of tasks) {
    const created = t.createdAt ? new Date(t.createdAt) : null;
    const updated = t.updatedAt ? new Date(t.updatedAt) : null;
    if (created && created >= w) base[dayIndex(created)].added += 1;
    if (updated && t.status === 'done' && updated >= w) {
      base[dayIndex(updated)].completed += 1;
    }
  }
  return base;
}

export function getCategorySplit(tasks: Task[] = readPersistedTasks()) {
  const count = new Map<string, number>();
  for (const t of tasks) {
    count.set(t.category, (count.get(t.category) || 0) + 1);
  }
  return Array.from(count.entries())
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: 'var(--color-brand)',
    }))
    .filter((c) => c.value > 0);
}

export function getWeeklyLearningHours(tasks: Task[] = readPersistedTasks()) {
  const base = DAY_LABELS.map((day) => ({ day, hours: 0 }));
  const w = weekStart();
  for (const t of tasks) {
    if (t.status !== 'done') continue;
    const updated = t.updatedAt ? new Date(t.updatedAt) : null;
    if (!updated || updated < w) continue;
    const hours = (t.actualMinutes ?? t.estimatedMinutes ?? 0) / 60;
    base[dayIndex(updated)].hours += hours;
  }
  return base;
}
import {
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from 'date-fns';
import type { Priority, Task } from '../types';
import { PRIORITY_ORDER } from '../types/common';
import type { TaskFilter, TaskView } from '../store/taskStore';

export const priorityTone = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
} as const;

export const priorityLabel: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const VIEW_LABEL: Record<TaskView, string> = {
  today: 'Today',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
  completed: 'Completed',
  all: 'All',
  calendar: 'Calendar',
};

/** Recurring patterns that imply a task is "on" for any given day. */
function isRecurringDaily(t: Task): boolean {
  return t.recurrence === 'daily' || t.recurrence === 'weekdays' || t.recurrence === 'weekly';
}

function deadlineDate(t: Task): Date | null {
  if (!t.deadline) return null;
  const d = parseISO(t.deadline);
  return isNaN(d.getTime()) ? null : d;
}

function matchesSearch(t: Task, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    t.title.toLowerCase().includes(needle) ||
    t.description.toLowerCase().includes(needle) ||
    t.tags.some((tag) => tag.toLowerCase().includes(needle))
  );
}

/** Visible, filtered, sorted task list for the current view + filters. */
export function filterTasks(tasks: Task[], filter: TaskFilter, now: Date = new Date()): Task[] {
  const { view, search, category, priority, sort } = filter;
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  let list = tasks.filter((t) => {
    if (!matchesSearch(t, search)) return false;
    if (category && t.category !== category) return false;
    if (priority !== 'all' && t.priority !== priority) return false;
    if (view === 'completed') return t.status === 'done';
    if (view === 'calendar') return t.status !== 'cancelled';
    // List views (today/upcoming/overdue/all) show active, non-cancelled tasks.
    if (t.status === 'done' || t.status === 'cancelled') return false;

    const d = deadlineDate(t);
    switch (view) {
      case 'today':
        return isRecurringDaily(t) || (d != null && isSameDay(d, todayStart));
      case 'upcoming':
        return d != null && isAfter(d, todayEnd);
      case 'overdue':
        return d != null && isBefore(d, todayStart);
      default:
        return true; // 'all' and fallbacks
    }
  });

  if (view === 'calendar') return list;

  // Sort list views (today/upcoming/overdue/all).
  switch (sort) {
    case 'priority':
      list = [...list].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || byDeadline(a, b),
      );
      break;
    case 'created':
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'deadline':
      list = [...list].sort(byDeadline);
      break;
    default:
      list = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  return list;
}

function byDeadline(a: Task, b: Task): number {
  const da = a.deadline;
  const db = b.deadline;
  if (da && db) return da.localeCompare(db);
  if (da) return -1; // a has deadline → above b (null last)
  if (db) return 1;
  return (a.order ?? 0) - (b.order ?? 0);
}

/** Per-view counts for the tab labels (snapshot of the whole task set). */
export function viewCounts(tasks: Task[], now: Date = new Date()): Record<TaskView, number> {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const count = { today: 0, upcoming: 0, overdue: 0, completed: 0, all: 0, calendar: 0 } as Record<
    TaskView,
    number
  >;
  for (const t of tasks) {
    if (t.status === 'done') {
      count.completed += 1;
      continue;
    }
    if (t.status === 'cancelled') continue;
    count.all += 1;
    count.calendar += 1;
    const d = deadlineDate(t);
    if (isRecurringDaily(t) || (d != null && isSameDay(d, todayStart))) {
      count.today += 1;
    } else if (d != null && isAfter(d, todayEnd)) {
      count.upcoming += 1;
    } else if (d != null && isBefore(d, todayStart)) {
      count.overdue += 1;
    }
  }
  return count;
}

/**
 * Build a map of day-key (yyyy-MM-dd) → active tasks whose deadline lands that day.
 * Used by the calendar view.
 */
export function tasksByDay(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    if (t.status === 'done' || t.status === 'cancelled') continue;
    const d = deadlineDate(t);
    if (!d) continue;
    const key = formatDayKey(d);
    const arr = map.get(key);
    if (arr) arr.push(t);
    else map.set(key, [t]);
  }
  return map;
}

export function formatDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isYesterday, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null | undefined, pattern = 'EEE, MMM d'): string {
  if (!iso) return '—';
  return format(new Date(iso), pattern);
}

export function formatTime(iso: string | null | undefined, pattern = 'h:mm a'): string {
  if (!iso) return '—';
  return format(new Date(iso), pattern);
}

export function formatISO(iso: string | null | undefined, pattern = 'MMM d, yyyy'): string {
  if (!iso) return '—';
  return format(new Date(iso), pattern);
}

export function friendlyWhen(iso: string | null | undefined): string {
  if (!iso) return 'No deadline';
  const d = new Date(iso);
  if (isToday(d)) return `Today · ${formatTime(iso)}`;
  if (isTomorrow(d)) return `Tomorrow · ${formatTime(iso)}`;
  if (isYesterday(d)) return 'Yesterday';
  return formatDate(iso, 'EEE, MMM d') + ` · ${formatTime(iso)}`;
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Next Date on or after `from` matching `dayOfWeek` (0=Sun..6=Sat) at `hh:mm`. */
export function nextOccurrence(
  dayOfWeek: number,
  startTime: string,
  from: Date = new Date(),
): Date {
  const [h, m] = startTime.split(':').map(Number);
  const d = new Date(from);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  let diff = (dayOfWeek - d.getDay() + 7) % 7;
  if (diff === 0 && d.getTime() < from.getTime()) diff = 7;
  d.setDate(d.getDate() + diff);
  return d;
}

export function initials(first: string, last?: string): string {
  return `${first.charAt(0)}${last?.charAt(0) ?? ''}`.toUpperCase();
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
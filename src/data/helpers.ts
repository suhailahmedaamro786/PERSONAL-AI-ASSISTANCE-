const MIN = 60000;
const HOUR = 3600000;

/** Current ISO timestamp. */
export function now(): string {
  return new Date().toISOString();
}

/** ISO timestamp for `days` days from now at `hh:mm` local time. */
export function at(days: number, hh = 9, mm = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

/** ISO timestamp `days` days from now (midnight). */
export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** ISO timestamp `minutesFromNow` minutes from now. */
export function inMinutes(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * MIN).toISOString();
}

/** ISO timestamp `hoursFromNow` hours from now. */
export function inHours(hours: number): string {
  return new Date(Date.now() + hours * HOUR).toISOString();
}

/** ISO timestamp `h` hours ago. */
export function hours(h: number): string {
  return new Date(Date.now() - h * HOUR).toISOString();
}

/** ISO timestamp `days` days ago. */
export function daysAgo(days: number, hh = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hh, 0, 0, 0);
  return d.toISOString();
}

/** The weekday index (0=Sun..6=Sat) `days` from today. */
export function weekdayOffset(days: number): number {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.getDay();
}

/** today's date at given time, in short day label */
export function dayLabel(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}
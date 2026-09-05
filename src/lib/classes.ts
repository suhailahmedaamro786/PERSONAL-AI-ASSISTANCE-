export type ClassTone = 'brand' | 'info' | 'warning' | 'success' | 'danger';

/** Class-level color token → semantic tone for Badge / Progress. */
export const CLASS_TONE: Record<string, ClassTone> = {
  brand: 'brand',
  info: 'info',
  warning: 'warning',
  success: 'success',
  danger: 'danger',
};

/** Class-level color token → explicit accent color utility (Tailwind picks these literals up). */
export const CLASS_ACCENT: Record<string, string> = {
  brand: 'bg-brand',
  info: 'bg-info',
  warning: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-danger',
};

export const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

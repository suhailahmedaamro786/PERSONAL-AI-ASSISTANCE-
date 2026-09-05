export type ID = string;
export type Timestamp = string;

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type Theme = 'light' | 'dark' | 'system';

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};
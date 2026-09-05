import type { ID, Timestamp, Priority, Status } from './common';

export type TaskCategory =
  | 'career'
  | 'learning'
  | 'job'
  | 'personal'
  | 'portfolio'
  | 'health';

export type RecurrencePattern = 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | null;
export type TaskSource = 'ai' | 'user' | 'system';

export interface Task {
  id: ID;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: TaskCategory;
  deadline: Timestamp | null;
  dueTime?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  estimatedMinutes: number;
  actualMinutes: number | null;
  recurrence: RecurrencePattern;
  tags: string[];
  source: TaskSource;
  linkedJobId: ID | null;
  linkedCourseId: ID | null;
  order: number;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status'> &
  Partial<Pick<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status'>>;
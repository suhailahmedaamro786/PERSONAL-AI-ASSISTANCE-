import type { ID, Timestamp } from './common';

export type CourseStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';

export interface Course {
  id: ID;
  title: string;
  provider: string;
  url: string | null;
  status: CourseStatus;
  progress: number; // 0-100
  totalHours: number;
  completedHours: number;
  startDate: Timestamp | null;
  completionDate: Timestamp | null;
  certificateUrl: string | null;
  skills: string[];
  roadmapPosition: number | null;
}
import type { ID, Timestamp } from './common';

export interface ClassSession {
  id: ID;
  name: string;
  instructor: string;
  location: string;
  isOnline: boolean;
  dayOfWeek: number; // 0=Sun..6=Sat
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  courseId: ID | null;
  startDate: Timestamp;
  endDate: Timestamp | null;
  color: string;
}
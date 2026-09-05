import type { Course, CourseStatus } from '../types';

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  paused: 'Paused',
};

export const COURSE_STATUS_TONE: Record<CourseStatus, 'neutral' | 'brand' | 'success' | 'warning'> = {
  not_started: 'neutral',
  in_progress: 'brand',
  completed: 'success',
  paused: 'warning',
};

export interface LearningStats {
  streak: number;
  completedHours: number;
  activeCount: number;
  completedCount: number;
  nextRoadmap: Course | null;
}

/** All-ready stats derived honestly from the course list + computed streak. */
export function learningStats(courses: Course[], streak: number): LearningStats {
  const active = courses.filter((c) => c.status === 'in_progress');
  const done = courses.filter((c) => c.status === 'completed');
  const roadmap = courses
    .filter((c) => c.roadmapPosition != null)
    .sort((a, b) => (a.roadmapPosition ?? 0) - (b.roadmapPosition ?? 0));
  return {
    streak,
    completedHours: Math.round(courses.reduce((s, c) => s + c.completedHours, 0) * 10) / 10,
    activeCount: active.length,
    completedCount: done.length,
    nextRoadmap: roadmap.find((c) => c.status !== 'completed') ?? null,
  };
}

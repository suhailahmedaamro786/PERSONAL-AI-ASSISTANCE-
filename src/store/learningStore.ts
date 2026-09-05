import { create } from 'zustand';
import { courseService, learningLog } from '../services/domainServices';
import { useUIStore } from './uiStore';
import type { Course } from '../types';

interface LearningState {
  courses: Course[];
  studyDays: string[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  addCourse: (input: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, patch: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}

export const useLearningStore = create<LearningState>((set) => ({
  courses: [],
  studyDays: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const [courses, studyDays] = await Promise.all([
        courseService.getCourses(),
        learningLog.getStudyDays(),
      ]);
      set({ courses, studyDays, loading: false });
    } catch {
      set({ loading: false, error: 'Could not load learning data.' });
    }
  },

  addCourse: async (input) => {
    const created = await courseService.createCourse(input);
    set((s) => ({ courses: [...s.courses, created] }));
    useUIStore.getState().toast({ title: 'Course added', description: created.title, variant: 'success' });
  },

  updateCourse: async (id, patch) => {
    const updated = await courseService.updateCourse(id, patch);
    set((s) => ({ courses: s.courses.map((c) => (c.id === id ? updated : c)) }));
  },

  deleteCourse: async (id) => {
    await courseService.deleteCourse(id);
    set((s) => ({ courses: s.courses.filter((c) => c.id !== id) }));
  },
}));

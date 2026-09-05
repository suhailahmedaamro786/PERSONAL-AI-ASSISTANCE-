import { create } from 'zustand';
import { classService } from '../services/domainServices';
import { useUIStore } from './uiStore';
import type { ClassSession } from '../types';

interface ClassState {
  classes: ClassSession[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  addClass: (input: Omit<ClassSession, 'id'>) => Promise<void>;
  updateClass: (id: string, patch: Partial<ClassSession>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
}

export const useClassStore = create<ClassState>((set) => ({
  classes: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const classes = await classService.getClasses();
      set({ classes, loading: false });
    } catch {
      set({ loading: false, error: 'Could not load classes.' });
    }
  },

  addClass: async (input) => {
    const created = await classService.createClass(input);
    set((s) => ({ classes: [...s.classes, created] }));
    useUIStore.getState().toast({ title: 'Class added', description: created.name, variant: 'success' });
  },

  updateClass: async (id, patch) => {
    const updated = await classService.updateClass(id, patch);
    set((s) => ({ classes: s.classes.map((c) => (c.id === id ? updated : c)) }));
  },

  deleteClass: async (id) => {
    await classService.deleteClass(id);
    set((s) => ({ classes: s.classes.filter((c) => c.id !== id) }));
  },
}));
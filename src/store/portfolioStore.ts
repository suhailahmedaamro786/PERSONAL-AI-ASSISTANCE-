import { create } from 'zustand';
import { projectService } from '../services/domainServices';
import { useUIStore } from './uiStore';
import type { Project } from '../types';

interface PortfolioState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  addProject: (input: Omit<Project, 'id' | 'score'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectService.getProjects();
      set({ projects, loading: false });
    } catch {
      set({ loading: false, error: 'Could not load portfolio.' });
    }
  },

  addProject: async (input) => {
    const created = await projectService.createProject({ ...input, score: 50 });
    set((s) => ({ projects: [created, ...s.projects] }));
    useUIStore.getState().toast({ title: 'Project added', description: created.title, variant: 'success' });
  },

  deleteProject: async (id) => {
    await projectService.deleteProject(id);
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    useUIStore.getState().toast({ title: 'Project deleted', variant: 'info' });
  },

  toggleFeatured: async (id) => {
    const current = get().projects.find((p) => p.id === id);
    if (!current) return;
    const featured = !current.featured;
    const updated = await projectService.updateProject(id, { featured });
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? updated : p)) }));
    useUIStore
      .getState()
      .toast({
        title: featured ? 'Featured on portfolio' : 'Removed from featured',
        description: updated.title,
        variant: featured ? 'success' : 'info',
      });
  },
}));

import { create } from 'zustand';
import { profileService, skillService, projectService } from '../services/domainServices';
import { useUIStore } from './uiStore';
import type { Profile, Project, Skill } from '../types';

interface CareerState {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  loading: boolean;
  fetch: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  addSkill: (input: Omit<Skill, 'id'>) => Promise<void>;
  updateSkill: (id: string, patch: Partial<Skill>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
}

export const useCareerStore = create<CareerState>((set) => ({
  profile: null,
  skills: [],
  projects: [],
  loading: false,
  fetch: async () => {
    set({ loading: true });
    const [profile, skills, projects] = await Promise.all([
      profileService.getProfile(),
      skillService.getSkills(),
      projectService.getProjects(),
    ]);
    set({ profile, skills, projects, loading: false });
  },

  updateProfile: async (patch) => {
    const profile = await profileService.updateProfile(patch);
    set({ profile });
  },

  addSkill: async (input) => {
    const created = await skillService.createSkill(input);
    set((s) => ({ skills: [...s.skills, created] }));
    useUIStore.getState().toast({ title: 'Skill added', description: created.name, variant: 'success' });
  },

  updateSkill: async (id, patch) => {
    const updated = await skillService.updateSkill(id, patch);
    set((s) => ({ skills: s.skills.map((sk) => (sk.id === id ? updated : sk)) }));
  },

  deleteSkill: async (id) => {
    await skillService.deleteSkill(id);
    set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) }));
  },
}));
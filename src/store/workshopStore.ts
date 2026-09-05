import { create } from 'zustand';
import { workshopService } from '../services/domainServices';
import { notifyWorkshopRegistered } from '../services/notificationService';
import { useTaskStore } from './taskStore';
import { useUIStore } from './uiStore';
import type { Workshop } from '../types';

const REGISTERED_KEY = 'suhail_registered_workshops';

interface WorkshopState {
  workshops: Workshop[];
  loading: boolean;
  error: string | null;
  registered: string[];
  fetch: () => Promise<void>;
  register: (id: string) => Promise<void>;
  unregister: (id: string) => Promise<void>;
  isRegistered: (id: string) => boolean;
}

function loadRegistered(): string[] {
  try {
    const raw = localStorage.getItem(REGISTERED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as string[];
    }
  } catch {
    /* noop */
  }
  return [];
}

function persistRegistered(registered: string[]) {
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered));
}

export const useWorkshopStore = create<WorkshopState>((set, get) => ({
  workshops: [],
  loading: false,
  error: null,
  registered: loadRegistered(),

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const workshops = await workshopService.getWorkshops();
      set({ workshops, loading: false });
    } catch {
      set({ loading: false, error: 'Could not load workshops.' });
    }
  },

  register: async (id) => {
    if (get().registered.includes(id)) return;
    const w = get().workshops.find((x) => x.id === id);
    const registered = [...get().registered, id];
    set({ registered });
    persistRegistered(registered);
    await useTaskStore.getState().addTask({
      title: w ? `Attend: ${w.title}` : 'Attend workshop',
      description: w?.description ?? '',
      priority: 'medium',
      category: 'learning',
      deadline: w?.date ?? null,
      dueTime: null,
      estimatedMinutes: 90,
      actualMinutes: null,
      recurrence: null,
      tags: ['workshop'],
      source: 'ai',
      linkedJobId: null,
      linkedCourseId: null,
    });
    useUIStore
      .getState()
      .toast({ title: 'Registered', description: w?.title, variant: 'success' });
    if (w) void notifyWorkshopRegistered(w.title);
  },

  unregister: async (id) => {
    const registered = get().registered.filter((x) => x !== id);
    set({ registered });
    persistRegistered(registered);
    useUIStore.getState().toast({ title: 'Registration cancelled', variant: 'info' });
  },

  isRegistered: (id) => get().registered.includes(id),
}));

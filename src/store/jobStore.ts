import { create } from 'zustand';
import { jobService } from '../services/domainServices';
import { useTaskStore } from './taskStore';
import { useUIStore } from './uiStore';
import type { Job } from '../types';
import type { JobFilter } from '../lib/jobs';
import { uid } from '../lib/utils';

interface JobState {
  jobs: Job[];
  loading: boolean;
  selectedId: string | null;
  filter: JobFilter;
  fetchJobs: () => Promise<void>;
  setFilter: (patch: Partial<JobFilter>) => void;
  select: (id: string | null) => void;
  setStatus: (id: string, status: Job['applicationStatus']) => Promise<void>;
  prepareJob: (id: string) => Promise<void>;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  loading: false,
  selectedId: null,
  filter: { search: '', status: 'all', workMode: 'all', sort: 'match' },

  fetchJobs: async () => {
    set({ loading: true });
    const jobs = await jobService.getJobs();
    set({ jobs, loading: false });
  },

  setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),

  select: (id) => set({ selectedId: id }),

  setStatus: async (id, status) => {
    const job = await jobService.setJobStatus(id, status);
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === id && job ? { ...j, applicationStatus: job.applicationStatus } : j)) }));
    const title =
      status === 'saved'
        ? 'Job saved'
        : status === 'applied'
          ? 'Application sent'
          : `Job marked ${status}`;
    useUIStore.getState().toast({ title, description: job?.title, variant: status === 'applied' ? 'success' : 'info' });
  },

  /** "Prepare for application" — creates a linked task via the task system. */
  prepareJob: async (id) => {
    const job = get().jobs.find((j) => j.id === id);
    if (!job) return;
    await useTaskStore.getState().addTask({
      id: uid('task'),
      title: `Apply to ${job.title} at ${job.company}`,
      description: `Tailor CV, draft a cover letter and apply within the deadline.`,
      priority: job.priority,
      category: 'job',
      deadline: job.deadline,
      estimatedMinutes: 60,
      actualMinutes: null,
      recurrence: null,
      tags: ['apply', 'job'],
      source: 'ai',
      linkedJobId: job.id,
      linkedCourseId: null,
    });
    await get().setStatus(id, 'saved');
  },
}));
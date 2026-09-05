import { create } from 'zustand';
import { dashboardService } from '../services/domainServices';
import { computeStats, getWeeklyTaskData, getCategorySplit, type DashboardStats } from '../lib/dashboard';

interface DashboardState {
  stats: DashboardStats | null;
  weeklyTaskData: Array<{ day: string; completed: number; created: number }>;
  categorySplit: Array<{ name: string; value: number; color: string }>;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

function toWeekly(data: ReturnType<typeof getWeeklyTaskData>) {
  return data.map((d) => ({ day: d.day, completed: d.completed, created: d.added }));
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  weeklyTaskData: [],
  categorySplit: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await dashboardService.getWeeklyTasks();
      set({
        weeklyTaskData: data.weeklyTaskData.map((d) => ({
          day: d.day,
          completed: d.completed,
          created: d.added,
        })),
        categorySplit: data.categorySplit,
        stats: computeStats(),
        loading: false,
      });
    } catch {
      set({ loading: false, error: 'Could not load dashboard data.' });
    }
  },
}));

/** Recompute stat cards + charts after task mutations, without a service round-trip. */
export function refreshDashboardStats() {
  useDashboardStore.setState({
    stats: computeStats(),
    weeklyTaskData: toWeekly(getWeeklyTaskData()),
    categorySplit: getCategorySplit(),
  });
}

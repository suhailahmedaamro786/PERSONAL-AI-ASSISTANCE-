import { create } from 'zustand';
import { insightService } from '../services/domainServices';
import type { AIInsight } from '../types';

interface InsightState {
  insights: AIInsight[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

export const useInsightStore = create<InsightState>((set) => ({
  insights: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const insights = await insightService.getInsights();
      set({ insights, loading: false });
    } catch {
      set({ loading: false, error: 'Could not load insights.' });
    }
  },

  dismiss: async (id) => {
    await insightService.dismissInsight(id);
    set((s) => ({ insights: s.insights.filter((i) => i.id !== id) }));
  },
}));
import { create } from 'zustand';
import { STORAGE_KEYS } from '../lib/constants';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandOpen: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: (() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.sidebar) === '1';
    } catch {
      return false;
    }
  })(),
  mobileNavOpen: false,
  commandOpen: false,
  toasts: [],
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    try {
      localStorage.setItem(STORAGE_KEYS.sidebar, next ? '1' : '0');
    } catch {
      /* noop */
    }
    set({ sidebarCollapsed: next });
  },
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  setCommandOpen: (open) => set({ commandOpen: open }),
  toast: (t) => {
    const id = `toast_${crypto.randomUUID().slice(0, 8)}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4000);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
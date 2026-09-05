import { create } from 'zustand';
import { notificationService } from '../services/domainServices';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (input: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  fetch: async () => {
    set({ loading: true });
    const notifications = await notificationService.getNotifications();
    set({ notifications, loading: false });
  },
  create: async (input) => {
    const notification = await notificationService.createNotification(input);
    set((s) => ({ notifications: [notification, ...s.notifications] }));
  },
  delete: async (id) => {
    await notificationService.deleteNotification(id);
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
  },
  markAllRead: async () => {
    await notificationService.markAllRead();
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  },
  markRead: async (id) => {
    await notificationService.markRead(id);
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  },
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
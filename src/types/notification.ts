import type { ID, Timestamp } from './common';

export type NotificationType = 'urgent' | 'important' | 'info' | 'success';
export type NotificationCategory = 'task' | 'job' | 'career' | 'learning' | 'ai' | 'system';

export interface Notification {
  id: ID;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  createdAt: Timestamp;
  actionUrl: string | null;
  actionLabel: string | null;
}
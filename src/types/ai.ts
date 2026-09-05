import type { ID, Timestamp } from './common';

export type InsightType = 'recommendation' | 'warning' | 'tip' | 'achievement';

export interface AIInsight {
  id: ID;
  type: InsightType;
  title: string;
  description: string;
  actionLabel: string | null;
  actionRoute: string | null;
  priority: number;
  createdAt: Timestamp;
}

export interface ChatAction {
  label: string;
  type: 'navigate' | 'create_task' | 'analyze' | 'generate';
  payload: Record<string, unknown>;
}

export interface ChatMessage {
  id: ID;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  actions: ChatAction[] | null;
  context?: string | null;
}

export interface CommandDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  shortcut: string | null;
  category: 'navigation' | 'task' | 'career' | 'ai' | 'settings';
  action: () => void;
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}
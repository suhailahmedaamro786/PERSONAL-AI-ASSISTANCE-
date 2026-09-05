import { create } from 'zustand';
import { askAI, initialMessages, type AIResult } from '../services/aiService';
import type { ChatAction, ChatMessage, Task } from '../types';

interface AICoachState {
  messages: ChatMessage[];
  isTyping: boolean;
  context: string | null;
  /** Suggested tasks carried from the last AI result, consumed by the "create tasks" action. */
  suggestedTasks: Array<{
    title: string;
    priority: Task['priority'];
    category: Task['category'];
    estimatedMinutes: number;
  }>;
  init: () => void;
  send: (text: string) => Promise<AIResult>;
  applyAction: (action: ChatAction) => void;
  clear: () => void;
}

export const useAICoachStore = create<AICoachState>((set, get) => ({
  messages: [],
  isTyping: false,
  context: null,
  suggestedTasks: [],

  init: () => {
    if (get().messages.length === 0) set({ messages: initialMessages() });
  },

  send: async (text) => {
    const userMsg: ChatMessage = {
      id: `chat_${crypto.randomUUID().slice(0, 8)}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      actions: null,
      context: get().context,
    };
    set((s) => ({ messages: [...s.messages, userMsg], isTyping: true }));

    const result = await askAI(text);
    const aiMsg: ChatMessage = {
      id: `chat_${crypto.randomUUID().slice(0, 8)}`,
      role: 'assistant',
      content: result.reply,
      timestamp: new Date().toISOString(),
      actions: result.actions ?? null,
      context: result.context ?? null,
    };
    set((s) => ({
      messages: [...s.messages, aiMsg],
      isTyping: false,
      context: result.context ?? s.context,
      suggestedTasks: result.suggestedTasks ?? [],
    }));
    return result;
  },

  applyAction: (_action: ChatAction) => {
    // Navigation and task-creation are handled by AICoachPage consumers.
    // This is intentionally a no-op in the store — side-effects live in the UI layer.
  },

  clear: () => set({ messages: [], context: null, suggestedTasks: [] }),
}));
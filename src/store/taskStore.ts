import { create } from 'zustand';
import * as taskService from '../services/taskService';
import type { CreateTaskInput, Task, TaskCategory } from '../types';
import { useUIStore } from './uiStore';

export type TaskView = 'today' | 'upcoming' | 'calendar' | 'overdue' | 'completed' | 'all';

export interface TaskFilter {
  view: TaskView;
  search: string;
  category: TaskCategory | null;
  priority: 'all' | 'critical' | 'high' | 'medium' | 'low';
  sort: 'deadline' | 'priority' | 'created';
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  filter: TaskFilter;
  selected: string[];
  fetchTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setFilter: (patch: Partial<TaskFilter>) => void;
  reorder: (ids: string[]) => Promise<void>;
  toggleSelect: (id: string) => void;
  clearSelected: () => void;
  bulkComplete: () => Promise<void>;
  bulkDelete: () => Promise<void>;
  reset: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  filter: { view: 'today', search: '', category: null, priority: 'all', sort: 'deadline' },
  selected: [],

  fetchTasks: async () => {
    set({ loading: true });
    const tasks = await taskService.getTasks();
    set({ tasks, loading: false });
  },

  addTask: async (input) => {
    const task = await taskService.createTask(input);
    set((s) => ({ tasks: [task, ...s.tasks] }));
    useUIStore.getState().toast({ title: 'Task created', description: task.title, variant: 'success' });
  },

  updateTask: async (id, patch) => {
    const task = await taskService.updateTask(id, patch);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }));
  },

  removeTask: async (id) => {
    await taskService.deleteTask(id);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), selected: s.selected.filter((x) => x !== id) }));
    useUIStore.getState().toast({ title: 'Task deleted', variant: 'info' });
  },

  toggleComplete: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const done = task.status === 'done';
    await taskService.updateTask(id, {
      status: done ? 'todo' : 'done',
      actualMinutes: done ? null : task.estimatedMinutes,
    });
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, status: done ? 'todo' : 'done' } : t,
      ),
    }));
    if (!done) {
      useUIStore.getState().toast({ title: 'Nice work!', description: task.title, variant: 'success' });
    }
  },

  setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),

  reorder: async (ids) => {
    const ordered = await taskService.reorderTasks(ids);
    set({ tasks: ordered });
  },

  toggleSelect: (id) =>
    set((s) => ({
      selected: s.selected.includes(id)
        ? s.selected.filter((x) => x !== id)
        : [...s.selected, id],
    })),

  clearSelected: () => set({ selected: [] }),

  bulkComplete: async () => {
    const { selected, tasks } = get();
    await taskService.bulkUpdate(selected, { status: 'done' });
    set({
      tasks: tasks.map((t) => (selected.includes(t.id) ? { ...t, status: 'done' } : t)),
      selected: [],
    });
    useUIStore.getState().toast({ title: `${selected.length} tasks completed`, variant: 'success' });
  },

  bulkDelete: async () => {
    const { selected } = get();
    await Promise.all(selected.map((id) => taskService.deleteTask(id)));
    set((s) => ({
      tasks: s.tasks.filter((t) => !selected.includes(t.id)),
      selected: [],
    }));
    useUIStore.getState().toast({ title: `${selected.length} tasks deleted`, variant: 'info' });
  },

  reset: () => set({ tasks: [] }),
}));
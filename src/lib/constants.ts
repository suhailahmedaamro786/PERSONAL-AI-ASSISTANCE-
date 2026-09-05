export const APP_NAME = 'Suhail AI';
export const APP_TAGLINE = 'Your personal AI operating system';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'layout-dashboard' },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: 'check-square' },
  { id: 'classes', label: 'Classes', path: '/classes', icon: 'graduation-cap' },
  { id: 'career', label: 'Career', path: '/career', icon: 'target' },
  { id: 'jobs', label: 'Jobs', path: '/jobs', icon: 'briefcase' },
  { id: 'learning', label: 'Learning', path: '/learning', icon: 'book-open' },
  { id: 'workshops', label: 'Workshops', path: '/workshops', icon: 'calendar-clock' },
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio', icon: 'folder-git-2' },
  { id: 'profile', label: 'Profile', path: '/profile', icon: 'user' },
  { id: 'ai-coach', label: 'AI Coach', path: '/ai-coach', icon: 'sparkles' },
] as const;

export const SETTINGS_ITEM = {
  id: 'settings',
  label: 'Settings',
  path: '/settings',
  icon: 'settings',
} as const;

export const CITIES = ['Dadu', 'Hyderabad', 'Karachi', 'Sindh', 'Pakistan', 'Online'] as const;
export const WORKSHOP_CATEGORIES = [
  'AI',
  'IT',
  'Training',
  'Workshop',
  'Scholarship',
  'Career',
  'Youth',
] as const;

export const TASK_CATEGORIES = [
  'career',
  'learning',
  'job',
  'personal',
  'portfolio',
  'health',
] as const;

export const TASK_CATEGORY_LABEL: Record<string, string> = {
  career: 'Career',
  learning: 'Learning',
  job: 'Job',
  personal: 'Personal',
  portfolio: 'Portfolio',
  health: 'Health',
};

export const STORAGE_KEYS = {
  theme: 'suhail-theme',
  sidebar: 'suhail-sidebar-collapsed',
} as const;
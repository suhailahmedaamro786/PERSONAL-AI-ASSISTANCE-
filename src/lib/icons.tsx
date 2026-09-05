import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarCheck2,
  CalendarClock,
  CheckSquare,
  CircleCheck,
  FileText,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  MailCheck,
  MapPin,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  User,
  UserPen,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityAction, TaskCategory } from '../types';

export const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'check-square': CheckSquare,
  'graduation-cap': GraduationCap,
  target: Target,
  briefcase: Briefcase,
  'book-open': BookOpen,
  'calendar-clock': CalendarClock,
  'folder-git-2': FolderGit2,
  user: User,
  sparkles: Sparkles,
  settings: Settings,
  'bar-chart-3': BarChart3,
  'circle-check': CircleCheck,
  'mail-check': MailCheck,
  'user-pen': UserPen,
  'file-text': FileText,
  'trending-up': TrendingUp,
  'calendar-check': CalendarCheck2,
  'map-pin': MapPin,
  'alert-circle': AlertCircle,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (name && iconMap[name]) return iconMap[name];
  return Sparkles;
}

const CATEGORY_ICON: Record<TaskCategory, LucideIcon> = {
  career: Target,
  learning: BookOpen,
  job: Briefcase,
  personal: User,
  portfolio: FolderGit2,
  health: CircleCheck,
};

const ACTION_ICON: Record<ActivityAction, LucideIcon> = {
  analyzed: BarChart3,
  created: CalendarCheck2,
  updated: UserPen,
  completed: CircleCheck,
  generated: Sparkles,
  reviewed: FileText,
};

export function categoryIcon(category: TaskCategory): LucideIcon {
  return CATEGORY_ICON[category];
}

export function actionIcon(action: ActivityAction): LucideIcon {
  return ACTION_ICON[action];
}
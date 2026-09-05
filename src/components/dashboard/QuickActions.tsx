import { motion } from 'framer-motion';
import { Plus, ListTodo, Calendar, MessageCircle, Briefcase, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  to: string;
  color: string;
  bg: string;
}

const actions: QuickAction[] = [
  { label: 'New task', icon: <Plus className="h-5 w-5" />, to: '/tasks', color: 'text-brand', bg: 'bg-brand/10' },
  { label: 'AI Coach', icon: <MessageCircle className="h-5 w-5" />, to: '/ai-coach', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { label: 'Find jobs', icon: <Briefcase className="h-5 w-5" />, to: '/jobs', color: 'text-info', bg: 'bg-info/10' },
  { label: 'Learning', icon: <BookOpen className="h-5 w-5" />, to: '/learning', color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'Calendar', icon: <Calendar className="h-5 w-5" />, to: '/classes', color: 'text-success', bg: 'bg-success/10' },
  { label: 'All tasks', icon: <ListTodo className="h-5 w-5" />, to: '/tasks', color: 'text-text-secondary', bg: 'bg-surface-active' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="quickactions-title">
      <h2 id="quickactions-title" className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
        Quick actions
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, delay: i * 0.04 }}
            onClick={() => navigate(action.to)}
            className={cn(
              'group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface p-4 shadow-xs',
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-ring',
            )}
          >
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110', action.bg)}>
              <span className={action.color}>{action.icon}</span>
            </div>
            <span className="text-[13px] font-medium text-text-secondary group-hover:text-text transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
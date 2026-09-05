import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types';
import { PRIORITY_ORDER } from '../../types/common';
import { useTaskStore } from '../../store/taskStore';
import { categoryIcon } from '../../lib/icons';
import { friendlyWhen, formatDuration } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Progress';
import { EmptyState } from '../ui/states';
import { cn } from '../../lib/utils';

const priorityTone = { critical: 'danger', high: 'warning', medium: 'info', low: 'neutral' } as const;
const priorityText = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' } as const;

function PriorityCard({ task, index }: { task: Task; index: number }) {
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const Icon = categoryIcon(task.category);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-surface p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        task.priority === 'critical' ? 'border-danger/50' : 'border-border',
        task.status === 'done' && 'opacity-55',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <button
            onClick={() => toggleComplete(task.id)}
            aria-label={task.status === 'done' ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 focus-ring',
              task.status === 'done'
                ? 'border-success bg-success'
                : 'border-border-strong bg-surface hover:border-brand',
            )}
          >
            <AnimatePresence>
              {task.status === 'done' && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={priorityTone[task.priority]} variant="soft" className="uppercase">
                {priorityText[task.priority]} priority
              </Badge>
              <Badge tone="neutral" variant="outline" className="normal-case">
                {task.category}
              </Badge>
            </div>
            <h3 className="mt-1.5 truncate text-[15px] font-semibold text-text">{task.title}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Icon className="h-3.5 w-3.5" aria-hidden /> {task.category}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-text-secondary">
                {friendlyWhen(task.deadline)}
              </span>
              <span className="tabular-nums inline-flex items-center text-text-muted">
                ⏱ {formatDuration(task.estimatedMinutes)}
              </span>
              {task.source === 'ai' && (
                <span className="inline-flex items-center gap-1 text-brand">
                  <ArrowUpRight className="h-3 w-3" aria-hidden /> AI plan
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 rounded-md bg-surface-active px-1.5 py-0.5 font-mono tabular-nums text-[11px] font-medium text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
          #{index + 1}
        </div>
      </div>
    </motion.article>
  );
}

export function TodaysPriorities() {
  const tasks = useTaskStore((s) => s.tasks);
  const navigate = useNavigate();

  const priorities = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'done')
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.order - b.order)
      .slice(0, 4);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Section>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </Section>
    );
  }

  return (
    <Section
      action={
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand transition-colors hover:text-brand-hover focus-ring rounded"
        >
          View all tasks →
        </button>
      }
    >
      {priorities.length === 0 ? (
        <EmptyState
          title="All clear for today"
          description="You have completed everything due today. Nice."
          icon={Check}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {priorities.map((t, i) => (
            <PriorityCard key={t.id} task={t} index={i} />
          ))}
        </div>
      )}
    </Section>
  );
}

function Section({
  children,
  action,
  title = "Today's priorities",
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  title?: string;
}) {
  return (
    <section aria-labelledby="priorities-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="priorities-title" className="flex items-center gap-2 text-sm font-semibold text-text">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
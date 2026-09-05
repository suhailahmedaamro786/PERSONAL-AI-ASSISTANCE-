import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTaskStore } from '../../store/taskStore';
import { useClassStore } from '../../store/classStore';
import { useAuthStore } from '../../store/authStore';
import { nextOccurrence } from '../../lib/utils';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function GreetingHeader() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const reduced = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const classes = useClassStore((s) => s.classes);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const fullName = user?.name || 'there';

  const { importantCount, nextClassLabel, dateLabel } = useMemo(() => {
    const now = new Date();
    const important = tasks.filter(
      (t) => t.status !== 'done' && t.status !== 'cancelled' && t.priority !== 'low',
    ).length;
    let classLabel: string | null = null;
    if (classes.length > 0) {
      const next = [...classes]
        .map((c) => nextOccurrence(c.dayOfWeek, c.startTime, now))
        .sort((a, b) => a.getTime() - b.getTime())[0];
      if (next) classLabel = next.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return {
      importantCount: important,
      nextClassLabel: classLabel,
      dateLabel: now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    };
  }, [tasks, classes]);

  const hasLiveData = tasks.length > 0;
  const subtitle = hasLiveData
    ? `You have ${importantCount} important task${importantCount === 1 ? '' : 's'}${nextClassLabel ? ` and 1 class at ${nextClassLabel}` : ''} today.`
    : 'Loading your day…';

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-[13px] font-medium uppercase tracking-wider text-text-muted">
          {dateLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
          {getGreeting()}, {isMobile ? firstName : fullName} 👋
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 shadow-xs sm:self-center">
        <Sparkles className="h-4 w-4 text-brand" aria-hidden />
        <span className="text-[13px] font-medium text-text-secondary">AI assistant ready</span>
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
      </div>
    </motion.div>
  );
}
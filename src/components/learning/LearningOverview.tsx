import { BookOpen, CircleCheck, Clock, Flame } from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { currentStreak } from '../../lib/computation';
import { learningStats } from '../../lib/learning';
import { Skeleton } from '../ui/Progress';

export function LearningOverview() {
  const courses = useLearningStore((s) => s.courses);
  const studyDays = useLearningStore((s) => s.studyDays);
  const loading = useLearningStore((s) => s.loading);

  if (loading && courses.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const stats = learningStats(courses, currentStreak(studyDays));

  const cards = [
    {
      label: 'Learning streak',
      value: `${stats.streak} days`,
      sub: `${studyDays.length} studied this window`,
      icon: <Flame className="h-5 w-5" />,
      iconClass: 'bg-brand-subtle text-brand',
    },
    {
      label: 'Hours logged',
      value: `${stats.completedHours}h`,
      sub: 'across all courses',
      icon: <Clock className="h-5 w-5" />,
      iconClass: 'bg-info-subtle text-info',
    },
    {
      label: 'Active courses',
      value: String(stats.activeCount),
      sub: 'in progress now',
      icon: <BookOpen className="h-5 w-5" />,
      iconClass: 'bg-warning-subtle text-warning',
    },
    {
      label: 'Completed',
      value: String(stats.completedCount),
      sub: 'courses finished',
      icon: <CircleCheck className="h-5 w-5" />,
      iconClass: 'bg-success-subtle text-success',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.iconClass}`}>
            {c.icon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tabular-nums text-text">{c.value}</p>
            <p className="truncate text-[12px] text-text-muted">
              {c.label} · {c.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

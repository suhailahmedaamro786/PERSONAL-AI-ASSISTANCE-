import { useMemo } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useClassStore } from '../../store/classStore';
import { WEEKDAY_SHORT } from '../../lib/classes';
import { ClassCard } from './ClassCard';
import { EmptyState } from '../ui/states';
import { Skeleton } from '../ui/Progress';
import { cn } from '../../lib/utils';

export function WeeklySchedule() {
  const classes = useClassStore((s) => s.classes);
  const loading = useClassStore((s) => s.loading);

  const start = startOfWeek(new Date(), { weekStartsOn: 0 });
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(start, i)),
    [start],
  );
  const todayIdx = new Date().getDay();

  if (loading && classes.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No classes scheduled"
        description="Your weekly build-team schedule will appear here."
        className="py-16"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" aria-label="Weekly schedule">
        {days.map((day, i) => {
          const isToday = i === todayIdx;
          const dayClasses = classes
            .filter((c) => c.dayOfWeek === i)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex flex-col gap-2 rounded-xl border bg-surface p-3 shadow-xs',
                isToday ? 'border-brand/60 ring-1 ring-brand/20' : 'border-border',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {WEEKDAY_SHORT[i]}
                </span>
                <span
                  className={cn(
                    'text-[11px] tabular-nums',
                    isToday ? 'font-bold text-brand' : 'text-text-muted',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {dayClasses.length > 0 ? (
                  dayClasses.map((c) => <ClassCard key={c.id} cls={c} />)
                ) : (
                  <p className="rounded-md border border-dashed border-border px-2 py-3 text-center text-[11px] text-text-muted/70">
                    —
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[13px] text-text-muted">
        Week of{' '}
        <span className="font-semibold text-text-secondary">{format(start, 'MMMM d')}</span> · your
        recurring build-team schedule.
      </p>
    </div>
  );
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ArrowRight, GraduationCap, Video, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClassStore } from '../../store/classStore';
import { friendlyWhen, nextOccurrence, cn } from '../../lib/utils';
import { Skeleton } from '../ui/Progress';
import { EmptyState } from '../ui/states';

function durationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh - sh) * 60 + (em - sm);
}

export function UpcomingSchedule() {
  const classes = useClassStore((s) => s.classes);
  const loading = useClassStore((s) => s.loading);
  const navigate = useNavigate();

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...classes]
      .map((c) => {
        const next = nextOccurrence(c.dayOfWeek, c.startTime);
        return { cls: c, next, diffDays: Math.ceil((next.getTime() - now) / 86400000) };
      })
      .sort((a, b) => a.next.getTime() - b.next.getTime())
      .slice(0, 5);
  }, [classes]);

  if (loading) {
    return (
      <section aria-labelledby="schedule-title">
        <SectionTitle />
        <div className="relative ml-3 space-y-4 border-l-2 border-border pl-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="schedule-title">
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle />
        {classes.length > 0 && (
          <button
            onClick={() => navigate('/classes')}
            className="inline-flex items-center gap-1 rounded text-[13px] font-semibold text-brand transition-colors hover:text-brand-hover focus-ring"
          >
            View calendar <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          title="No upcoming classes"
          description="Your schedule is clear. Add a class to see it here."
          icon={CalendarDays}
        />
      ) : (
        <div className="relative ml-3 border-l-2 border-border pl-6">
          {upcoming.map(({ cls, next, diffDays }, i) => {
            const isToday = diffDays <= 0;
            const duration = durationMinutes(cls.startTime, cls.endTime);

            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.08 }}
                className="relative pb-5 last:pb-0"
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    'absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2',
                    isToday ? 'border-brand bg-brand' : 'border-border-strong bg-surface',
                  )}
                >
                  {isToday && (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  )}
                </div>

                <div className="rounded-xl border border-border bg-surface p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-semibold text-text">{cls.name}</h3>
                        {isToday && (
                          <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] text-text-muted">{cls.instructor}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-secondary">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                          {friendlyWhen(next.toISOString())}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums text-text-muted">
                          {isToday ? 'in progress window' : `${duration} min`}
                        </span>
                        <span className="inline-flex items-center gap-1 text-text-muted">
                          {cls.isOnline ? (
                            <>
                              <Video className="h-3.5 w-3.5" aria-hidden /> Online
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3.5 w-3.5" aria-hidden /> {cls.location}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                      <GraduationCap className="h-4 w-4 text-brand" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SectionTitle() {
  return (
    <h2 id="schedule-title" className="flex items-center gap-2 text-sm font-semibold text-text">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      Upcoming schedule
    </h2>
  );
}
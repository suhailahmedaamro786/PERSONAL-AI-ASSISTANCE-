import { Route } from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { learningStats } from '../../lib/learning';
import { currentStreak } from '../../lib/computation';
import { Skeleton } from '../ui/Progress';
import { cn } from '../../lib/utils';

export function LearningRoadmap() {
  const courses = useLearningStore((s) => s.courses);
  const studyDays = useLearningStore((s) => s.studyDays);
  const loading = useLearningStore((s) => s.loading);

  if (loading && courses.length === 0) {
    return <Skeleton className="h-56" />;
  }

  const roadmap = courses
    .filter((c) => c.roadmapPosition != null)
    .sort((a, b) => (a.roadmapPosition ?? 0) - (b.roadmapPosition ?? 0));

  if (roadmap.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-[13px] text-text-muted">
        No roadmap defined yet — add a course with a roadmap position to see the path.
      </p>
    );
  }

  const stats = learningStats(courses, currentStreak(studyDays));

  return (
    <div className="space-y-4">
      <div className="relative ml-3 border-l-2 border-border pl-6">
        {roadmap.map((c) => {
          const done = c.status === 'completed';
          const active = c.status === 'in_progress';
          const isNext = stats.nextRoadmap?.id === c.id;
          return (
            <div key={c.id} className="relative pb-5 last:pb-0">
              <div
                className={cn(
                  'absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2',
                  done
                    ? 'border-success bg-success'
                    : active
                      ? 'border-brand bg-brand'
                      : 'border-border-strong bg-surface',
                )}
              >
                {done && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
              </div>

              <div
                className={cn(
                  'rounded-xl border bg-surface p-4 shadow-xs transition-shadow hover:shadow-md',
                  isNext ? 'border-brand/60 ring-1 ring-brand/20' : 'border-border',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[14px] font-semibold text-text">{c.title}</h3>
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    {c.roadmapPosition}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-text-muted">{c.provider}</p>
                <div className="mt-2 text-[12px] font-medium text-text-secondary">
                  {done ? (
                    <span className="text-success">Completed</span>
                  ) : active ? (
                    <span className="text-brand">{Math.round(c.progress)}% done</span>
                  ) : isNext ? (
                    <span className="text-brand">Up next</span>
                  ) : (
                    <span className="text-text-muted">Not started</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-[13px] text-text-muted">
        <Route className="h-3.5 w-3.5" aria-hidden />
        Path to <span className="font-semibold text-text-secondary">AI Engineer</span> — follow the
        numbered track in order.
      </p>
    </div>
  );
}
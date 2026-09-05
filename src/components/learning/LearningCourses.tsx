import { ExternalLink, BookOpen, CircleCheck, BarChart2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE } from '../../lib/learning';
import { learningStats } from '../../lib/learning';
import { useLearningStore } from '../../store/learningStore';
import { currentStreak } from '../../lib/computation';

export function LearningCourses() {
  const courses = useLearningStore((s) => s.courses);
  const studyDays = useLearningStore((s) => s.studyDays);
  const loading = useLearningStore((s) => s.loading);
  const updateCourse = useLearningStore((s) => s.updateCourse);

  if (loading && courses.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-surface-active" />
        ))}
      </div>
    );
  }

  const stats = learningStats(courses, currentStreak(studyDays));
  const active = courses.filter((c) => c.status === 'in_progress');
  const done = courses.filter((c) => c.status === 'completed');
  const pending = courses.filter((c) => c.status === 'not_started' || c.status === 'paused');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-text">All courses</h3>
        <span className="tabular-nums text-[12px] text-text-muted">
          {courses.length} total · {stats.completedHours}h logged
        </span>
      </div>

      <div className="space-y-3">
        {(
          [
            ['In progress', active],
            ['Completed', done],
            ['Upcoming', pending],
          ] as const
        ).map(([label, list]) => (
            <div key={label}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {label} ({list.length})
              </p>
              <div className="space-y-2">
                {list.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-xs"
                  >
                    <Badge
                      tone={COURSE_STATUS_TONE[c.status]}
                      variant="soft"
                      className="shrink-0"
                    >
                      {COURSE_STATUS_LABEL[c.status]}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-[13px] font-semibold text-text">{c.title}</h4>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[12px] text-text-muted hover:text-brand"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="truncate text-[12px] text-text-muted">{c.provider}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-text-secondary">
                        {c.totalHours > 0 && (
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <BarChart2 className="h-3 w-3" aria-hidden />
                            {Math.round(c.completedHours)}h / {c.totalHours}h
                          </span>
                        )}
                        {c.skills.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="h-3 w-3" aria-hidden />
                            {c.skills.slice(0, 3).join(', ')}
                            {c.skills.length > 3 && '+more'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={c.progress} size="sm" className="w-32 shrink-0" />
                    {c.status !== 'completed' && (
                      <button
                        onClick={() =>
                          void updateCourse(c.id, {
                            status: 'completed' as const,
                            progress: 100,
                            completedHours: c.totalHours,
                            completionDate: new Date().toISOString(),
                          })
                        }
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-brand focus-ring"
                        title="Mark complete"
                      >
                        <CircleCheck className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
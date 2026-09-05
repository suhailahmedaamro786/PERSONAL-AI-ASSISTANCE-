import { motion } from 'framer-motion';
import { Building2, MapPin } from 'lucide-react';
import type { Job } from '../../types';
import { useJobStore } from '../../store/jobStore';
import { formatSalary, JOB_STATUS_LABEL } from '../../lib/jobs';
import { friendlyWhen } from '../../lib/utils';
import { ScoreRing } from '../ui/ScoreRing';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Progress';
import { cn } from '../../lib/utils';

const STATUS_TONE: Record<Job['applicationStatus'], 'neutral' | 'success' | 'warning' | 'info' | 'danger'> = {
  not_applied: 'neutral',
  saved: 'info',
  applied: 'success',
  interviewing: 'warning',
  offered: 'success',
  rejected: 'danger',
};

export function JobCard({ job, index }: { job: Job; index: number }) {
  const selected = useJobStore((s) => s.selectedId === job.id);
  const select = useJobStore((s) => s.select);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className={cn(
        'group cursor-pointer rounded-xl border bg-surface p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md',
        selected ? 'border-brand ring-2 ring-brand/15' : 'border-border',
      )}
      onClick={() => select(selected ? null : job.id)}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <ScoreRing value={job.matchPercentage} size={52} stroke={5} label="match" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold text-text">{job.title}</h3>
            <span className="hidden py-1 text-[11px] font-medium text-text-muted sm:block">
              {friendlyWhen(job.deadline)}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-text-secondary">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
            {job.company}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden /> {job.location}
            </span>
            <span className="capitalize">{job.workMode}</span>
            <span className="tabular-nums font-medium text-text-secondary">{formatSalary(job)}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={STATUS_TONE[job.applicationStatus]} variant="soft" className="normal-case">
              {JOB_STATUS_LABEL[job.applicationStatus]}
            </Badge>
            <Badge tone="neutral" variant="outline" className="normal-case">
              {job.source}
            </Badge>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <div className="flex gap-3">
        <Skeleton className="h-[52px] w-[52px] shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}
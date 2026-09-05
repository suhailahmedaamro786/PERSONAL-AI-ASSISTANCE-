import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  BedDouble,
  Banknote,
  Calendar,
  CheckSquare,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useJobStore } from '../../store/jobStore';
import { formatSalary, JOB_STATUS_LABEL } from '../../lib/jobs';
import { friendlyWhen, cn } from '../../lib/utils';
import { ScoreRing } from '../ui/ScoreRing';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/states';
import { Briefcase } from 'lucide-react';

const CURRENCY_ICON: Record<string, React.ReactNode> = {
  PKR: <Banknote className="h-4 w-4" />,
  USD: <Banknote className="h-4 w-4" />,
};

export function JobDetail() {
  const jobs = useJobStore((s) => s.jobs);
  const selectedId = useJobStore((s) => s.selectedId);
  const setStatus = useJobStore((s) => s.setStatus);
  const prepareJob = useJobStore((s) => s.prepareJob);
  const [analyzing, setAnalyzing] = useState(false);

  const job = jobs.find((j) => j.id === selectedId);

  if (!job) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 p-6">
        <EmptyState
          title="Select a job"
          description="Pick a role to see the full analysis, skill fit and application actions."
          icon={Briefcase}
          className="border-0"
        />
      </div>
    );
  }

  const isApplied = job.applicationStatus === 'applied' || job.applicationStatus === 'interviewing' || job.applicationStatus === 'offered';

  return (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-border bg-surface shadow-xs"
    >
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-border p-5">
        <ScoreRing value={job.matchPercentage} size={72} stroke={7} label="match" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-text">{job.title}</h2>
            <Badge tone="brand" variant="soft" className="normal-case">
              {JOB_STATUS_LABEL[job.applicationStatus]}
            </Badge>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-text-secondary">
            <Building2 className="h-3.5 w-3.5 text-text-muted" aria-hidden /> {job.company}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {job.location} · <span className="capitalize">{job.workMode}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 border-b border-border p-5 sm:grid-cols-3">
        <Meta label="Salary" icon={CURRENCY_ICON[job.salaryCurrency] ?? <Banknote className="h-4 w-4" />}>
          <span className="tabular-nums font-semibold text-text">{formatSalary(job)}</span>
        </Meta>
        <Meta label="Deadline" icon={<Calendar className="h-4 w-4" />}>
          <span className="font-semibold text-text">{friendlyWhen(job.deadline)}</span>
        </Meta>
        <Meta label="Source" icon={<Sparkles className="h-4 w-4" />}>
          <span className="font-semibold text-text">{job.source}</span>
        </Meta>
      </div>

      {/* Body */}
      <div className="space-y-5 p-5">
        <div>
          <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-wide text-text-muted">About the role</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{job.description}</p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted">Skill fit</h3>
            <Button variant="ghost" size="xs" onClick={() => setAnalyzing((v) => !v)}>
              <Sparkles className="h-3 w-3" /> {analyzing ? 'Hide analysis' : 'Analyze fit'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map((skill) => {
              const has = job.matchedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-medium',
                    has
                      ? 'border-success/40 bg-success-subtle/60 text-success'
                      : 'border-border bg-surface text-text-muted',
                  )}
                >
                  {has ? <CheckSquare className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
                  {skill}
                </span>
              );
            })}
          </div>

          <AnimatePresence>
            {analyzing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-border bg-surface-hover/50 p-3.5 text-[13px] text-text-secondary">
                  {job.matchedSkills.length > 0 ? (
                    <>
                      You match <span className="font-semibold text-success">{job.matchedSkills.length} of {job.requiredSkills.length}</span> required
                      skills ({job.matchPercentage}% fit). Add a project using{' '}
                      <span className="font-semibold text-text">{job.missingSkills.slice(0, 2).join(' and ') || 'these skills'}</span> to push this higher.
                    </>
                  ) : (
                    'You don’t yet match the core requirements below 50% — a targeted course or project would change that.'
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {job.notes && (
          <div className="rounded-lg border border-brand/20 bg-brand-subtle/40 p-3.5 text-[13px] text-text-secondary">
            <span className="font-semibold text-brand">Note:</span> {job.notes}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
          {!isApplied && (
            <Button variant="success" size="sm" onClick={() => void setStatus(job.id, 'applied')}>
              <Send className="h-3.5 w-3.5" /> Mark as applied
            </Button>
          )}
          {isApplied && (
            <Button variant="secondary" size="sm" disabled>
              <CheckSquare className="h-3.5 w-3.5" /> {JOB_STATUS_LABEL[job.applicationStatus]}
            </Button>
          )}
          {job.applicationStatus !== 'saved' && (
            <Button variant="secondary" size="sm" onClick={() => void setStatus(job.id, 'saved')}>
              <BedDouble className="h-3.5 w-3.5" /> Save
            </Button>
          )}
          <Button variant="brand-soft" size="sm" onClick={() => void prepareJob(job.id)}>
            <Sparkles className="h-3.5 w-3.5" /> Prepare application
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function Meta({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        <span className="text-text-muted">{icon}</span> {label}
      </p>
      <div className="mt-1 text-[13px]">{children}</div>
    </div>
  );
}
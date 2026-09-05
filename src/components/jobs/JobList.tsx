import { useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { useJobStore } from '../../store/jobStore';
import { filterJobs } from '../../lib/jobs';
import { JobCard, JobCardSkeleton } from './JobCard';
import { EmptyState } from '../ui/states';

export function JobList() {
  const jobs = useJobStore((s) => s.jobs);
  const loading = useJobStore((s) => s.loading);
  const filter = useJobStore((s) => s.filter);

  const visible = useMemo(() => filterJobs(jobs, filter), [jobs, filter]);

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        title="No jobs match"
        description="Try clearing a filter, or save a search for later."
        icon={Briefcase}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-2.5" aria-label="Job results">
      {visible.map((job, i) => (
        <JobCard key={job.id} job={job} index={i} />
      ))}
    </div>
  );
}
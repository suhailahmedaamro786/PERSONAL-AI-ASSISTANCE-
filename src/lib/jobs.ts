import type { ApplicationStatus, Job, WorkMode } from '../types';

export type JobStatusFilter = 'all' | ApplicationStatus;
export type WorkModeFilter = 'all' | WorkMode;
export type JobSort = 'match' | 'deadline' | 'posted';

export interface JobFilter {
  search: string;
  status: JobStatusFilter;
  workMode: WorkModeFilter;
  sort: JobSort;
}

export const JOB_STATUS_LABEL: Record<ApplicationStatus, string> = {
  not_applied: 'Not applied',
  saved: 'Saved',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offered: 'Offered',
  rejected: 'Rejected',
};

export function filterJobs(jobs: Job[], filter: JobFilter): Job[] {
  const q = filter.search.trim().toLowerCase();
  const list = jobs.filter((j) => {
    if (filter.status !== 'all' && j.applicationStatus !== filter.status) return false;
    if (filter.workMode !== 'all' && j.workMode !== filter.workMode) return false;
    if (
      q &&
      !`${j.title} ${j.company} ${j.location} ${j.requiredSkills.join(' ')} ${j.source}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });

  switch (filter.sort) {
    case 'match':
      return [...list].sort((a, b) => b.matchPercentage - a.matchPercentage || b.postedAt.localeCompare(a.postedAt));
    case 'posted':
      return [...list].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    case 'deadline':
    default:
      return [...list].sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return da - db;
      });
  }
}

/** Format a salary band honestly, hiding null clauses. */
export function formatSalary(j: Pick<Job, 'salaryMin' | 'salaryMax' | 'salaryCurrency'>): string {
  const { salaryMin, salaryMax, salaryCurrency } = j;
  if (salaryMin == null && salaryMax == null) return 'Stipend / unlisted';
  const cur = salaryCurrency === 'USD' ? '$' : 'Rs ';
  const min = salaryMin ?? salaryMax ?? 0;
  const max = salaryMax ?? salaryMin ?? 0;
  if (min === max) return `${cur}${min.toLocaleString()}`;
  return `${cur}${min.toLocaleString()} – ${cur}${max.toLocaleString()}`;
}
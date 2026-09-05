import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useJobStore } from '../../store/jobStore';
import type { ApplicationStatus, WorkMode } from '../../types';
import { JOB_STATUS_LABEL, type JobSort } from '../../lib/jobs';
import { SearchInput } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
} from '../ui/DropdownMenu';

const STATUSES: Array<ApplicationStatus | 'all'> = [
  'all',
  'not_applied',
  'saved',
  'applied',
  'interviewing',
  'rejected',
];
const MODES: Array<WorkMode | 'all'> = ['all', 'remote', 'hybrid', 'onsite'];
const SORTS: JobSort[] = ['match', 'deadline', 'posted'];
const SORT_LABEL: Record<JobSort, string> = {
  match: 'Best match',
  deadline: 'Deadline',
  posted: 'Newest',
};

export function JobFilters() {
  const filter = useJobStore((s) => s.filter);
  const setFilter = useJobStore((s) => s.setFilter);

  const hasFilters =
    filter.search !== '' || filter.status !== 'all' || filter.workMode !== 'all' || filter.sort !== 'match';

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          onClear={() => setFilter({ search: '' })}
          placeholder="Search jobs, companies, skills…"
          className="sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="secondary" size="sm">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {filter.status === 'all' ? 'Status' : JOB_STATUS_LABEL[filter.status]}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownLabel className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Status
              </DropdownLabel>
              {STATUSES.map((s) => (
                <DropdownItem key={s} onSelect={() => setFilter({ status: s })}>
                  {s === 'all' ? 'All statuses' : JOB_STATUS_LABEL[s]}
                </DropdownItem>
              ))}
            </DropdownContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="secondary" size="sm">
                {filter.workMode === 'all' ? 'Work mode' : filter.workMode}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownLabel className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Work mode
              </DropdownLabel>
              {MODES.map((m) => (
                <DropdownItem key={m} onSelect={() => setFilter({ workMode: m })} className="capitalize">
                  {m === 'all' ? 'All modes' : m}
                </DropdownItem>
              ))}
            </DropdownContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="secondary" size="sm">
                Sort: {SORT_LABEL[filter.sort]}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownLabel className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Sort by
              </DropdownLabel>
              {SORTS.map((s) => (
                <DropdownItem key={s} onSelect={() => setFilter({ sort: s })}>
                  {SORT_LABEL[s]}
                </DropdownItem>
              ))}
            </DropdownContent>
          </DropdownMenu>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter({ search: '', status: 'all', workMode: 'all', sort: 'match' })}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
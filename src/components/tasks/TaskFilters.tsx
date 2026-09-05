import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { TaskCategory } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { TASK_CATEGORIES, TASK_CATEGORY_LABEL } from '../../lib/constants';
import { priorityLabel } from '../../lib/tasks';
import { SearchInput } from '../ui/Input';
import { Chip, ChipGroup } from '../ui/Chip';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
} from '../ui/DropdownMenu';

const PRIORITIES = ['all', 'critical', 'high', 'medium', 'low'] as const;
const SORTS = ['deadline', 'priority', 'created'] as const;
const SORT_LABEL: Record<(typeof SORTS)[number], string> = {
  deadline: 'Deadline',
  priority: 'Priority',
  created: 'Newest first',
};

export function TaskFilters() {
  const filter = useTaskStore((s) => s.filter);
  const setFilter = useTaskStore((s) => s.setFilter);

  const hasFilters =
    filter.search !== '' ||
    filter.category !== null ||
    filter.priority !== 'all' ||
    filter.sort !== 'deadline';

  function clearFilters() {
    setFilter({ search: '', category: null, priority: 'all', sort: 'deadline' });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          onClear={() => setFilter({ search: '' })}
          placeholder="Search tasks, tags…"
          className="sm:max-w-xs"
        />

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="secondary" size="sm">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {filter.priority === 'all' ? 'Priority' : priorityLabel[filter.priority]}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownLabel className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Priority
              </DropdownLabel>
              {PRIORITIES.map((p) => (
                <DropdownItem
                  key={p}
                  onSelect={() => setFilter({ priority: p })}
                  className={filter.priority === p ? 'font-semibold text-text' : undefined}
                >
                  {p === 'all' ? 'All priorities' : priorityLabel[p]}
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
                <DropdownItem
                  key={s}
                  onSelect={() => setFilter({ sort: s })}
                  className={filter.sort === s ? 'font-semibold text-text' : undefined}
                >
                  {SORT_LABEL[s]}
                </DropdownItem>
              ))}
            </DropdownContent>
          </DropdownMenu>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      <ChipGroup label="Filter by category">
        {TASK_CATEGORIES.map((c: TaskCategory) => (
          <Chip
            key={c}
            active={filter.category === c}
            onClick={() => setFilter({ category: filter.category === c ? null : c })}
            onRemove={filter.category === c ? () => setFilter({ category: null }) : undefined}
          >
            {TASK_CATEGORY_LABEL[c]}
          </Chip>
        ))}
      </ChipGroup>
    </div>
  );
}

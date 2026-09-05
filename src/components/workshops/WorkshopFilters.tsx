import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { SearchInput } from '../ui/Input';
import { Button } from '../ui/Button';
import { Chip, ChipGroup } from '../ui/Chip';
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
} from '../ui/DropdownMenu';
import { CITIES, WORKSHOP_CATEGORIES } from '../../lib/constants';
import type {
  WorkshopCategoryFilter,
  WorkshopCityFilter,
  WorkshopFilter,
} from '../../lib/workshops';

export function WorkshopFilters({
  filter,
  onChange,
}: {
  filter: WorkshopFilter;
  onChange: (filter: WorkshopFilter) => void;
}) {
  const hasFilters =
    filter.search !== '' || filter.category !== 'all' || filter.city !== 'all';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={filter.search}
          onChange={(e) => onChange({ ...filter, search: e.target.value })}
          onClear={() => onChange({ ...filter, search: '' })}
          placeholder="Search workshops, orgs…"
          className="sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="secondary" size="sm">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {filter.category === 'all' ? 'Category' : filter.category}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownLabel className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Category
              </DropdownLabel>
              <DropdownItem onSelect={() => onChange({ ...filter, category: 'all' })}>
                All categories
              </DropdownItem>
              {WORKSHOP_CATEGORIES.map((c) => (
                <DropdownItem
                  key={c}
                  onSelect={() => onChange({ ...filter, category: c as WorkshopCategoryFilter })}
                  className="capitalize"
                >
                  {c}
                </DropdownItem>
              ))}
            </DropdownContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="secondary" size="sm">
                {filter.city === 'all' ? 'City' : filter.city}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownLabel className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                City
              </DropdownLabel>
              <DropdownItem onSelect={() => onChange({ ...filter, city: 'all' })}>
                All cities
              </DropdownItem>
              {CITIES.map((c) => (
                <DropdownItem
                  key={c}
                  onSelect={() => onChange({ ...filter, city: c as WorkshopCityFilter })}
                >
                  {c}
                </DropdownItem>
              ))}
            </DropdownContent>
          </DropdownMenu>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ search: '', category: 'all', city: 'all' })}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      <ChipGroup label="Workshop category">
        {WORKSHOP_CATEGORIES.map((c) => (
          <Chip
            key={c}
            active={filter.category === c}
            onClick={() =>
              onChange({
                ...filter,
                category: filter.category === c ? 'all' : (c as WorkshopCategoryFilter),
              })
            }
          >
            {c}
          </Chip>
        ))}
      </ChipGroup>
    </div>
  );
}

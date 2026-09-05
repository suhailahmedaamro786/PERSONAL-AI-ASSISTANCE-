import type { Workshop } from '../types';

export type WorkshopTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export type WorkshopCategoryFilter = 'all' | Workshop['category'];
export type WorkshopCityFilter = 'all' | Workshop['city'];

export interface WorkshopFilter {
  search: string;
  category: WorkshopCategoryFilter;
  city: WorkshopCityFilter;
}

export const WORKSHOP_TONE: Record<Workshop['category'], WorkshopTone> = {
  AI: 'brand',
  IT: 'info',
  Training: 'warning',
  Workshop: 'neutral',
  Scholarship: 'success',
  Career: 'danger',
  Youth: 'info',
};

export function filterWorkshops(
  workshops: Workshop[],
  filter: WorkshopFilter,
): Workshop[] {
  const q = filter.search.trim().toLowerCase();
  return workshops.filter((w) => {
    if (filter.category !== 'all' && w.category !== filter.category) return false;
    if (filter.city !== 'all' && w.city !== filter.city) return false;
    if (
      q &&
      !`${w.title} ${w.organization} ${w.description} ${w.location} ${w.city}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });
}

/** True while registration is still open — deadline in the future (or none). */
export function isRegistrationOpen(workshop: Workshop, now = new Date()): boolean {
  if (workshop.deadline == null) return true;
  return new Date(workshop.deadline).getTime() > now.getTime();
}

import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { useWorkshopStore } from '../../store/workshopStore';
import { filterWorkshops, type WorkshopFilter } from '../../lib/workshops';
import { WorkshopCard } from './WorkshopCard';
import { EmptyState, ErrorState } from '../ui/states';
import { Skeleton } from '../ui/Progress';

export function WorkshopList({ filter }: { filter: WorkshopFilter }) {
  const workshops = useWorkshopStore((s) => s.workshops);
  const loading = useWorkshopStore((s) => s.loading);
  const error = useWorkshopStore((s) => s.error);
  const fetch = useWorkshopStore((s) => s.fetch);
  const registered = useWorkshopStore((s) => s.registered);
  const register = useWorkshopStore((s) => s.register);

  const visible = useMemo(() => filterWorkshops(workshops, filter), [workshops, filter]);

  if (loading && workshops.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading workshops">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load workshops"
        description={error}
        onRetry={() => void fetch()}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No workshops match"
        description="Try clearing a filter — new local and online opportunities arrive often."
        className="py-16"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="Workshop results">
      {visible.map((w, i) => (
        <WorkshopCard
          key={w.id}
          workshop={w}
          index={i}
          registered={registered.includes(w.id)}
          onRegister={() => void register(w.id)}
        />
      ))}
    </div>
  );
}

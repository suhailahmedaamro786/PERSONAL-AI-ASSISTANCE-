import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { WorkshopFilters } from '../components/workshops/WorkshopFilters';
import { WorkshopList } from '../components/workshops/WorkshopList';
import { useWorkshopStore } from '../store/workshopStore';
import type { WorkshopFilter } from '../lib/workshops';

export default function WorkshopsPage() {
  const fetch = useWorkshopStore((s) => s.fetch);
  const [filter, setFilter] = useState<WorkshopFilter>({ search: '', category: 'all', city: 'all' });

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return (
    <PageContainer>
      <PageHeader
        title="Workshops"
        description="Local and online opportunities — browsing one creates a task to attend."
        icon={<CalendarClock className="h-5 w-5" />}
      />

      <div className="space-y-5">
        <WorkshopFilters filter={filter} onChange={setFilter} />
        <WorkshopList filter={filter} />
      </div>
    </PageContainer>
  );
}
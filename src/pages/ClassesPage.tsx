import { useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { WeeklySchedule } from '../components/classes/WeeklySchedule';
import { useClassStore } from '../store/classStore';

export default function ClassesPage() {
  const fetch = useClassStore((s) => s.fetch);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return (
    <PageContainer>
      <PageHeader
        title="Classes"
        description="Your weekly build-team schedule, at a glance."
        icon={<CalendarDays className="h-5 w-5" />}
      />

      <WeeklySchedule />
    </PageContainer>
  );
}
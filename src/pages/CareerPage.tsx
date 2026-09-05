import { useEffect } from 'react';
import { Target } from 'lucide-react';
import { useCareerStore } from '../store/careerStore';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { CareerOverview } from '../components/career/CareerOverview';
import { CareerSections } from '../components/career/CareerSections';
import { SkillGaps } from '../components/career/SkillGaps';
import { CareerChecklist } from '../components/career/CareerChecklist';
import { CareerRecs } from '../components/career/CareerRecs';

export default function CareerPage() {
  const fetch = useCareerStore((s) => s.fetch);

  useEffect(() => {
    if (useCareerStore.getState().profile === null) void fetch();
  }, [fetch]);

  return (
    <PageContainer>
      <PageHeader
        title="Career"
        description="Your career command center — readiness, gaps and next moves."
        icon={<Target className="h-5 w-5" />}
      />

      <div className="space-y-6">
        <CareerOverview />

        <div className="grid gap-6 lg:grid-cols-2">
          <CareerSections />
          <div className="space-y-6">
            <CareerChecklist />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SkillGaps />
          <CareerRecs />
        </div>
      </div>
    </PageContainer>
  );
}
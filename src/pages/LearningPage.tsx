import { useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { LearningOverview } from '../components/learning/LearningOverview';
import { LearningRoadmap } from '../components/learning/LearningRoadmap';
import { WeeklyHours } from '../components/learning/WeeklyHours';
import { LearningCourses } from '../components/learning/LearningCourses';
import { useLearningStore } from '../store/learningStore';

export default function LearningPage() {
  const fetch = useLearningStore((s) => s.fetch);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return (
    <PageContainer>
      <PageHeader
        title="Learning"
        description="Your course roadmap, streak and weekly hours — mark a course complete and it lands here instantly."
        icon={<BookOpen className="h-5 w-5" />}
      />

      <div className="space-y-5">
        <LearningOverview />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LearningRoadmap />
          </div>
          <div>
            <WeeklyHours />
          </div>
        </div>

        <LearningCourses />
      </div>
    </PageContainer>
  );
}
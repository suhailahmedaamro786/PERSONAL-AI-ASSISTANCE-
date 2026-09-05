import { useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { GreetingHeader } from '../components/dashboard/GreetingHeader';
import { TodaysPriorities } from '../components/dashboard/TodaysPriorities';
import { ProductivityOverview } from '../components/dashboard/ProductivityOverview';
import { AIInsights } from '../components/dashboard/AIInsights';
import { UpcomingSchedule } from '../components/dashboard/UpcomingSchedule';
import { QuickActions } from '../components/dashboard/QuickActions';
import { useDashboardStore, refreshDashboardStats } from '../store/dashboardStore';
import { useClassStore } from '../store/classStore';
import { useInsightStore } from '../store/insightStore';
import { useTaskStore } from '../store/taskStore';
import { sweepDeadlineReminders } from '../services/notificationService';

let swept = false;

export default function DashboardPage() {
  const fetchDashboard = useDashboardStore((s) => s.fetch);
  const fetchClasses = useClassStore((s) => s.fetch);
  const fetchInsights = useInsightStore((s) => s.fetch);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  useEffect(() => {
    void fetchDashboard();
    void fetchClasses();
    void fetchInsights();
    // Stats derive from tasks, so recompute once tasks land (and after any
    // later mutation, e.g. completion toggles).
    void fetchTasks().then(() => {
      refreshDashboardStats();
      // Emit deadline reminders once per app load for tasks due within 48h.
      if (!swept) {
        swept = true;
        void sweepDeadlineReminders(useTaskStore.getState().tasks);
      }
    });
    const unsub = useTaskStore.subscribe((s, prev) => {
      if (s.tasks !== prev.tasks) refreshDashboardStats();
    });
    return unsub;
  }, [fetchDashboard, fetchClasses, fetchInsights, fetchTasks]);

  return (
    <PageContainer>
      <div className="space-y-8">
        <GreetingHeader />
        <TodaysPriorities />
        <ProductivityOverview />
        <AIInsights />
        <UpcomingSchedule />
        <QuickActions />
      </div>
    </PageContainer>
  );
}
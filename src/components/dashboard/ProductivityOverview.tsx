import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { ChartContainer, PieChart, BarChart } from '../ui/Chart';
import { Skeleton } from '../ui/Progress';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  color: string;
  index: number;
}

function StatCard({ label, value, delta, deltaLabel, icon, color, index }: StatCardProps) {
  const isPositive = delta != null && delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-xs"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[13px] font-medium text-text-muted">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-text tabular-nums">
            {value}
          </p>
          {delta != null && (
            <div className={cn('mt-2 flex items-center gap-1 text-[13px] font-medium', isPositive ? 'text-success' : 'text-danger')}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {isPositive ? '+' : ''}{delta}%
              {deltaLabel && <span className="text-text-muted ml-1">{deltaLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.06]" style={{ backgroundColor: color }} />
    </motion.div>
  );
}

export function ProductivityOverview() {
  const stats = useDashboardStore((s) => s.stats);
  const weeklyTaskData = useDashboardStore((s) => s.weeklyTaskData);
  const categorySplit = useDashboardStore((s) => s.categorySplit);
  const loading = useDashboardStore((s) => s.loading);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Tasks completed', value: stats.tasksCompleted, delta: stats.tasksDelta, deltaLabel: 'vs last week', icon: <CheckCircle2 className="h-5 w-5" />, color: '#10b981' },
      { label: 'Overdue', value: stats.overdueCount, delta: stats.overdueDelta, deltaLabel: 'vs last week', icon: <AlertTriangle className="h-5 w-5" />, color: stats.overdueCount > 0 ? '#ef4444' : '#10b981' },
      { label: 'Total estimated', value: stats.totalEstimatedHours, icon: <Clock className="h-5 w-5" />, color: '#6366f1' },
    ];
  }, [stats]);

  if (loading || !stats) {
    return (
      <section aria-labelledby="productivity-title">
        <h2 id="productivity-title" className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
          Productivity overview
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-56 lg:col-span-3" />
          <Skeleton className="h-56 lg:col-span-2" />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="productivity-title">
      <h2 id="productivity-title" className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
        Productivity overview
      </h2>

      <div className="grid gap-3 sm:grid-cols-3">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs lg:col-span-3"
        >
          <h3 className="text-[15px] font-semibold text-text">Weekly tasks</h3>
          <p className="mt-0.5 text-[13px] text-text-muted">Completed vs created over the past week</p>
          <div className="mt-4">
            <ChartContainer height={200}>
              <BarChart
                data={weeklyTaskData}
                xKey="day"
                series={[
                  { key: 'completed', color: '#6366f1', name: 'Completed' },
                  { key: 'created', color: '#e2e8f0', name: 'Created' },
                ]}
                barRadius={4}
                height={200}
              />
            </ChartContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs lg:col-span-2"
        >
          <h3 className="text-[15px] font-semibold text-text">Category split</h3>
          <p className="mt-0.5 text-[13px] text-text-muted">Distribution of tasks by category</p>
          <div className="mt-4">
            <ChartContainer height={200}>
              <PieChart
                data={categorySplit}
                dataKey="value"
                nameKey="name"
                height={200}
                innerRadius={50}
                outerRadius={80}
              />
            </ChartContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {categorySplit.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[12px] text-text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
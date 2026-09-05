import { Clock } from 'lucide-react';
import { BarChart } from '../ui/Chart';
import { dailyLearningHours } from '../../lib/learningHours';

export function WeeklyHours() {
  const hours = dailyLearningHours();
  const total = hours.reduce((s, d) => s + d.hours, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[14px] font-semibold text-text">
          <Clock className="h-4 w-4 text-brand" aria-hidden />
          Learning this week
        </h3>
        <span className="tabular-nums text-[12px] font-semibold text-text-secondary">
          {total}h/week
        </span>
      </div>
      <BarChart
        data={hours}
        xKey="day"
        height={200}
        series={[{ key: 'hours', name: 'Hours', color: 'var(--color-brand)' }]}
      />
    </div>
  );
}
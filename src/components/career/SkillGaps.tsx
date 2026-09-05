import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';
import { useCareerStore } from '../../store/careerStore';
import { skillGap } from '../../lib/computation';
import { Skeleton } from '../ui/Progress';
import { cn } from '../../lib/utils';

function GapBadge({ gap }: { gap: number }) {
  if (gap <= 0) return <span className="text-[11px] font-semibold text-success">On target</span>;
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
        gap >= 4 ? 'bg-danger-subtle text-danger' : gap >= 2 ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success',
      )}
    >
      gap {gap < 0 ? 0 : gap}
    </span>
  );
}

export function SkillGaps() {
  const { skills, loading } = useCareerStore();

  if (loading) {
    return (
      <section aria-labelledby="gaps-title" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <Skeleton className="mb-4 h-5 w-36" />
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9" />
        ))}</div>
      </section>
    );
  }

  const gaps = skillGap(skills)
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 8);

  return (
    <section aria-labelledby="gaps-title" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <div className="mb-4 flex items-center gap-2">
        <Gauge className="h-4 w-4 text-brand" aria-hidden />
        <h2 id="gaps-title" className="text-[15px] font-semibold text-text">
          Skill gaps to close
        </h2>
      </div>

      {gaps.length === 0 ? (
        <p className="text-[13px] text-text-muted">No open gaps — every skill is at target.</p>
      ) : (
        <ul className="space-y-3">
          {gaps.map((g, i) => (
            <motion.li
              key={g.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="flex items-center gap-3"
            >
              <div className="w-36 shrink-0 sm:w-44">
                <p className="truncate text-[13px] font-medium text-text">{g.name}</p>
                <p className="text-[11px] text-text-muted">
                  {g.current}/10 → {g.target}/10
                </p>
              </div>
              <div className="flex-1">
                <div className="relative h-2 overflow-hidden rounded-full bg-surface-active">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-brand"
                    style={{ width: `${(g.current / 10) * 100}%` }}
                  />
                  <div
                    className="absolute top-[-2px] h-[12px] w-[3px] rounded-full bg-text"
                    style={{ left: `${(g.target / 10) * 100}%` }}
                    title={`target ${g.target}/10`}
                  />
                </div>
              </div>
              <div className="w-16 shrink-0 text-right">
                <GapBadge gap={g.gap} />
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
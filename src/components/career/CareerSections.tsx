import { motion } from 'framer-motion';
import { ChartPie } from 'lucide-react';
import { useCareerStore } from '../../store/careerStore';
import { careerReadiness, scoreTone } from '../../lib/computation';
import { Progress, Skeleton } from '../ui/Progress';

export function CareerSections() {
  const { profile, skills, projects, loading } = useCareerStore();

  if (loading || !profile) {
    return (
      <section
        aria-labelledby="sections-title"
        className="rounded-xl border border-border bg-surface p-5 shadow-xs"
      >
        <Skeleton className="mb-5 h-5 w-40" />
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </section>
    );
  }

  const { sections } = careerReadiness(profile, skills, projects);
  const weakest = sections.reduce((a, b) => (a.score < b.score ? a : b));

  return (
    <section
      aria-labelledby="sections-title"
      className="rounded-xl border border-border bg-surface p-5 shadow-xs"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 id="sections-title" className="flex items-center gap-2 text-[15px] font-semibold text-text">
          <ChartPie className="h-4 w-4 text-brand" aria-hidden />
          Section readiness
        </h2>
        <span className="hidden text-[12px] text-text-muted sm:block">
          Watch {weakest.label.toLowerCase()} for the quickest gain
        </span>
      </div>

      <ul className="space-y-4">
        {sections.map((s, i) => (
          <motion.li
            key={s.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: i * 0.04 }}
          >
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-text-secondary">{s.label}</span>
              <span className="tabular-nums text-[12px] font-semibold text-text-muted">
                {s.score}/100
              </span>
            </div>
            <Progress value={s.score} tone={scoreTone(s.score)} size="md" />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
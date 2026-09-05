import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import { useCareerStore } from '../../store/careerStore';
import { careerChecklist } from '../../lib/computation';
import { Progress, Skeleton } from '../ui/Progress';
import { cn } from '../../lib/utils';

export function CareerChecklist() {
  const { profile, skills, projects, loading } = useCareerStore();

  if (loading || !profile) {
    return (
      <section aria-labelledby="checklist-title" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8" />
        ))}</div>
      </section>
    );
  }

  const items = careerChecklist(profile, skills, projects);
  const done = items.filter((i) => i.met).length;

  return (
    <section aria-labelledby="checklist-title" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="checklist-title" className="flex items-center gap-2 text-[15px] font-semibold text-text">
          <ListChecks className="h-4 w-4 text-brand" aria-hidden />
          Career checklist
        </h2>
        <span className="tabular-nums text-[12px] font-semibold text-text-muted">
          {done}/{items.length}
        </span>
      </div>
      <Progress value={(done / items.length) * 100} tone={done === items.length ? 'success' : 'brand'} size="sm" className="mb-4" />
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <motion.li
            key={item.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="flex items-center gap-2.5"
          >
            {item.met ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            )}
            <span className={cn('text-[13px]', item.met ? 'text-text-secondary' : 'text-text')}>
              {item.label}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
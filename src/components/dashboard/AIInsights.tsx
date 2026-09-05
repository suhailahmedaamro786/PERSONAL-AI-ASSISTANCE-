import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, Target, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInsightStore } from '../../store/insightStore';
import type { InsightType } from '../../types';
import { Skeleton } from '../ui/Progress';
import { EmptyState } from '../ui/states';

const typeMeta: Record<
  InsightType,
  { icon: typeof Lightbulb; color: string; bg: string; label: string }
> = {
  recommendation: { icon: Target, color: 'text-brand', bg: 'bg-brand/10', label: 'Recommendation' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: 'Warning' },
  tip: { icon: Lightbulb, color: 'text-info', bg: 'bg-info/10', label: 'Tip' },
  achievement: { icon: Flame, color: 'text-success', bg: 'bg-success/10', label: 'Achievement' },
};

export function AIInsights() {
  const insights = useInsightStore((s) => s.insights);
  const loading = useInsightStore((s) => s.loading);
  const navigate = useNavigate();

  const sorted = useMemo(
    () => [...insights].sort((a, b) => a.priority - b.priority),
    [insights],
  );

  if (loading) {
    return (
      <section aria-labelledby="insights-title">
        <InsightTitle />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="insights-title">
      <div className="mb-3 flex items-center justify-between">
        <InsightTitle />
        {sorted.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/8 px-2.5 py-0.5 text-[12px] font-semibold text-brand">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            For you
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No insights yet" description="Check back after completing more tasks." icon={Lightbulb} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((insight, i) => {
            const meta = typeMeta[insight.type];
            const Icon = meta.icon;
            return (
              <motion.article
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`text-[12px] font-semibold uppercase tracking-wide ${meta.color}`}>
                      {meta.label}
                    </span>
                    <h3 className="mt-1 text-[15px] font-semibold leading-snug text-text">
                      {insight.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-text-muted line-clamp-3">
                      {insight.description}
                    </p>
                    {insight.actionLabel && (
                      <button
                        onClick={() => insight.actionRoute && navigate(insight.actionRoute)}
                        className="mt-3 inline-flex items-center gap-1 rounded text-[13px] font-semibold text-brand transition-colors hover:text-brand-hover focus-ring"
                      >
                        {insight.actionLabel}
                        <ArrowLinkIcon />
                      </button>
                    )}
                  </div>
                </div>
                {/* Decorative gradient */}
                <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.06] ${meta.bg}`} />
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ArrowLinkIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M4 4h7v7M11 4L4.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InsightTitle() {
  return (
    <h2 id="insights-title" className="flex items-center gap-2 text-sm font-semibold text-text">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      AI insights
    </h2>
  );
}
import { Award, FolderOpen, Layers, Star } from 'lucide-react';
import { usePortfolioStore } from '../../store/portfolioStore';
import { portfolioStats } from '../../lib/portfolio';
import { Skeleton } from '../ui/Progress';

export function PortfolioStats() {
  const projects = usePortfolioStore((s) => s.projects);
  const loading = usePortfolioStore((s) => s.loading);

  if (loading && projects.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const stats = portfolioStats(projects);

  const cards = [
    {
      label: 'Projects',
      value: String(stats.total),
      sub: 'in portfolio',
      icon: <FolderOpen className="h-5 w-5" />,
      iconClass: 'bg-brand-subtle text-brand',
    },
    {
      label: 'Featured',
      value: String(stats.featured),
      sub: 'flagged on profile',
      icon: <Star className="h-5 w-5" />,
      iconClass: 'bg-warning-subtle text-warning',
    },
    {
      label: 'Avg quality',
      value: `${stats.avgScore}`,
      sub: 'score out of 100',
      icon: <Award className="h-5 w-5" />,
      iconClass: 'bg-success-subtle text-success',
    },
    {
      label: 'Skills shown',
      value: String(stats.skills),
      sub: 'distinct across projects',
      icon: <Layers className="h-5 w-5" />,
      iconClass: 'bg-info-subtle text-info',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.iconClass}`}>
            {c.icon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tabular-nums text-text">{c.value}</p>
            <p className="truncate text-[12px] text-text-muted">
              {c.label} · {c.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
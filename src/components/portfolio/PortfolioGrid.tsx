import { useMemo } from 'react';
import { FolderOpen, Star } from 'lucide-react';
import { usePortfolioStore } from '../../store/portfolioStore';
import { PortfolioCard } from './PortfolioCard';
import { EmptyState, ErrorState } from '../ui/states';
import { Skeleton } from '../ui/Progress';

export function PortfolioGrid() {
  const projects = usePortfolioStore((s) => s.projects);
  const loading = usePortfolioStore((s) => s.loading);
  const error = usePortfolioStore((s) => s.error);
  const fetch = usePortfolioStore((s) => s.fetch);
  const toggleFeatured = usePortfolioStore((s) => s.toggleFeatured);

  const [featured, rest] = useMemo(() => {
    const f = projects.filter((p) => p.featured);
    const r = projects.filter((p) => !p.featured);
    return [f, r];
  }, [projects]);

  if (loading && projects.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading portfolio">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load portfolio"
        description={error}
        onRetry={() => void fetch()}
      />
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Add your first project to start building a portfolio that sells you."
        className="py-16"
      />
    );
  }

  return (
    <div className="space-y-6">
      {featured.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-text">
            <Star className="h-4 w-4 text-warning" aria-hidden />
            Featured
          </h3>
          <div className="grid gap-4 sm:grid-cols-2" aria-label="Featured projects">
            {featured.map((p, i) => (
              <PortfolioCard
                key={p.id}
                project={p}
                index={i}
                onToggleFeatured={() => void toggleFeatured(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-text">
            <FolderOpen className="h-4 w-4 text-text-muted" aria-hidden />
            All projects
          </h3>
          <div className="grid gap-4 sm:grid-cols-2" aria-label="All projects">
            {rest.map((p, i) => (
              <PortfolioCard
                key={p.id}
                project={p}
                index={i}
                onToggleFeatured={() => void toggleFeatured(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
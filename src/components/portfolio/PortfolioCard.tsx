import { motion } from 'framer-motion';
import { ExternalLink, GitBranch, Star } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ScoreRing } from '../ui/ScoreRing';
import { cn, formatDate } from '../../lib/utils';
import type { Project } from '../../types';

export function PortfolioCard({
  project,
  onToggleFeatured,
  index,
}: {
  project: Project;
  onToggleFeatured: () => void;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-xs transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-text">{project.title}</h3>
            {project.featured && (
              <Badge tone="warning" variant="soft">
                <Star className="h-3 w-3" /> Featured
              </Badge>
            )}
          </div>
          <p className="mt-1 text-[13px] text-text-muted">
            {project.completedAt ? formatDate(project.completedAt, 'MMM d, yyyy') : 'In progress'}
          </p>
        </div>
        <ScoreRing value={project.score} size={52} stroke={5} label="score" className="shrink-0" />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
        {project.description}
      </p>

      {project.caseStudy && (
        <p className="mt-2 rounded-lg border border-brand/20 bg-brand-subtle/40 p-2.5 text-[12px] leading-relaxed text-text-secondary">
          <span className="font-semibold text-brand">Case study:</span>{' '}
          <span className="line-clamp-2">{project.caseStudy}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.skills.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-surface-active px-2 py-0.5 text-[11px] font-medium text-text-secondary"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
        <div className="flex items-center gap-1">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded p-1.5 text-text-muted transition-colors hover:text-brand focus-ring"
              title="Live project"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded p-1.5 text-text-muted transition-colors hover:text-brand focus-ring"
              title="Source code"
            >
              <GitBranch className="h-4 w-4" />
            </a>
          )}
          {!project.url && !project.githubUrl && (
            <span className="text-[12px] text-text-muted">No links yet</span>
          )}
        </div>

        <Button
          variant={project.featured ? 'secondary' : 'ghost'}
          size="xs"
          onClick={onToggleFeatured}
          className={cn('rounded-full')}
        >
          <Star className={cn('h-3 w-3', project.featured && 'fill-warning text-warning')} />
          {project.featured ? 'Unfeature' : 'Feature'}
        </Button>
      </div>
    </motion.article>
  );
}
import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function PageHeader({
  title,
  description,
  actions,
  icon,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
import { type ComponentType, type ReactNode } from 'react';
import { Inbox, RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from './Button';
import { Spinner } from './Progress';
import { cn } from '../../lib/utils';

export function LoadingState({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-text-muted', className)}
    >
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-surface-active">
        <Icon className="h-5 w-5 text-text-muted" />
      </div>
      <p className="text-sm font-semibold text-text">{title}</p>
      {description && <p className="max-w-sm text-[13px] text-text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this data. Please try again.',
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-danger/40 bg-danger-subtle/50 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle">
        <TriangleAlert className="h-5 w-5 text-danger" />
      </div>
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="max-w-sm text-[13px] text-text-muted">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      )}
    </div>
  );
}
import { cn } from '../../lib/utils';

export function Kbd({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-active px-1 font-mono text-[10px] font-medium text-text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
import { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  onRemove?: () => void;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active, onRemove, children, type = 'button', ...props }, ref) => (
    <span className="inline-flex">
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 focus-ring',
          active
            ? 'border-brand bg-brand text-brand-foreground'
            : 'border-border bg-surface text-text-secondary hover:bg-surface-hover hover:text-text',
          onRemove && 'pl-2.5 pr-1.5',
          className,
        )}
        aria-pressed={active}
        {...props}
      >
        {children}
      </button>
      {onRemove && (
        <button
          type="button"
          aria-label="Remove filter"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            '-ml-1 inline-flex items-center rounded-full py-1 pr-2 pl-0.5 text-xs text-text-muted transition-colors hover:text-danger focus-ring',
            active ? 'text-brand-foreground/80 hover:text-brand-foreground' : '',
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  ),
);
Chip.displayName = 'Chip';

export interface ChipGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function ChipGroup({ label, className, children, ...props }: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)} role="group" aria-label={label} {...props}>
      {children}
    </div>
  );
}
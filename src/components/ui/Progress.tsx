import { forwardRef, type HTMLAttributes, type SVGProps } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} {...props} />;
}

export function Progress({
  value,
  className,
  tone = 'brand',
  size = 'md',
}: {
  value: number;
  className?: string;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}) {
  const toneMap = {
    brand: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
  } as const;
  const sizeMap = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  } as const;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-surface-active', sizeMap[size], className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', toneMap[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export const Spinner = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <Loader2 ref={ref} className={cn('h-5 w-5 animate-spin text-brand', className)} {...props} />
  ),
);
Spinner.displayName = 'Spinner';
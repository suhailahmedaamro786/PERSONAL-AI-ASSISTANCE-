import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
type Variant = 'soft' | 'solid' | 'outline';

const tones: Record<Tone, Record<Variant, string>> = {
  neutral: {
    soft: 'bg-surface-active text-text-secondary',
    solid: 'bg-text text-bg',
    outline: 'border border-border text-text-secondary bg-transparent',
  },
  brand: {
    soft: 'bg-brand-subtle text-brand',
    solid: 'bg-brand text-brand-foreground',
    outline: 'border border-brand/40 text-brand bg-transparent',
  },
  success: {
    soft: 'bg-success-subtle text-success',
    solid: 'bg-success text-white',
    outline: 'border border-success/40 text-success bg-transparent',
  },
  warning: {
    soft: 'bg-warning-subtle text-warning',
    solid: 'bg-warning text-white',
    outline: 'border border-warning/40 text-warning bg-transparent',
  },
  danger: {
    soft: 'bg-danger-subtle text-danger',
    solid: 'bg-danger text-white',
    outline: 'border border-danger/40 text-danger bg-transparent',
  },
  info: {
    soft: 'bg-info-subtle text-info',
    solid: 'bg-info text-white',
    outline: 'border border-info/40 text-info bg-transparent',
  },
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: Variant;
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = 'neutral', variant = 'soft', dot, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        tones[tone][variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', 'bg-current opacity-80')} />}
      {children}
    </span>
  ),
);
Badge.displayName = 'Badge';
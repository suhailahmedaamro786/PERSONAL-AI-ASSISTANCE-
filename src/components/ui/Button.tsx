import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'brand-soft';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm shadow-brand/20 active:scale-[0.98]',
  'brand-soft':
    'bg-brand-subtle text-brand hover:bg-brand-soft active:scale-[0.98]',
  secondary:
    'bg-surface-hover text-text border border-border hover:bg-surface-active active:scale-[0.98]',
  outline: 'bg-transparent text-text-secondary border border-border hover:bg-surface-hover',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text',
  danger: 'bg-danger text-white hover:opacity-90 active:scale-[0.98]',
  success: 'bg-success text-white hover:opacity-90 active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-lg',
  icon: 'h-9 w-9 rounded-md',
  'icon-sm': 'h-8 w-8 rounded-md',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-[background-color,color,transform,box-shadow,opacity] duration-150 focus-ring disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
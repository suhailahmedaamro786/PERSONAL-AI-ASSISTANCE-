import { forwardRef, type HTMLAttributes } from 'react';
import { UserRound } from 'lucide-react';
import { cn, initials } from '../../lib/utils';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
} as const;

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, name, src, size = 'md', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-brand-soft font-semibold text-brand ring-1 ring-border',
        sizes[size],
        className,
      )}
      aria-hidden={!name}
      role={name ? 'img' : undefined}
      aria-label={name ? `Avatar for ${name}` : undefined}
      {...props}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : name ? (
        initials(name.split(' ')[0], name.split(' ')[1])
      ) : (
        <UserRound className="h-1/2 w-1/2 opacity-60" />
      )}
    </span>
  ),
);
Avatar.displayName = 'Avatar';
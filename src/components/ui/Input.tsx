import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, wrapperClassName, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-muted shadow-xs transition-colors duration-150 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20',
              leftIcon && 'pl-9',
              error && 'border-danger focus:border-danger focus:ring-danger/20',
              className,
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

export interface SearchInputProps
  extends Omit<InputProps, 'leftIcon' | 'className'> {
  className?: string;
  onClear?: () => void;
  showClear?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { className, value, onClear, showClear = !!value, placeholder = 'Search…', ...props },
    ref,
  ) => (
    <div className={cn('relative', className)}>
      <Input
        ref={ref}
        leftIcon={<Search className="h-4 w-4" />}
        placeholder={placeholder}
        className="pr-9"
        value={value}
        {...props}
      />
      {showClear && onClear && <ClearButton onClick={onClear} />}
    </div>
  ),
);
SearchInput.displayName = 'SearchInput';

export function ClearButton({
  onClick,
  className,
  'aria-label': ariaLabel = 'Clear search',
}: {
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        'absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted transition-colors hover:bg-surface-active hover:text-text focus-ring',
        className,
      )}
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
import { forwardRef, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[96px] w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted shadow-xs transition-colors duration-150 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, wrapperClassName, label, id, ...props }, ref) => {
    const autoId = `sel_${Math.random().toString(36).slice(2, 8)}`;
    const selectId = id ?? autoId;
    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 pr-9 text-sm text-text shadow-xs transition-colors duration-150 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>
      </div>
    );
  },
);
Select.displayName = 'Select';
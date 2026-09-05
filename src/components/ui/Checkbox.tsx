import { forwardRef } from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Checkbox = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof RadixCheckbox.Root>
>(({ className, children, ...props }, ref) => (
  <RadixCheckbox.Root
    ref={ref}
    className={cn(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border-strong bg-surface text-white transition-colors focus-ring data-[state=checked]:border-brand data-[state=checked]:bg-brand',
      className,
    )}
    {...props}
  >
    <RadixCheckbox.Indicator>
      <Check className="h-3 w-3" strokeWidth={3.5} />
    </RadixCheckbox.Indicator>
    {children}
  </RadixCheckbox.Root>
));
Checkbox.displayName = 'Checkbox';

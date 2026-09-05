import { forwardRef } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

export const DropdownMenu = Dropdown.Root;
export const DropdownTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Dropdown.Trigger>
>(({ className, children, ...props }, ref) => (
  <Dropdown.Trigger
    ref={ref}
    className={cn('inline-flex focus-ring', className)}
    {...props}
  >
    {children}
  </Dropdown.Trigger>
));
DropdownTrigger.displayName = 'DropdownTrigger';

export const DropdownContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Dropdown.Content>
>(({ className, children, align = 'end', sideOffset = 6, ...props }, ref) => (
  <Dropdown.Portal>
    <Dropdown.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-44 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg data-[state=open]:animate-scale-in',
        className,
      )}
      {...props}
    >
      {children}
    </Dropdown.Content>
  </Dropdown.Portal>
));
DropdownContent.displayName = 'DropdownContent';

export function DropdownItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dropdown.Item>) {
  return (
    <Dropdown.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-text-secondary outline-none transition-colors hover:bg-surface-hover hover:text-text data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus-ring',
        className,
      )}
      {...props}
    >
      {children}
    </Dropdown.Item>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <Dropdown.Separator className={cn('my-1 h-px bg-border', className)} />;
}

export const DropdownLabel = Dropdown.Label;
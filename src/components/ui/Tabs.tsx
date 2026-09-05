import { type ReactNode } from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixTabs.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </RadixTabs.Root>
  );
}

export function TabsList({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <RadixTabs.List
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface-active p-0.5',
        className,
      )}
    >
      {children}
    </RadixTabs.List>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors duration-150 hover:text-text focus-ring data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-xs',
        className,
      )}
    >
      {children}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixTabs.Content value={value} className={cn('mt-4 focus-ring', className)}>
      {children}
    </RadixTabs.Content>
  );
}
import { type ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

export function Tooltip({
  children,
  content,
  side = 'right',
  className,
}: {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}) {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={8}
            className={cn(
              'z-50 max-w-xs rounded-md border border-border bg-text px-2.5 py-1.5 text-xs font-medium text-bg shadow-md',
              className,
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-text" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
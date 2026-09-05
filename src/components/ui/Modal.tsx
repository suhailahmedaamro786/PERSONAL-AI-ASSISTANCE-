import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Modal({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
  size = 'md',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-label={title}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl data-[state=open]:animate-scale-in',
            sizes[size],
            className,
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div className="flex flex-col gap-0.5">
                <Dialog.Title className="text-base font-semibold text-text">{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className="text-[13px] text-text-muted">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-ring"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
          )}
          <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  ),
);
ModalBody.displayName = 'ModalBody';

export const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 border-t border-border px-6 py-4', className)}
      {...props}
    />
  ),
);
ModalFooter.displayName = 'ModalFooter';
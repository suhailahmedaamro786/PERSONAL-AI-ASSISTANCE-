import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, XCircle, AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const iconColors = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-info',
  warning: 'text-warning',
};

export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 24, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-surface/95 p-3.5 shadow-lg backdrop-blur"
              role="status"
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconColors[t.variant])} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-[13px] leading-snug text-text-muted">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="rounded p-0.5 text-text-muted transition-colors hover:text-text focus-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
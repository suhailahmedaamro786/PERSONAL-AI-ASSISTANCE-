import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, ShieldAlert, Inbox } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { getIcon } from '../../lib/icons';
import { timeAgo } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Notification, NotificationType } from '../../types';
import { cn } from '../../lib/utils';

const typeTone: Record<NotificationType, 'danger' | 'warning' | 'info' | 'success'> = {
  urgent: 'danger',
  important: 'warning',
  info: 'info',
  success: 'success',
};

function NotificationItem({ n }: { n: Notification }) {
  const navigate = useNavigate();
  const markRead = useNotificationStore((s) => s.markRead);

  return (
    <button
      onClick={() => {
        markRead(n.id);
        if (n.actionUrl) navigate(n.actionUrl);
      }}
      className={cn(
        'block w-full px-4 py-3 text-left transition-colors hover:bg-surface-hover focus-ring',
        !n.read && 'bg-brand-subtle/40',
      )}
      aria-label={n.read ? n.title : `${n.title} — unread`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-active text-text-secondary">
          {(() => {
            const Icon = getIcon(n.category === 'ai' ? 'sparkles' : undefined);
            return <Icon className="h-4 w-4" />;
          })()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone={typeTone[n.type]} variant="soft">{n.type}</Badge>
            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />}
            <span className="ml-auto shrink-0 text-[11px] text-text-muted">{timeAgo(n.createdAt)}</span>
          </div>
          <p className="mt-1 text-[13px] font-medium leading-snug text-text">{n.title}</p>
          <p className="mt-0.5 text-xs leading-snug text-text-muted">{n.message}</p>
          {n.actionLabel && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand">
              {n.actionLabel} →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function NotificationCenter({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  useEffect(() => {
    if (open && notifications.length === 0) useNotificationStore.getState().fetch();
  }, [open, notifications.length]);

  const unread = notifications.filter((n) => !n.read).length;

  // Group by category, ordered by type severity.
  const order: Notification['category'][] = ['task', 'job', 'career', 'learning', 'ai', 'system'];
  const groups = order
    .map((cat) => ({ cat, items: notifications.filter((n) => n.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <Dropdown.Root open={open} onOpenChange={onOpenChange}>
      <Dropdown.Trigger asChild>{children}</Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={10}
          className="z-50 w-[min(92vw,400px)] overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-semibold text-text">Notifications</span>
              <Badge tone={unread > 0 ? 'brand' : 'neutral'} variant="soft">
                {unread} new
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Inbox className="h-6 w-6 text-text-muted" />
                  <p className="text-sm text-text-muted">No notifications yet.</p>
                </div>
              ) : (
                <motion.div initial="hidden" animate="visible" exit="hidden">
                  {groups.map(({ cat, items }) => (
                    <div key={cat} className="border-b border-border/60 last:border-0">
                      <p className="flex items-center gap-2 px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                        {cat === 'ai' ? 'AI activity' : `${cat}s`}
                        <span className="text-text-muted/60">{items.length > 1 ? `· ${items.length}` : ''}</span>
                      </p>
                      {items.map((n) => (
                        <NotificationItem key={n.id} n={n} />
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border px-4 py-2 text-center">
            <span className="text-[11px] text-text-muted">
              Intelligent grouping keeps things calm — no notification spam.
            </span>
          </div>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
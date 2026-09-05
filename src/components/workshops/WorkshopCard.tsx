import { motion } from 'framer-motion';
import { BadgeCheck, CalendarDays, ExternalLink, MapPin, Video } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn, friendlyWhen } from '../../lib/utils';
import { isRegistrationOpen, WORKSHOP_TONE } from '../../lib/workshops';
import type { Workshop } from '../../types';

export function WorkshopCard({
  workshop,
  registered,
  onRegister,
  index,
}: {
  workshop: Workshop;
  registered: boolean;
  onRegister: () => void;
  index: number;
}) {
  const open = isRegistrationOpen(workshop);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-xs transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-text">{workshop.title}</h3>
            <Badge tone={WORKSHOP_TONE[workshop.category]}>{workshop.category}</Badge>
          </div>
          <p className="mt-1 text-[13px] text-text-muted">{workshop.organization}</p>
        </div>
        <Badge variant="outline" tone="neutral" className="shrink-0 tabular-nums">
          {workshop.relevance}% match
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
        {workshop.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-secondary">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 text-text-muted" aria-hidden />
          {friendlyWhen(workshop.date)}
        </span>
        <span className="inline-flex items-center gap-1">
          {workshop.isOnline ? (
            <>
              <Video className="h-3.5 w-3.5 text-text-muted" aria-hidden /> Online
            </>
          ) : (
            <>
              <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden /> {workshop.city}
            </>
          )}
        </span>
        <span className="inline-flex items-center rounded-full bg-surface-active px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {workshop.isFree ? 'Free' : 'Paid'}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
        <div className="min-w-0">
          {workshop.url ? (
            <a
              href={workshop.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded text-[13px] font-semibold text-brand transition-colors hover:text-brand-hover focus-ring"
            >
              Details <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="text-[13px] text-text-muted">No external link</span>
          )}
        </div>

        {registered ? (
          <Button variant="success" size="sm" disabled>
            <BadgeCheck className="h-3.5 w-3.5" /> Registered
          </Button>
        ) : (
          <Button
            variant="brand-soft"
            size="sm"
            disabled={!open}
            onClick={onRegister}
            title={open ? 'Register for this workshop' : 'Registration has closed'}
            className={cn(!open && 'opacity-50')}
          >
            {open ? 'Register' : 'Closed'}
          </Button>
        )}
      </div>
    </motion.article>
  );
}

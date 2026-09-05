import { Clock, MapPin, Video } from 'lucide-react';
import { CLASS_ACCENT } from '../../lib/classes';
import { cn } from '../../lib/utils';
import type { ClassSession } from '../../types';

export function ClassCard({ cls }: { cls: ClassSession }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        <span
          className={cn('h-2 w-2 shrink-0 rounded-full', CLASS_ACCENT[cls.color] ?? 'bg-brand')}
          aria-hidden
        />
        <span className="truncate text-[13px] font-semibold text-text">{cls.name}</span>
      </div>
      <p className="mt-1 truncate text-[12px] text-text-muted">{cls.instructor}</p>
      <div className="mt-2 flex items-center gap-1.5 text-[12px] text-text-secondary tabular-nums">
        <Clock className="h-3.5 w-3.5 text-text-muted" aria-hidden />
        {cls.startTime} – {cls.endTime}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-text-secondary">
        {cls.isOnline ? (
          <>
            <Video className="h-3.5 w-3.5 text-text-muted" aria-hidden /> Online
          </>
        ) : (
          <>
            <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden />
            <span className="truncate">{cls.location}</span>
          </>
        )}
      </div>
    </div>
  );
}

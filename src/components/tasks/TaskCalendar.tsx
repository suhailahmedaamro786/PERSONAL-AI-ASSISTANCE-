import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import type { Task, Priority } from '../../types';
import { tasksByDay, formatDayKey } from '../../lib/tasks';
import { TaskCard } from './TaskCard';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/states';
import { cn } from '../../lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOT_COLOR: Record<Priority, string> = {
  critical: 'bg-danger',
  high: 'bg-warning',
  medium: 'bg-info',
  low: 'bg-text-muted',
};

export function TaskCalendar({ tasks }: { tasks: Task[] }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(() => new Date());

  const byDay = useMemo(() => tasksByDay(tasks), [tasks]);
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const selectedTasks = useMemo(() => byDay.get(formatDayKey(selected)) ?? [], [byDay, selected]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-text">{format(cursor, 'MMMM yyyy')}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => setCursor(addMonths(cursor, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setCursor(startOfMonth(new Date())); setSelected(new Date()); }}>
              Today
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => setCursor(addMonths(cursor, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1 rounded-xl border border-border bg-surface p-2 shadow-xs">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {w}
            </div>
          ))}
          {days.map((day) => {
            const key = formatDayKey(day);
            const dayTasks = byDay.get(key) ?? [];
            const inMonth = isSameMonth(day, cursor);
            const isSel = isSameDay(day, selected);
            const isTod = isToday(day);
            return (
              <button
                key={key}
                onClick={() => setSelected(day)}
                aria-label={format(day, 'EEE, MMM d')}
                aria-pressed={isSel}
                className={cn(
                  'flex h-11 flex-col items-center justify-start gap-0.5 rounded-lg border border-transparent p-1 text-sm transition-colors focus-ring',
                  inMonth ? 'text-text' : 'text-text-muted/40',
                  isSel && 'border-brand bg-brand-subtle',
                  isTod && !isSel && 'border-brand/50',
                )}
              >
                <span className={cn('leading-none', isTod && 'font-bold text-brand')}>
                  {format(day, 'd')}
                </span>
                <span className="flex items-center gap-0.5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={cn('h-1 w-1 rounded-full', DOT_COLOR[t.priority])}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] font-semibold text-text-muted">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2">
        <h4 className="mb-2 text-[13px] font-semibold text-text-secondary">
          {isSameDay(selected, new Date()) ? 'Today' : format(selected, 'EEEE, MMM d')}
        </h4>
        {selectedTasks.length === 0 ? (
          <EmptyState
            title="No tasks due"
            description="Nothing scheduled for this day."
            icon={CalendarDays}
            className="py-8"
          />
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

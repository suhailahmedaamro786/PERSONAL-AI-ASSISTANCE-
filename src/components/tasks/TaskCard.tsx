import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Check, Ellipsis, GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { categoryIcon } from '../../lib/icons';
import { friendlyWhen, formatDuration, cn } from '../../lib/utils';
import { priorityTone, priorityLabel } from '../../lib/tasks';
import { useTaskStore } from '../../store/taskStore';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '../ui/DropdownMenu';

export interface TaskCardProps {
  task: Task;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  /** Rendered when the card is part of a draggable sortable list. */
  dragHandle?: React.ReactNode;
  className?: string;
}

export function CompleteButton({ task }: { task: Task }) {
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const done = task.status === 'done';
  return (
    <button
      onClick={() => toggleComplete(task.id)}
      aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
      className={cn(
        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 focus-ring',
        done ? 'border-success bg-success' : 'border-border-strong bg-surface hover:border-brand',
      )}
    >
      <AnimatePresence>
        {done && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          >
            <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function DragHandle({ label = 'Drag to reorder' }: { label?: string }) {
  return (
    <button
      className="mt-0.5 cursor-grab touch-none rounded-md p-0.5 text-text-muted opacity-0 transition-opacity hover:text-text group-hover:opacity-100 focus-ring active:cursor-grabbing"
      aria-label={label}
      tabIndex={-1}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

export const TaskCard = memo(function TaskCard({
  task,
  selectable,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  dragHandle,
  className,
}: TaskCardProps) {
  const Icon = categoryIcon(task.category);

  return (
    <article
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border bg-surface p-4 shadow-xs ring-brand/15 transition-colors',
        task.priority === 'critical' ? 'border-danger/40' : 'border-border',
        task.status === 'done' && 'opacity-60',
        selected && 'border-brand/70 ring-2',
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        {dragHandle}
        <CompleteButton task={task} />
        {selectable && (
          <Checkbox
            checked={!!selected}
            onCheckedChange={() => onToggleSelect?.(task.id)}
            aria-label={`Select ${task.title}`}
            className="mt-0.5"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={priorityTone[task.priority]} variant="soft">
            {priorityLabel[task.priority]} priority
          </Badge>
          <Badge tone="neutral" variant="outline" className="normal-case">
            {task.category}
          </Badge>
          {task.source === 'ai' && (
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-brand">
              <ArrowUpRight className="h-3 w-3" aria-hidden /> AI plan
            </span>
          )}
        </div>

        <h3
          className={cn(
            'mt-1.5 text-[15px] font-semibold text-text',
            task.status === 'done' && 'text-text-muted line-through decoration-text-muted/60',
          )}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-[13px] text-text-secondary">{task.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-muted">
          <span className="inline-flex items-center gap-1 font-medium text-text-secondary">
            {friendlyWhen(task.deadline)}
          </span>
          <span className="tabular-nums inline-flex items-center gap-1">
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {formatDuration(task.estimatedMinutes)}
          </span>
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-surface-active px-1.5 py-0.5 text-[11px] font-medium text-text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {(onEdit || onDelete) && (
        <DropdownMenu>
          <DropdownTrigger asChild>
            <button
              aria-label={`Actions for ${task.title}`}
              className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-ring"
            >
              <Ellipsis className="h-4 w-4" />
            </button>
          </DropdownTrigger>
          <DropdownContent align="end">
            {onEdit && (
              <DropdownItem onSelect={() => onEdit(task)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownItem>
            )}
            {onDelete && (
              <>
                <DropdownSeparator />
                <DropdownItem
                  onSelect={() => onDelete(task)}
                  className="text-danger hover:bg-danger-subtle hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownItem>
              </>
            )}
          </DropdownContent>
        </DropdownMenu>
      )}
    </article>
  );
});

import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { TaskCard, DragHandle, type TaskCardProps } from './TaskCard';
import { cn } from '../../lib/utils';

interface SortableTaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function SortableTaskList({ tasks, onEdit, onDelete }: SortableTaskListProps) {
  const reorder = useTaskStore((s) => s.reorder);
  const selected = useTaskStore((s) => s.selected);
  const toggleSelect = useTaskStore((s) => s.toggleSelect);
  const [dndItems, setDndItems] = useState<string[] | null>(null);

  // Local reorder buffer so dragging feels instant; persisted on drop.
  const orderedIds = dndItems ?? tasks.map((t) => t.id);
  const byId = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDndItems(null);
    if (!over || active.id === over.id) return;
    const ids = [...orderedIds];
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const next = arrayMove(ids, from, to);
    void reorder(next);
  }

  const visible = orderedIds.map((id) => byId.get(id)).filter((t): t is Task => !!t);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2.5" role="list">
          {visible.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              selected={selected.includes(task.id)}
              onToggleSelect={toggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableTaskItem(
  props: Omit<TaskCardProps, 'dragHandle'> & { task: Task },
) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.task.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="list-none"
    >
      <TaskCard
        {...props}
        selectable
        dragHandle={
          <span
            {...attributes}
            {...listeners}
            className={cn('inline-flex', isDragging && 'cursor-grabbing')}
          >
            <DragHandle />
          </span>
        }
        className={cn(isDragging && 'z-10 opacity-90 shadow-lg ring-2 ring-brand/30')}
      />
    </li>
  );
}

import { useEffect, useState } from 'react';
import { z } from 'zod';
import type { Priority, Task, TaskCategory } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { TASK_CATEGORIES, TASK_CATEGORY_LABEL } from '../../lib/constants';
import { priorityLabel } from '../../lib/tasks';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Chip, ChipGroup } from '../ui/Chip';

const RECURRENCES = [
  { value: '', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Keep it under 120 characters'),
  description: z.string().trim().max(600),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum(['career', 'learning', 'job', 'personal', 'portfolio', 'health']),
  estimatedMinutes: z.coerce
    .number()
    .min(1, 'Estimate at least 1 minute')
    .max(600, 'Keep it under 10 hours'),
  deadlineDate: z.string().optional(),
  dueTime: z.string().optional(),
  recurrence: z
    .enum(['daily', 'weekdays', 'weekly', 'biweekly', 'monthly'])
    .or(z.literal(''))
    .transform((v) => (v === '' ? null : v)),
  tags: z.string().optional(),
});

type FormState = {
  title: string;
  description: string;
  priority: Priority;
  category: TaskCategory;
  estimatedMinutes: string;
  deadlineDate: string;
  dueTime: string;
  recurrence: string;
  tags: string;
};

function toDateInput(iso?: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function toTimeInput(iso?: string | null): string {
  if (!iso) return '';
  return iso.slice(11, 16);
}

export function TaskModal({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}) {
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [form, setForm] = useState<FormState>(defaults());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        task
          ? {
              title: task.title,
              description: task.description,
              priority: task.priority,
              category: task.category,
              estimatedMinutes: String(task.estimatedMinutes ?? 30),
              deadlineDate: toDateInput(task.deadline),
              dueTime: task.dueTime ?? toTimeInput(task.deadline),
              recurrence: task.recurrence ?? '',
              tags: task.tags.join(', '),
            }
          : defaults(),
      );
      setErrors({});
    }
  }, [open, task]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    const v = parsed.data;
    const deadline = buildDeadline(v.deadlineDate, v.dueTime);
    const tags = (v.tags ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (task) {
        await updateTask(task.id, {
          title: v.title,
          description: v.description,
          priority: v.priority,
          category: v.category,
          estimatedMinutes: v.estimatedMinutes,
          deadline,
          recurrence: v.recurrence ?? null,
          tags,
        });
      } else {
        await addTask({
          title: v.title,
          description: v.description,
          priority: v.priority,
          category: v.category,
          estimatedMinutes: v.estimatedMinutes,
          deadline,
          dueTime: v.dueTime || null,
          recurrence: v.recurrence ?? null,
          tags,
          actualMinutes: null,
          source: 'user',
          linkedJobId: null,
          linkedCourseId: null,
        });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={task ? 'Edit task' : 'New task'}
      description={task ? 'Update the details below.' : 'Plan something new for your day.'}
    >
      <div className="grid gap-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Finish FastAPI module"
          error={errors.title}
          autoFocus
        />

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">Category</span>
          <ChipGroup label="Category">
            {TASK_CATEGORIES.map((c: TaskCategory) => (
              <Chip key={c} active={form.category === c} onClick={() => set('category', c)}>
                {TASK_CATEGORY_LABEL[c]}
              </Chip>
            ))}
          </ChipGroup>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">Priority</span>
          <ChipGroup label="Priority">
            {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
              <Chip key={p} active={form.priority === p} onClick={() => set('priority', p)}>
                {priorityLabel[p]}
              </Chip>
            ))}
          </ChipGroup>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due date"
            type="date"
            value={form.deadlineDate}
            onChange={(e) => set('deadlineDate', e.target.value)}
          />
          <Input
            label="Due time"
            type="time"
            value={form.dueTime}
            onChange={(e) => set('dueTime', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Estimate (minutes)"
            type="number"
            min={1}
            max={600}
            value={form.estimatedMinutes}
            onChange={(e) => set('estimatedMinutes', e.target.value)}
            error={errors.estimatedMinutes}
          />
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">
              Repeat
            </span>
            <div className="flex h-10 flex-wrap items-center gap-1.5">
              {RECURRENCES.map((r) => (
                <Chip
                  key={r.value}
                  active={form.recurrence === r.value}
                  onClick={() => set('recurrence', r.value)}
                >
                  {r.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-text-secondary">Description</span>
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Optional notes…"
            rows={3}
          />
        </div>

        <Input
          label="Tags"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          placeholder="ai, exam, focus (comma separated)"
        />
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={saving}>
          {task ? 'Save changes' : 'Create task'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function defaults(): FormState {
  return {
    title: '',
    description: '',
    priority: 'medium',
    category: 'learning',
    estimatedMinutes: '30',
    deadlineDate: '',
    dueTime: '',
    recurrence: '',
    tags: '',
  };
}

function buildDeadline(deadlineDate?: string, dueTime?: string): string | null {
  if (!deadlineDate) return null;
  const time = dueTime || '23:59';
  const d = new Date(`${deadlineDate}T${time}:00`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

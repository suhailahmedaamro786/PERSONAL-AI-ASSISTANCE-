import type { Task } from '../../types';
import type { TaskView } from '../../store/taskStore';
import { useTaskStore } from '../../store/taskStore';
import { viewCounts, VIEW_LABEL } from '../../lib/tasks';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';

const VIEWS: TaskView[] = ['today', 'upcoming', 'overdue', 'completed', 'calendar', 'all'];

export function TaskViewTabs({ tasks }: { tasks: Task[] }) {
  const view = useTaskStore((s) => s.filter.view);
  const setFilter = useTaskStore((s) => s.setFilter);
  const counts = viewCounts(tasks);

  return (
    <Tabs value={view} onValueChange={(v) => setFilter({ view: v as TaskView })}>
      <TabsList label="Task views" className="flex-wrap">
        {VIEWS.map((v) => (
          <TabsTrigger key={v} value={v}>
            <span>{VIEW_LABEL[v]}</span>
            <span className="tabular-nums rounded-full bg-surface-active px-1.5 text-[11px] font-semibold text-text-muted">
              {counts[v]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

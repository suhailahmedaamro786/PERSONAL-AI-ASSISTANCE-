import { useEffect, useMemo, useState } from 'react';
import { Plus, Mail, Download } from 'lucide-react';
import { exportRowsAsCSV } from '../lib/export';
import type { Task } from '../types';
import type { TaskView } from '../store/taskStore';
import { useTaskStore } from '../store/taskStore';
import { filterTasks, VIEW_LABEL } from '../lib/tasks';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { TaskViewTabs } from '../components/tasks/TaskViewTabs';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { SortableTaskList } from '../components/tasks/SortableTaskList';
import { TaskCalendar } from '../components/tasks/TaskCalendar';
import { TaskBulkBar } from '../components/tasks/TaskBulkBar';
import { TaskModal } from '../components/tasks/TaskModal';
import { EmailSyncModal } from '../components/tasks/EmailSyncModal';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/states';

const EMPTY_COPY: Record<Exclude<TaskView, 'calendar'>, { title: string; description: string }> = {
  today: { title: 'All clear for today', description: 'Nothing due right now. Enjoy the pause.' },
  upcoming: { title: 'Nothing scheduled', description: 'Tasks with future deadlines will show up here.' },
  overdue: { title: 'No overdue tasks', description: 'You are all caught up. Nice work.' },
  completed: { title: 'Nothing completed yet', description: 'Check off a task to see it here.' },
  all: { title: 'No tasks match', description: 'Try adjusting your filters or create a new task.' },
};

export default function TasksPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const loading = useTaskStore((s) => s.loading);
  const filter = useTaskStore((s) => s.filter);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  const [modalOpen, setModalOpen] = useState(false);
  const [emailSyncOpen, setEmailSyncOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (useTaskStore.getState().tasks.length === 0) void fetchTasks();
  }, [fetchTasks]);

  const visible = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);

  const view = filter.view;
  const isCalendar = view === 'calendar';

  function openCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }
  function openEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }
  function handleDelete(task: Task) {
    void useTaskStore.getState().removeTask(task.id);
  }

  function handleExport() {
    exportRowsAsCSV(
      `tasks-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Title', 'Status', 'Priority', 'Category', 'Due', 'Est. min', 'Tags', 'Source'],
      tasks.map((t) => [
        t.title,
        t.status,
        t.priority,
        t.category,
        t.deadline ? new Date(t.deadline).toLocaleDateString() : '',
        String(t.estimatedMinutes ?? ''),
        t.tags.join('; '),
        t.source,
      ]),
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        description="Plan, prioritize, and auto-sync deadlines from email."
        actions={
          <div className="flex items-center gap-2">
            {tasks.length > 0 && (
              <Button variant="secondary" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEmailSyncOpen(true)}>
              <Mail className="h-4 w-4 text-brand" /> Scan Emails
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          </div>
        }
      />

      <div className="mb-4">
        <TaskViewTabs tasks={tasks} />
      </div>
      <div className="mb-5">
        <TaskFilters />
      </div>

      {loading && tasks.length === 0 ? (
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isCalendar ? (
        <TaskCalendar tasks={tasks} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={EMPTY_COPY[view as Exclude<TaskView, 'calendar'>].title}
          description={EMPTY_COPY[view as Exclude<TaskView, 'calendar'>].description}
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" /> New task
            </Button>
          }
        />
      ) : (
        <div aria-label={`${VIEW_LABEL[view]} tasks`}>
          <SortableTaskList
            tasks={visible}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
          <p className="sr-only">
            {visible.length} {visible.length === 1 ? 'task' : 'tasks'} in {VIEW_LABEL[view]}
          </p>
        </div>
      )}

      <TaskBulkBar />
      <TaskModal open={modalOpen} onOpenChange={setModalOpen} task={editingTask} />
      <EmailSyncModal open={emailSyncOpen} onOpenChange={setEmailSyncOpen} />
    </PageContainer>
  );
}

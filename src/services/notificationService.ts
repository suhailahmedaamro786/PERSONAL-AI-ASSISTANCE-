import { useSettingsStore } from '../store/settingsStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Notification, Task, Job } from '../types';

/** Build a single notification (no persistence) for quick, preference-gated pushes. */
function build(input: Omit<Notification, 'id' | 'createdAt'>): Omit<Notification, 'id' | 'createdAt'> {
  return input;
}

/**
 * Emit a notification if the corresponding preference is enabled.
 * Respects the Settings → Notifications toggles.
 */
export async function notify(
  input: Omit<Notification, 'id' | 'createdAt'>,
): Promise<void> {
  const { notificationPrefs } = useSettingsStore.getState();
  const enabled =
    input.category === 'task' ? notificationPrefs.taskReminders
    : input.category === 'job' ? notificationPrefs.jobMatchAlerts
    : input.category === 'learning' ? notificationPrefs.workshopAnnouncements
    : true;
  if (!enabled) return;
  await useNotificationStore.getState().create(build(input));
}

/** Create a "task due soon" notification for a task, if reminders are on. */
export async function notifyTaskDue(task: Task): Promise<void> {
  await notify({
    title: 'Task deadline approaching',
    message: `"${task.title}" is due ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'soon'}.`,
    type: task.priority === 'high' ? 'urgent' : 'important',
    category: 'task',
    read: false,
    actionUrl: '/tasks',
    actionLabel: 'View Tasks',
  });
}

/** Create a "new job match" notification when a job matches the profile. */
export async function notifyJobMatch(job: Job): Promise<void> {
  await notify({
    title: 'New job matches your skills',
    message: `${job.title} at ${job.company} (${job.location}) matches ${job.matchPercentage}% of your skills.`,
    type: job.matchPercentage >= 70 ? 'success' : 'info',
    category: 'job',
    read: false,
    actionUrl: '/jobs',
    actionLabel: 'View Jobs',
  });
}

/** Create a "registered for workshop" confirmation notification. */
export async function notifyWorkshopRegistered(title: string): Promise<void> {
  await notify({
    title: 'Workshop registered',
    message: `You registered for "${title}". A task was added to your board.`,
    type: 'success',
    category: 'learning',
    read: false,
    actionUrl: '/workshops',
    actionLabel: 'View Workshops',
  });
}

/**
 * Startup sweep — generate deadline reminders for tasks due within 48h.
 * Called once after the task store has loaded (avoids duplicate ids by only
 * firing for tasks that still lack a matching reminder).
 */
export async function sweepDeadlineReminders(tasks: Task[]): Promise<void> {
  const { notificationPrefs } = useSettingsStore.getState();
  if (!notificationPrefs.taskReminders) return;
  const now = Date.now();
  const window = 48 * 60 * 60 * 1000;
  for (const task of tasks) {
    if (task.status === 'done' || task.status === 'cancelled') continue;
    if (!task.deadline) continue;
    const due = new Date(task.deadline).getTime();
    if (due > now && due - now <= window) {
      await notifyTaskDue(task);
    }
  }
}

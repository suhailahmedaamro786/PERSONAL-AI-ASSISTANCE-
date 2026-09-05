import { useState } from 'react';
import { Mail, Sparkles, Check, Clock, Plus, Inbox, Link, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  extractTasksFromEmails,
  isGmailConnected,
  type ExtractedEmailTask,
} from '../../services/emailTaskService';
import { buildAuthUrl } from '../../services/gmailService';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUIStore } from '../../store/uiStore';

interface EmailSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailSyncModal({ open, onOpenChange }: EmailSyncModalProps) {
  const { addTask } = useTaskStore();
  const { user, disconnectEmail } = useAuthStore();
  const { setGmailTokens } = useSettingsStore();
  const { toast } = useUIStore();

  const [loading, setLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedEmailTask[]>([]);
  const [customEmailText, setCustomEmailText] = useState('');
  const [addedTaskIndices, setAddedTaskIndices] = useState<number[]>([]);
  const [scanSource, setScanSource] = useState<'inbox' | 'pasted'>('inbox');

  const [connected, setConnected] = useState(isGmailConnected());

  const connectGmail = () => {
    const url = buildAuthUrl();
    window.location.href = url;
  };

  const handleScanEmails = async () => {
    setLoading(true);
    setAddedTaskIndices([]);
    try {
      const tasks = await extractTasksFromEmails({
        useInbox: scanSource === 'inbox',
        rawEmailContent: scanSource === 'pasted' ? customEmailText : undefined,
      });
      setExtractedTasks(tasks);
      setConnected(isGmailConnected());
      if (tasks.length === 0) {
        toast({
          title: 'No tasks found',
          description:
            scanSource === 'inbox'
              ? 'No actionable tasks found in your recent inbox emails (or Gmail is not connected).'
              : 'Paste an email that contains a deadline, assignment, or interview to extract tasks.',
          variant: 'info',
        });
      } else {
        toast({
          title: 'Emails Scanned',
          description: `Found ${tasks.length} actionable tasks.`,
          variant: 'success',
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Scan Failed',
        description: 'Unable to parse emails. Make sure Gmail is connected.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingleTask = async (task: ExtractedEmailTask, index: number) => {
    await addTask({
      title: task.title,
      description: `${task.description}\n\n[Extracted from Email: "${task.emailSubject}" from ${task.sender}]`,
      priority: task.priority,
      category: task.category,
      estimatedMinutes: task.estimatedMinutes,
      actualMinutes: null,
      deadline: task.deadline,
      recurrence: null,
      tags: ['Email Auto-Task', task.category],
      source: 'ai',
      linkedJobId: null,
      linkedCourseId: null,
    });
    setAddedTaskIndices((prev) => [...prev, index]);
    toast({
      title: 'Task Added',
      description: `"${task.title}" added to your task board.`,
      variant: 'success',
    });
  };

  const handleAddAllTasks = async () => {
    const remaining = extractedTasks.filter((_, i) => !addedTaskIndices.includes(i));
    for (let i = 0; i < remaining.length; i++) {
      const origIndex = extractedTasks.findIndex(
        (t) => t.emailId === remaining[i].emailId && t.title === remaining[i].title
      );
      await handleAddSingleTask(remaining[i], origIndex);
    }
    toast({
      title: 'All Tasks Imported',
      description: 'All extracted tasks have been synced to your board.',
      variant: 'success',
    });
    setTimeout(() => onOpenChange(false), 500);
  };

  const handleDisconnect = () => {
    setGmailTokens(null);
    disconnectEmail();
    setConnected(false);
    setExtractedTasks([]);
    toast({ title: 'Gmail Disconnected', description: 'Email link removed.', variant: 'info' });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Scan Email for Tasks & Deadlines"
      size="lg"
    >
      <div className="space-y-4 pt-1">
        {/* Connection status */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-hover p-3">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-brand/10 p-2 text-brand">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">
                {connected
                  ? `Gmail Connected: ${user?.connectedEmailAddress || '—'}`
                  : 'Not connected to Gmail'}
              </p>
              <p className="text-xs text-text-muted">
                {connected
                  ? 'AI scans your real inbox for deadlines, assignments, and interviews.'
                  : 'Connect your Gmail to scan your real inbox for tasks.'}
              </p>
            </div>
          </div>
          {connected ? (
            <Button size="sm" variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button size="sm" variant="primary" onClick={connectGmail}>
              <Link className="h-3.5 w-3.5 mr-1.5" /> Connect Gmail
            </Button>
          )}
        </div>

        {/* Scan source switch */}
        {!connected && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScanSource('inbox')}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                scanSource === 'inbox'
                  ? 'border-brand bg-brand-subtle text-brand'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <Inbox className="h-4 w-4" /> Scan Inbox
            </button>
            <button
              onClick={() => setScanSource('pasted')}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                scanSource === 'pasted'
                  ? 'border-brand bg-brand-subtle text-brand'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              Paste Email Text
            </button>
          </div>
        )}

        {connected && (
          <Button
            size="sm"
            variant="primary"
            loading={loading}
            onClick={handleScanEmails}
            className="w-full"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Scan My Real Inbox for Tasks
          </Button>
        )}

        {scanSource === 'pasted' && !connected && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">
              Don't have Gmail connected? Paste any email text below and AI will extract tasks from it.
            </p>
            <textarea
              rows={5}
              value={customEmailText}
              onChange={(e) => setCustomEmailText(e.target.value)}
              placeholder="Paste email(s) here — e.g. an assignment email, interview invite, workshop announcement..."
              className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-text placeholder:text-text-muted focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <Button
              size="sm"
              variant="primary"
              loading={loading}
              onClick={handleScanEmails}
              disabled={!customEmailText.trim()}
              className="w-full"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Extract Tasks from Pasted Email
            </Button>
          </div>
        )}

        {!connected && scanSource === 'inbox' && (
          <div className="rounded-lg bg-surface-hover p-3 text-xs text-text-muted flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            <span>
              Connect your Gmail to automatically read your real inbox. We only read emails
              (read-only scope) and extract deadlines as tasks. You can disconnect anytime.
            </span>
          </div>
        )}

        {/* Extracted Tasks List */}
        {extractedTasks.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Extracted Action Items ({extractedTasks.length})
              </p>
              <Button size="xs" variant="brand-soft" onClick={handleAddAllTasks} disabled={addedTaskIndices.length === extractedTasks.length}>
                <Check className="h-3 w-3 mr-1" /> Import All to Board
              </Button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {extractedTasks.map((t, idx) => {
                const isAdded = addedTaskIndices.includes(idx);
                return (
                  <div
                    key={t.emailId + idx}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-active"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text">{t.title}</p>
                        <Badge tone={t.priority === 'critical' || t.priority === 'high' ? 'danger' : 'neutral'}>
                          {t.priority}
                        </Badge>
                        <Badge tone="brand" variant="outline">
                          {t.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2">{t.description}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-text-muted">
                        <span className="flex items-center gap-1 font-mono max-w-[50%] truncate">
                          <Inbox className="h-3 w-3" /> {t.emailSubject}
                        </span>
                        {t.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-warning" />
                            {new Date(t.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isAdded ? 'secondary' : 'primary'}
                      disabled={isAdded}
                      onClick={() => handleAddSingleTask(t, idx)}
                      className="shrink-0"
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Task
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

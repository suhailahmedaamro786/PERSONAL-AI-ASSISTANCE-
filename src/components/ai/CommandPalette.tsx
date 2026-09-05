import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { CornerDownLeft } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { useCtrlK } from '../../hooks/useKeyboardShortcuts';
import { useAICoachStore } from '../../store/aiCoachStore';
import { getIcon } from '../../lib/icons';

type Group = 'Navigation' | 'Tasks' | 'Career' | 'AI' | 'Settings';

interface Cmd {
  id: string;
  label: string;
  description: string;
  icon: string;
  group: Group;
  keywords?: string[];
  run: () => void;
}

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const navigate = useNavigate();
  const setFilter = useTaskStore((s) => s.setFilter);
  const send = useAICoachStore((s) => s.send);

  useCtrlK(() => setOpen(!open));

  const commands: Cmd[] = useMemo(
    () => [
      { id: 'nav-dash', label: 'Go to Dashboard', description: 'Overview of your day', icon: 'layout-dashboard', group: 'Navigation', keywords: ['home', 'overview', 'today'], run: () => navigate('/') },
      { id: 'nav-tasks', label: 'Open Tasks', description: 'Today, overdue, calendar', icon: 'check-square', group: 'Navigation', keywords: ['todo', 'list'], run: () => navigate('/tasks') },
      { id: 'nav-career', label: 'Open Career', description: 'Readiness & skill gaps', icon: 'target', group: 'Navigation', keywords: ['skills', 'readiness'], run: () => navigate('/career') },
      { id: 'nav-jobs', label: 'Open Jobs', description: 'Matching opportunities', icon: 'briefcase', group: 'Navigation', keywords: ['apply', 'work'], run: () => navigate('/jobs') },
      { id: 'nav-learning', label: 'Open Learning', description: 'Courses, roadmap, streak', icon: 'book-open', group: 'Navigation', keywords: ['course', 'study'], run: () => navigate('/learning') },
      { id: 'nav-workshops', label: 'Open Workshops', description: 'Dadu, Hyderabad & online', icon: 'calendar-clock', group: 'Navigation', keywords: ['events', 'training'], run: () => navigate('/workshops') },
      { id: 'nav-portfolio', label: 'Open Portfolio', description: 'Scores & recommendations', icon: 'folder-git-2', group: 'Navigation', keywords: ['projects'], run: () => navigate('/portfolio') },
      { id: 'nav-profile', label: 'Open Profile', description: 'Personal details & CV', icon: 'user', group: 'Navigation', keywords: ['cv', 'about'], run: () => navigate('/profile') },
      {
        id: 'task-overdue', label: 'Show overdue tasks', description: 'Filter the task list to overdue', icon: 'alert-circle', group: 'Tasks', keywords: ['late', 'missing'],
        run: () => { setFilter({ view: 'overdue' }); navigate('/tasks'); },
      },
      {
        id: 'task-today', label: 'Show today’s tasks', description: 'Filter tasks due today', icon: 'calendar-check', group: 'Tasks', keywords: ['today', 'due'],
        run: () => { setFilter({ view: 'today' }); navigate('/tasks'); },
      },
      {
        id: 'task-completed', label: 'Show completed tasks', description: 'Your recent wins', icon: 'circle-check', group: 'Tasks', keywords: ['done'],
        run: () => { setFilter({ view: 'completed' }); navigate('/tasks'); },
      },
      {
        id: 'career-progress', label: 'Show career progress', description: 'Readiness score & gaps', icon: 'trending-up', group: 'Career', keywords: ['score', 'readiness'],
        run: () => navigate('/career'),
      },
      {
        id: 'career-skillgap', label: 'Analyze skill gaps', description: 'Target: AI Engineer', icon: 'target', group: 'Career', keywords: ['skills', 'missing'],
        run: () => navigate('/career'),
      },
      {
        id: 'ai-plan', label: 'Plan my day', description: 'Generate today’s plan', icon: 'sparkles', group: 'AI', keywords: ['plan', 'schedule'],
        run: () => { navigate('/ai-coach'); send('Plan my day'); },
      },
      {
        id: 'ai-jobs', label: 'Find suitable jobs', description: 'Best matches for your profile', icon: 'briefcase', group: 'AI', keywords: ['job search'],
        run: () => { navigate('/ai-coach'); send('Find suitable jobs'); },
      },
      {
        id: 'ai-workshops', label: 'Find workshops in Dadu', description: 'Local opportunities', icon: 'map-pin', group: 'AI', keywords: ['dadu', 'events'],
        run: () => { navigate('/ai-coach'); send('Find workshops in Dadu'); },
      },
      {
        id: 'ai-cv', label: 'Analyze my CV', description: 'Improve your resume', icon: 'file-text', group: 'AI', keywords: ['resume'],
        run: () => { navigate('/ai-coach'); send('Analyze my CV'); },
      },
      {
        id: 'ai-portfolio', label: 'Improve my portfolio', description: 'Portfolio recommendations', icon: 'folder-git-2', group: 'AI', keywords: ['portfolio'],
        run: () => { navigate('/ai-coach'); send('Improve my portfolio'); },
      },
      {
        id: 'ai-learn', label: 'What should I learn today?', description: 'Personal roadmap advice', icon: 'book-open', group: 'AI', keywords: ['learn', 'study'],
        run: () => { navigate('/ai-coach'); send('What should I learn today?'); },
      },
      {
        id: 'set-theme', label: 'Open Settings', description: 'Theme, shortcuts & more', icon: 'settings', group: 'Settings', keywords: ['preferences'],
        run: () => navigate('/settings'),
      },
    ],
    [navigate, setFilter, send, open],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-[18%] z-50 w-[min(92vw,620px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl data-[state=open]:animate-scale-in"
          aria-label="Command center"
        >
          <Command
            className="p-0"
            filter={(value, search) => {
              const item = commands.find((c) => c.id === value);
              const hay = `${item?.label} ${item?.description} ${item?.keywords?.join(' ')}`.toLowerCase();
              return hay.includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <Command.Input
              placeholder="Search or ask AI… e.g. “plan my day”"
              className="h-14 w-full border-b border-border bg-transparent px-5 text-[15px] text-text placeholder:text-text-muted focus:outline-none"
              aria-label="Search commands or ask AI"
            />
            <Command.List className="max-h-[320px] overflow-y-auto p-2">
              <Command.Empty className="px-4 py-8 text-center text-sm text-text-muted">
                No matching command. Try “Plan my day” or “Find jobs”.
              </Command.Empty>
              {(['Navigation', 'Tasks', 'Career', 'AI', 'Settings'] as Group[]).map((group) => {
                const items = commands.filter((c) => c.group === group);
                if (items.length === 0) return null;
                return (
                  <Command.Group key={group} heading={group}>
                    {items.map((c) => {
                      const Icon = getIcon(c.icon);
                      return (
                        <Command.Item
                          key={c.id}
                          value={c.id}
                          onSelect={() => {
                            setOpen(false);
                            c.run();
                          }}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary data-[selected=true]:bg-brand-subtle data-[selected=true]:text-text"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-active text-text-secondary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-text">{c.label}</span>
                            <span className="block truncate text-xs text-text-muted">{c.description}</span>
                          </span>
                          <CornerDownLeft className="h-3.5 w-3.5 text-text-muted opacity-0 transition-opacity data-[selected=true]:opacity-100" />
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                );
              })}
            </Command.List>
            <div className="flex items-center gap-1.5 border-t border-border px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Local demo assistant over your dashboard data
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
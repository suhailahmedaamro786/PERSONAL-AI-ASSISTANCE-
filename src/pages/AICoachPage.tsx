import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Trash2, Plus } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { getIcon } from '../lib/icons';
import { useAICoachStore } from '../store/aiCoachStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { suggestedPrompts } from '../services/aiService';
import type { ChatAction, ChatMessage } from '../types';
import { cn } from '../lib/utils';

function MessageBubble({ msg, onAction }: { msg: ChatMessage; onAction: (a: ChatAction) => void }) {
  const isAI = msg.role === 'assistant';
  const user = useAuthStore((s) => s.user);
  return (
    <div className={cn('flex gap-3', isAI ? 'items-start' : 'items-start justify-end')}>
      {isAI && (
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft ring-1 ring-border">
          <Bot className="h-4 w-4 text-brand" />
        </span>
      )}
      <div className={cn('flex max-w-[75%] flex-col gap-2', isAI ? 'items-start' : 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
            isAI
              ? 'rounded-tl-sm bg-surface border border-border text-text shadow-xs'
              : 'rounded-tr-sm bg-brand text-brand-foreground',
          )}
        >
          {msg.content}
        </div>
        {isAI && msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.actions.map((a, i) => (
              <Button key={i} size="xs" variant="brand-soft" onClick={() => onAction(a)}>
                {a.type === 'create_task' && <Plus className="h-3 w-3" />}
                {a.label}
              </Button>
            ))}
          </div>
        )}
        <span className="text-[11px] text-text-muted">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {!isAI && <Avatar name={user?.name || 'You'} size="sm" className="mt-0.5 shrink-0" />}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft ring-1 ring-border">
        <Bot className="h-4 w-4 text-brand" />
      </span>
      <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3 shadow-xs">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-text-muted"
              style={{ animation: `bounce 1s infinite ${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AICoachPage() {
  const navigate = useNavigate();
  const { messages, isTyping, init, send, clear } = useAICoachStore();
  const suggestedTasks = useAICoachStore((s) => s.suggestedTasks);
  const { addTask } = useTaskStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    const result = await send(text);

    // Auto-create tasks if AI suggests them and intent returned tasks
    if (result.suggestedTasks && result.suggestedTasks.length > 0) {
      // tasks are offered via action button — no auto-create
    }
    setSending(false);
    textareaRef.current?.focus();
  }

  async function handleAction(action: ChatAction) {
    if (action.type === 'navigate') {
      const to = action.payload.to as string;
      navigate(to);
    } else if (action.type === 'create_task') {
      const tasks = suggestedTasks;
      if (tasks.length === 0) {
        showNoTasksToast();
      } else {
        for (const t of tasks) {
          await addTask({
            title: t.title,
            description: '',
            priority: t.priority,
            category: t.category,
            estimatedMinutes: t.estimatedMinutes,
            actualMinutes: null,
            deadline: new Date(Date.now() + 86400000).toISOString(),
            recurrence: null,
            tags: [],
            source: 'ai',
            linkedJobId: null,
            linkedCourseId: null,
          });
        }
      }
    }
  }

  function showNoTasksToast() {
    // No suggested tasks from AI — surface a hint in the chat area by re-sending.
    useUIStore.getState().toast({
      title: 'No tasks to create',
      description: 'Ask the AI coach to plan your day first.',
      variant: 'info',
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showSuggested = messages.length <= 1;

  return (
    <PageContainer className="flex h-[calc(100vh-4rem)] flex-col gap-0 py-0 pt-6">
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="mb-4 flex items-center justify-between">
        <PageHeader
          title="AI Coach"
          description="Your personal productivity assistant."
          className="mb-0"
        />
        <Button variant="ghost" size="icon-sm" onClick={clear} title="Clear conversation">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Message list */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onAction={handleAction} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts */}
        {showSuggested && (
          <div className="border-t border-border px-5 py-3">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((sp) => {
                const Icon = getIcon(sp.icon);
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      setInput(sp.prompt);
                      textareaRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    <Icon className="h-3.5 w-3.5 text-brand" />
                    {sp.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your day, tasks, career…"
              rows={1}
              className="min-h-[40px] max-h-32 flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted shadow-xs transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              loading={sending}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] text-text-muted">Enter to send · Shift+Enter for new line</p>
        </div>
      </Card>
    </PageContainer>
  );
}

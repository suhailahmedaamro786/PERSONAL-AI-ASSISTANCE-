import { useState } from 'react';
import { Moon, Sun, Monitor, Bell, PanelLeft, Keyboard, Sparkles, Key, Check, Mail, CheckCircle } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, SectionLabel } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useTheme, type ThemeMode } from '../hooks/useTheme';
import { useUIStore } from '../store/uiStore';
import { useSettingsStore } from '../store/settingsStore';
import { buildAuthUrl } from '../services/gmailService';
import { cn } from '../lib/utils';

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4 py-3"
    >
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
          checked ? 'bg-brand' : 'bg-surface-active',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked && 'translate-x-4',
          )}
        />
      </button>
    </label>
  );
}

const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

const shortcuts = [
  { keys: ['⌘', 'K'], label: 'Open Command Palette' },
  { keys: ['⌘', '/'], label: 'Open Command Palette (alt)' },
  { keys: ['Ctrl', '['], label: 'Toggle sidebar' },
  { keys: ['Escape'], label: 'Close modals / command palette' },
  { keys: ['Enter'], label: 'Send AI Coach message' },
  { keys: ['Shift', 'Enter'], label: 'New line in AI Coach' },
];

export default function SettingsPage() {
  const { mode, setMode } = useTheme();
  const { sidebarCollapsed, toggleSidebar, toast } = useUIStore();
  const { geminiApiKey, useLiveAI, setGeminiApiKey, setUseLiveAI, gmailTokens, setGmailTokens, notificationPrefs, setNotificationPref } = useSettingsStore();

  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveApiKey = () => {
    setGeminiApiKey(inputKey.trim());
    setSavedSuccess(true);
    toast({
      title: 'API Key Saved',
      description: 'Your Gemini API key has been securely configured for live AI responses.',
      variant: 'success',
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Theme, preferences, AI keys, and shortcuts." />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <SectionLabel icon={<Sun className="h-4 w-4 text-brand" />} title="Appearance" />
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-[13px] text-text-muted">Choose your colour scheme.</p>
            <div className="flex gap-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setMode(t.value)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors',
                    mode === t.value
                      ? 'border-brand bg-brand-subtle text-brand'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-hover',
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <Card>
          <CardHeader>
            <SectionLabel icon={<PanelLeft className="h-4 w-4 text-brand" />} title="Layout" />
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <ToggleRow
                label="Collapsed Sidebar"
                description="Show only icons in the navigation sidebar."
                checked={sidebarCollapsed}
                onChange={() => toggleSidebar()}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI & Gemini Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <SectionLabel icon={<Sparkles className="h-4 w-4 text-brand" />} title="Google Gemini Live AI Integration" />
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              label="Enable Real-Time Gemini AI"
              description="When enabled, AI Coach connects directly to Google Gemini API for real-time generative responses."
              checked={useLiveAI}
              onChange={(v) => setUseLiveAI(v)}
            />

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Key className="h-4 w-4 text-brand" />
                Gemini API Key
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key (AQ... or AIza...)"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="font-mono text-xs flex-1"
                />
                <Button
                  onClick={handleSaveApiKey}
                  variant={savedSuccess ? 'success' : 'primary'}
                  size="md"
                  className="shrink-0"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" /> Saved
                    </>
                  ) : (
                    'Save Key'
                  )}
                </Button>
              </div>
              <p className="text-xs text-text-muted">
                Your key is stored locally in your browser and used securely to call Google Gemini models (Gemini 1.5 &amp; 2.0).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gmail Integration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <SectionLabel icon={<Mail className="h-4 w-4 text-brand" />} title="Gmail Integration" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-muted">
              Connect your Gmail account to let AI scan your real inbox and automatically convert deadlines,
              assignments, interviews, and workshop invites into tasks.
            </p>
            {gmailTokens ? (
              <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 p-3">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Gmail connected</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  setGmailTokens(null);
                  toast({ title: 'Gmail Disconnected', description: 'Email link removed.', variant: 'info' });
                }}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="md" onClick={() => { window.location.href = buildAuthUrl(); }}>
                <Mail className="h-4 w-4 mr-1.5" /> Connect Gmail Account
              </Button>
            )}
            <p className="text-xs text-text-muted">
              Redirection to Google's consent screen. We request <strong>read-only</strong> Gmail access to scan your inbox and surface task deadlines.
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <SectionLabel icon={<Bell className="h-4 w-4 text-brand" />} title="Notifications" />
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <ToggleRow
                label="Task reminders"
                description="Get notified before task deadlines."
                checked={notificationPrefs.taskReminders}
                onChange={(v) => setNotificationPref('taskReminders', v)}
              />
              <ToggleRow
                label="Job match alerts"
                description="Alert when a new job matches your profile."
                checked={notificationPrefs.jobMatchAlerts}
                onChange={(v) => setNotificationPref('jobMatchAlerts', v)}
              />
              <ToggleRow
                label="Workshop announcements"
                description="Stay updated on upcoming workshops."
                checked={notificationPrefs.workshopAnnouncements}
                onChange={(v) => setNotificationPref('workshopAnnouncements', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Keyboard shortcuts */}
        <Card>
          <CardHeader>
            <SectionLabel icon={<Keyboard className="h-4 w-4 text-brand" />} title="Keyboard Shortcuts" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {shortcuts.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-hover px-3 py-2"
                >
                  <span className="text-xs text-text-secondary">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-text shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

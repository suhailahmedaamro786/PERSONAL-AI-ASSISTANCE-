import { useState } from 'react';
import { Bell, Command, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun, Mail, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { Kbd } from '../ui/Kbd';
import { Tooltip } from '../ui/Tooltip';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { AuthModal } from '../auth/AuthModal';
import { cn } from '../../lib/utils';

export function TopBar() {
  const { isDark, toggle } = useTheme();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);
  const setMobileNav = useUIStore((s) => s.setMobileNav);
  const unread = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const { user, setAuthModalOpen } = useAuthStore();
  const [bellOpen, setBellOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-4 backdrop-blur md:px-5">
      {/* Mobile menu */}
      <button
        className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text focus-ring md:hidden"
        onClick={() => setMobileNav(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Collapse toggle (desktop) */}
      <Tooltip content={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="bottom">
        <button
          className="hidden rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text focus-ring md:inline-flex"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </Tooltip>

      {/* Command center trigger */}
      <button
        onClick={() => setCommandOpen(true)}
        className="group flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-surface-hover/60 px-3 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary focus-ring"
        aria-label="Open command center"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 text-left">Search or ask AI…</span>
        <span className="flex shrink-0 items-center gap-1">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Email Connect Button */}
        <button
          onClick={() => { setModeForAuth('connect_email'); setAuthModalOpen(true); }}
          className={cn(
            'hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:flex',
            user?.emailConnected
              ? 'border-success/40 bg-success/10 text-success hover:bg-success/20'
              : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
          )}
          title={user?.emailConnected ? `Connected: ${user.connectedEmailAddress}` : 'Connect Email'}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>{user?.emailConnected ? 'Email Synced' : 'Connect Email'}</span>
        </button>

        {/* AI status */}
        <div className="mr-1 hidden items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs font-medium text-text-secondary">AI Online</span>
        </div>

        {/* Theme toggle */}
        <Tooltip content={isDark ? 'Switch to light mode' : 'Switch to dark mode'} side="bottom">
          <button
            onClick={toggle}
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text focus-ring"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </Tooltip>

        {/* Notifications */}
        <NotificationCenter open={bellOpen} onOpenChange={setBellOpen}>
          <button
            onClick={() => setBellOpen(true)}
            className={cn(
              'relative rounded-md p-2 transition-colors focus-ring',
              bellOpen ? 'bg-surface-hover text-text' : 'text-text-secondary hover:bg-surface-hover hover:text-text',
            )}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span
                className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white"
                aria-hidden
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </NotificationCenter>

        {/* User Avatar + Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="rounded-full focus-ring"
            title={user?.name || 'Account'}
          >
            <Avatar name={user?.name || 'User'} size="sm" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-surface shadow-xl py-1.5">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-text truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  {user?.role && (
                    <p className="text-[11px] text-brand mt-0.5">{user.role}</p>
                  )}
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); setModeForAuth('connect_email'); setAuthModalOpen(true); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  <Mail className="h-4 w-4" /> Connect Email
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); setModeForAuth('logout_confirm'); setAuthModalOpen(true); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <AuthModal />
    </header>
  );
}

// Helper to set auth modal mode from TopBar
function setModeForAuth(mode: 'connect_email' | 'logout_confirm') {
  // AuthModal reads its own mode state — we use a simple event to control it
  window.dispatchEvent(new CustomEvent('suhail-auth-modal-mode', { detail: { mode } }));
}

export function CommandHint() {
  return <Command className="h-4 w-4" aria-hidden />;
}

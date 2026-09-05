import { NavLink } from 'react-router-dom';
import { PanelsTopLeft } from 'lucide-react';
import { NAV_ITEMS, SETTINGS_ITEM, APP_NAME } from '../../lib/constants';
import { getIcon } from '../../lib/icons';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const unread = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-300 ease-out md:flex',
        collapsed ? 'w-[68px]' : 'w-[232px]',
      )}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <div className={cn('flex h-14 items-center gap-2.5 border-b border-border px-4', collapsed && 'justify-center px-0')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <PanelsTopLeft className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-text">{APP_NAME}</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-text-muted">
              Personal OS
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = getIcon(item.icon);
          const link = (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 focus-ring',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-brand-subtle text-brand'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text',
                )
              }
              aria-label={item.label}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.id === 'jobs' && unread > 0 && (
                <span className="ml-auto mr-0.5 h-2 w-2 shrink-0 rounded-full bg-danger" aria-hidden />
              )}
            </NavLink>
          );
          return collapsed ? (
            <Tooltip key={item.id} content={item.label} side="right">
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2.5">
        {(() => {
          const Icon = getIcon(SETTINGS_ITEM.icon);
          const link = (
            <NavLink
              to={SETTINGS_ITEM.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 focus-ring',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-brand-subtle text-brand'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text',
                )
              }
              aria-label={SETTINGS_ITEM.label}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              {!collapsed && <span>{SETTINGS_ITEM.label}</span>}
            </NavLink>
          );
          return collapsed ? (
            <Tooltip content={SETTINGS_ITEM.label} side="right" key={SETTINGS_ITEM.id}>
              {link}
            </Tooltip>
          ) : (
            link
          );
        })()}
      </div>
    </aside>
  );
}
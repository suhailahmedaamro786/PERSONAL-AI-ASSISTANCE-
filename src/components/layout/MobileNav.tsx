import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from '../../lib/constants';
import { getIcon } from '../../lib/icons';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';

/* Bottom tab bar — mobile primary nav */
const PRIMARY = NAV_ITEMS.slice(0, 5); // Dashboard, Tasks, Classes, Career, Jobs

function MobileUserInfo() {
  const user = useAuthStore((s) => s.user);
  const name = user?.name || 'User';
  const firstName = name.split(' ')[0];
  const email = user?.email || '';
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text">{name}</p>
        <p className="truncate text-xs text-text-muted">{email || firstName}</p>
      </div>
    </div>
  );
}

export function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-surface/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      {PRIMARY.map((item) => {
        const Icon = getIcon(item.icon);
        return (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-brand' : 'text-text-muted hover:text-text-secondary',
              )
            }
          >
            <Icon className="h-5 w-5" aria-hidden />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

/* Slide-out drawer — full nav on mobile */
export function MobileDrawer() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNav);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/45 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface shadow-xl md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                  {(() => {
                    const Icon = getIcon('layout-dashboard');
                    return <Icon className="h-4 w-4" />;
                  })()}
                </div>
                <span className="text-sm font-bold text-text">{APP_NAME}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-ring"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
              {NAV_ITEMS.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-subtle text-brand'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text',
                      )
                    }
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
            <div className="border-t border-border p-4">
              <MobileUserInfo />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
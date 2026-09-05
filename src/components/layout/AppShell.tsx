import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileTabBar, MobileDrawer } from './MobileNav';
import { CommandPalette } from '../ai/CommandPalette';
import { useNotificationStore } from '../../store/notificationStore';
import { useUIStore } from '../../store/uiStore';

export function AppShell() {
  const { pathname } = useLocation();
  const fetchNotifications = useNotificationStore((s) => s.fetch);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Scroll to top on navigation + close mobile nav.
  const setMobileNav = useUIStore((s) => s.setMobileNav);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMobileNav(false);
  }, [pathname, setMobileNav]);

  return (
    <div className="flex min-h-full bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
      <MobileDrawer />
      <CommandPalette />
    </div>
  );
}
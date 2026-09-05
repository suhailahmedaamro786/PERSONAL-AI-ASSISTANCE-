import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '../lib/constants';

export type ThemeMode = 'light' | 'dark' | 'system';

const listeners = new Set<() => void>();
let mode: ThemeMode = readMode();

function readMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return mode;
}

function apply(m: ThemeMode) {
  mode = m;
  const dark =
    m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem(STORAGE_KEYS.theme, m);
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l());
}

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    apply(mode);
  }, []);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => apply(m), []);
  const toggle = useCallback(
    () => apply(mode === 'dark' ? 'light' : 'dark'),
    [mode],
  );

  return { mode, setMode, toggle, isDark: mode === 'dark' };
}
import { useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/** Register a global keydown handler. handler must be stable via useCallback. */
export function useKeyboardShortcut(keys: string[], handler: (e: KeyboardEvent) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = (e.ctrlKey || e.metaKey) === keys.includes('mod');
      const shift = e.shiftKey === keys.includes('shift');
      const alt = e.altKey === keys.includes('alt');
      const key = e.key.toLowerCase();
      const target = keys.find(
        (k) => !['mod', 'shift', 'alt'].includes(k) && k.toLowerCase() === key,
      );
      if (mod && shift && alt && target) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        handlerRef.current(e);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keys]);
}

export function useCtrlK(handler: () => void) {
  useKeyboardShortcut(['mod', 'k'], handler);
}

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useEffect : () => {};
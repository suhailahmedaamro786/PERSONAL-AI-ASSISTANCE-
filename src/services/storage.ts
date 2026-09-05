/**
 * localStorage wrapper that seeds from default data on first load.
 * Call `load<T>(key, seed)` once per entity — returns cached value after first call.
 */

const PREFIX = 'suhail_';

const cache = new Map<string, unknown>();

/** Load from localStorage; if empty, persist and return the seed array. */
export function load<T>(key: string, seed: T[]): T[] {
  if (cache.has(key)) return cache.get(key) as T[];

  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        cache.set(key, parsed);
        return parsed;
      }
    }
  } catch {
    // corrupted — fall through to seed
  }

  // First visit: persist seed data
  localStorage.setItem(PREFIX + key, JSON.stringify(seed));
  cache.set(key, seed);
  return seed;
}

/** Load a single object (not array) from localStorage. */
export function loadObj<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;

  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw) as T;
      cache.set(key, parsed);
      return parsed;
    }
  } catch {
    // corrupted
  }

  localStorage.setItem(PREFIX + key, JSON.stringify(fallback));
  cache.set(key, fallback);
  return fallback;
}

/** Persist current array to localStorage (mutate caller's reference). */
export function save<T>(key: string, data: T[]): void {
  cache.set(key, data);
  localStorage.setItem(PREFIX + key, JSON.stringify(data));
}

/** Persist an object to localStorage. */
export function saveObj<T>(key: string, data: T): void {
  cache.set(key, data);
  localStorage.setItem(PREFIX + key, JSON.stringify(data));
}

/** Clear a single key from cache + localStorage. */
export function clearKey(key: string): void {
  cache.delete(key);
  localStorage.removeItem(PREFIX + key);
}

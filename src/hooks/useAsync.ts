import { useCallback, useEffect, useRef, useState } from 'react';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs an async loader on mount + exposes retry. Returns live-state plus
 * the fetched data so pages can render loading/error/empty/success states.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unexpected error',
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loaderRef
      .current()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((err: unknown) =>
        active &&
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Unexpected error',
        }),
      );
    return () => {
      active = false;
    };
  }, deps);

  return { ...state, retry: run };
}
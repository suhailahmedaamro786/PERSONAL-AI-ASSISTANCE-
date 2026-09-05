export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Simulate network latency for the local mock data layer. */
export async function withLatency<T>(data: T, ms = 320): Promise<T> {
  await delay(ms);
  return structuredClone(data);
}
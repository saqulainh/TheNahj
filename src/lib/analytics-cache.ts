const CACHE = new Map<string, { ts: number; payload: any }>();
const TTL_MS = 30_000;

export function getCachedSummary(key: string) {
  try {
    const entry = CACHE.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > TTL_MS) {
      CACHE.delete(key);
      return null;
    }
    return entry.payload;
  } catch {
    return null;
  }
}

export function setCachedSummary(key: string, payload: any) {
  try {
    CACHE.set(key, { ts: Date.now(), payload });
  } catch {
    // ignore
  }
}

export function clearSummaryCache() {
  try {
    CACHE.clear();
  } catch {
    // ignore
  }
}

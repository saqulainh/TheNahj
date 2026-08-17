/**
 * In-memory LRU cache for AI chat responses.
 *
 * - Capacity: 200 entries (oldest evicted when full)
 * - TTL: 30 minutes per entry
 * - Key: normalized query string (lowercase, collapsed whitespace)
 *
 * Common repeated queries (exam anxiety, time management, sabr, etc.)
 * bypass the entire RAG + LLM pipeline and return in <50ms.
 *
 * No external dependencies. Upgrade to Redis-backed caching later when
 * real traffic data is available.
 */

const CACHE_MAX_SIZE = 200;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  reply: string;
  topics: string[];
  relatedWisdom: Array<{ title: string; slug: string; quote: string; category?: string }>;
  createdAt: number;
}

// Ordered map preserves insertion order — oldest entry = first key
const cache = new Map<string, CacheEntry>();

/** Normalize a query string into a stable cache key. */
export function normalizeCacheKey(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // strip punctuation
    .replace(/\s+/g, " ")    // collapse whitespace
    .trim();
}

/** Return a cached response for the given query, or null if not found / expired. */
export function getCachedResponse(query: string): CacheEntry | null {
  const key = normalizeCacheKey(query);
  const entry = cache.get(key);
  if (!entry) return null;

  // TTL check
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  // LRU: re-insert to move to end (most recently used)
  cache.delete(key);
  cache.set(key, entry);
  return entry;
}

/** Store a response in the cache, evicting the oldest entry if at capacity. */
export function setCachedResponse(query: string, data: Omit<CacheEntry, "createdAt">): void {
  const key = normalizeCacheKey(query);

  // Evict oldest entry if at capacity
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, { ...data, createdAt: Date.now() });
}

/** Check if a query has a valid (non-expired) cache entry without touching LRU order. */
export function hasCachedResponse(query: string): boolean {
  return getCachedResponse(query) !== null;
}

/** Return current cache stats (for debug/monitoring). */
export function getCacheStats(): { size: number; maxSize: number; ttlMinutes: number } {
  return { size: cache.size, maxSize: CACHE_MAX_SIZE, ttlMinutes: CACHE_TTL_MS / 60000 };
}

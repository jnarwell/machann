/**
 * Simple in-memory cache with TTL
 * In production, replace with Vercel KV, Redis, or similar
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  set<T>(key: string, data: T, ttlMs: number = 3600000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get time until expiry in ms
  ttlRemaining(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const remaining = entry.ttl - (Date.now() - entry.timestamp);
    return remaining > 0 ? remaining : null;
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cache TTL constants
export const CACHE_TTL = {
  PRICES: 1 * 60 * 60 * 1000,      // 1 hour for commodity prices
  EXCHANGE: 30 * 60 * 1000,        // 30 minutes for exchange rates
  NEWS: 15 * 60 * 1000,            // 15 minutes for news
  FALLBACK: 24 * 60 * 60 * 1000,   // 24 hours for fallback data
};

// Cache keys
export const CACHE_KEYS = {
  PRICES: "commodity-prices",
  EXCHANGE: "exchange-rates",
  NEWS: "market-news",
  PRICES_FALLBACK: "commodity-prices-fallback",
  EXCHANGE_FALLBACK: "exchange-rates-fallback",
};

/**
 * Cache Service with TTL Support
 * Provides in-memory caching for frequently accessed data
 * 
 * Usage:
 * const cache = require('./cacheService');
 * cache.set('key', value, 300000);  // 5 minute TTL
 * const val = cache.get('key');
 * cache.invalidate('key');
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  /**
   * Set cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttlMs = 300000) {
    this.cache.set(key, value);

    // Clear existing timeout if any
    if (this.ttl.has(key)) clearTimeout(this.ttl.get(key));

    // Set new timeout
    const timeoutId = setTimeout(() => {
      this.cache.delete(key);
      this.ttl.delete(key);
    }, ttlMs);

    this.ttl.set(key, timeoutId);
  }

  /**
   * Get from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  get(key) {
    return this.cache.get(key) || null;
  }

  /**
   * Invalidate specific cache entry
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    this.cache.delete(key);
    if (this.ttl.has(key)) clearTimeout(this.ttl.get(key));
    this.ttl.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.ttl.forEach(timeout => clearTimeout(timeout));
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = new CacheService();

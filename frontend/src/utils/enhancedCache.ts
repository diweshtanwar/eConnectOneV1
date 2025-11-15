interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class EnhancedCache {
  private cache = new Map<string, CacheItem<any>>();
  
  // Cache durations for different data types
  private readonly CACHE_DURATIONS = {
    userProfile: 15 * 60 * 1000,    // 15 minutes
    tickets: 5 * 60 * 1000,        // 5 minutes  
    messages: 2 * 60 * 1000,       // 2 minutes
    notifications: 1 * 60 * 1000,   // 1 minute
    dashboard: 3 * 60 * 1000,      // 3 minutes
    default: 5 * 60 * 1000,        // 5 minutes default
  };

  set<T>(key: string, data: T, customDuration?: number): void {
    const duration = customDuration || this.getCacheDuration(key);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration,
    };
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }

  private getCacheDuration(key: string): number {
    for (const [type, duration] of Object.entries(this.CACHE_DURATIONS)) {
      if (key.includes(type)) {
        return duration;
      }
    }
    return this.CACHE_DURATIONS.default;
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const enhancedCache = new EnhancedCache();
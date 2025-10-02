// Simple in-memory cache for development/small scale deployment
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Cache invalidation patterns
  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new SimpleCache()

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:${userId}`,
  USER_CHILDREN: (userId: string) => `user:${userId}:children`,
  CHILD_DETAIL: (childId: string) => `child:${childId}`,
  ASSESSMENTS: (childId: string) => `child:${childId}:assessments`,
  VIDEOS: (page: number, filters?: string) => `videos:${page}:${filters || 'all'}`,
  POSTS: (boardId: string, page: number) => `posts:${boardId}:${page}`,
  NEWS: (page: number) => `news:${page}`,
  SEARCH: (query: string, type: string) => `search:${query}:${type}`,
  SPIRITUALITY: (category?: string, age?: string) => `spirituality:${category}:${age}`,
  ADMIN_STATS: () => 'admin:stats'
} as const

// Helper functions for common cache operations
export function getCachedData<T>(key: string): T | null {
  return cache.get(key)
}

export function setCachedData<T>(key: string, data: T, ttlSeconds: number = 300): void {
  cache.set(key, data, ttlSeconds)
}

export function invalidateUserCache(userId: string): void {
  cache.invalidatePattern(`user:${userId}`)
}

export function invalidateChildCache(childId: string): void {
  cache.invalidatePattern(`child:${childId}`)
}
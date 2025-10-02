// Performance monitoring and optimization utilities
import React from 'react'

export class PerformanceTracker {
  private static instance: PerformanceTracker
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  trackApiCall(endpoint: string, duration: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, [])
    }
    const durations = this.metrics.get(endpoint)!
    durations.push(duration)

    // Keep only last 100 measurements
    if (durations.length > 100) {
      durations.shift()
    }
  }

  getAverageTime(endpoint: string): number | null {
    const durations = this.metrics.get(endpoint)
    if (!durations || durations.length === 0) return null

    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {}

    for (const [endpoint, durations] of this.metrics.entries()) {
      if (durations.length > 0) {
        const average = durations.reduce((sum, d) => sum + d, 0) / durations.length
        result[endpoint] = {
          average: Math.round(average * 100) / 100,
          count: durations.length,
          latest: durations[durations.length - 1]
        }
      }
    }

    return result
  }

  reset(): void {
    this.metrics.clear()
  }
}

// HOC for API route performance tracking
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    const start = performance.now()
    try {
      const result = await handler(...args)
      const duration = performance.now() - start
      PerformanceTracker.getInstance().trackApiCall(endpoint, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      PerformanceTracker.getInstance().trackApiCall(`${endpoint}:error`, duration)
      throw error
    }
  }) as T
}

// Database query optimization helpers
export function optimizeQuery(tableName: string, includeRelations: boolean = false) {
  const baseConfig = {
    take: 20, // Default pagination limit
    skip: 0
  }

  if (includeRelations) {
    // Add common includes based on table
    switch (tableName) {
      case 'post':
        return {
          ...baseConfig,
          include: {
            author: { select: { name: true, avatar: true } },
            board: { select: { name: true } }
          }
        }
      case 'child':
        return {
          ...baseConfig,
          include: {
            user: { select: { name: true } }
          }
        }
      case 'assessment':
        return {
          ...baseConfig,
          include: {
            child: { select: { name: true } },
            results: true
          }
        }
      default:
        return baseConfig
    }
  }

  return baseConfig
}

// Image optimization helpers
export function getOptimizedImageUrl(
  originalUrl: string,
  width?: number,
  height?: number,
  quality: number = 75
): string {
  if (!originalUrl) return ''

  // For local uploads, we could implement image optimization
  if (originalUrl.startsWith('/uploads/')) {
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    if (quality !== 75) params.set('q', quality.toString())

    const queryString = params.toString()
    return queryString ? `${originalUrl}?${queryString}` : originalUrl
  }

  return originalUrl
}

// Component loading optimization
export function createLoadingWrapper<T extends React.ComponentType<any>>(
  Component: T,
  fallback: React.ReactNode = null
): React.ComponentType<React.ComponentProps<T>> {
  return function LoadingWrapper(props: React.ComponentProps<T>) {
    return (
      <React.Suspense fallback={fallback}>
        <Component {...props} />
      </React.Suspense>
    )
  }
}

export const perf = PerformanceTracker.getInstance()
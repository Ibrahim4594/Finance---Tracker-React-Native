import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { InteractionManager, Platform } from 'react-native';

/**
 * Performance metric types
 */
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Performance monitoring singleton
 */
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = __DEV__;

  /**
   * Start measuring a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });
  }

  /**
   * End measuring a performance metric
   */
  end(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    if (__DEV__) {
      console.log(
        `[Performance] ${name}: ${duration}ms`,
        metric.metadata ? metric.metadata : ''
      );
    }

    return duration;
  }

  /**
   * Measure a synchronous function
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.start(name, metadata);
    const result = fn();
    this.end(name);
    return result;
  }

  /**
   * Measure an async function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics().filter((m) => m.duration !== undefined);
    if (metrics.length === 0) {
      return 'No performance metrics recorded';
    }

    let report = 'PERFORMANCE REPORT\n';
    report += '==================\n\n';

    // Sort by duration descending
    metrics.sort((a, b) => (b.duration || 0) - (a.duration || 0));

    metrics.forEach((metric) => {
      report += `${metric.name}: ${metric.duration}ms\n`;
      if (metric.metadata) {
        Object.entries(metric.metadata).forEach(([key, value]) => {
          report += `  ${key}: ${value}\n`;
        });
      }
    });

    const totalDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    report += `\nTotal Duration: ${totalDuration}ms\n`;
    report += `Average: ${(totalDuration / metrics.length).toFixed(2)}ms\n`;

    return report;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to measure component render time
 */
export const useRenderTime = (componentName: string): void => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;

    if (__DEV__ && renderTime > 16) {
      // Warn if render takes longer than one frame (16ms at 60fps)
      console.warn(
        `[Performance] ${componentName} render #${renderCount.current} took ${renderTime}ms`
      );
    }

    startTime.current = Date.now();
  });
};

/**
 * Hook to detect slow renders
 */
export const useSlowRenderDetection = (
  componentName: string,
  threshold: number = 16
): void => {
  const renderStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    if (renderTime > threshold) {
      console.warn(
        `[Performance] Slow render detected in ${componentName}: ${renderTime}ms (threshold: ${threshold}ms)`
      );
    }
    renderStartTime.current = Date.now();
  });
};

/**
 * Hook to run code after interactions complete
 * Useful for deferring non-critical work
 */
export const useAfterInteractions = (
  callback: () => void,
  dependencies: any[] = []
): void => {
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      callback();
    });

    return () => task.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

/**
 * Debounce hook with performance optimization
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook for performance-sensitive callbacks
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T => {
  const lastRun = useRef<number>(Date.now());
  const timeout = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - (now - lastRun.current));
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Memoize expensive calculations
 */
export const useMemoized = <T>(
  factory: () => T,
  dependencies: any[],
  debug?: string
): T => {
  return useMemo(() => {
    if (__DEV__ && debug) {
      performanceMonitor.start(`useMemoized:${debug}`);
    }
    const result = factory();
    if (__DEV__ && debug) {
      performanceMonitor.end(`useMemoized:${debug}`);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

/**
 * Performance-optimized callback
 */
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T => {
  return useCallback(callback, dependencies) as T;
};

/**
 * Lazy load data with performance tracking
 */
export const useLazyLoad = <T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
} => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const startTime = Date.now();

      try {
        const result = await loadFunction();
        if (!cancelled) {
          setData(result);
          const duration = Date.now() - startTime;
          if (__DEV__) {
            console.log(`[Performance] Data loaded in ${duration}ms`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, trigger]);

  const reload = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  return { data, loading, error, reload };
};

/**
 * FPS Monitor (simplified for React Native)
 */
export class FPSMonitor {
  private frameCount: number = 0;
  private lastTime: number = Date.now();
  private fps: number = 60;
  private rafId: number | null = null;

  start(): void {
    if (Platform.OS === 'web') {
      const measure = () => {
        this.frameCount++;
        const now = Date.now();
        const elapsed = now - this.lastTime;

        if (elapsed >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / elapsed);
          this.frameCount = 0;
          this.lastTime = now;

          if (__DEV__ && this.fps < 30) {
            console.warn(`[Performance] Low FPS detected: ${this.fps}`);
          }
        }

        this.rafId = requestAnimationFrame(measure);
      };

      this.rafId = requestAnimationFrame(measure);
    }
  }

  stop(): void {
    if (this.rafId !== null && Platform.OS === 'web') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getFPS(): number {
    return this.fps;
  }
}

/**
 * Memory usage estimation (simplified)
 */
export const getMemoryUsage = (): { used: number; limit: number } | null => {
  if (Platform.OS === 'web' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

/**
 * Batch updates for better performance
 */
export const batchUpdates = <T>(
  items: T[],
  updateFn: (batch: T[]) => void,
  batchSize: number = 50
): void => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    InteractionManager.runAfterInteractions(() => {
      updateFn(batch);
    });
  }
};

/**
 * Optimize large list rendering
 */
export const optimizeListData = <T extends { id: string }>(
  data: T[],
  limit: number = 100
): T[] => {
  if (data.length <= limit) {
    return data;
  }

  if (__DEV__) {
    console.warn(
      `[Performance] Large list detected (${data.length} items). Consider pagination or virtualization.`
    );
  }

  return data.slice(0, limit);
};

/**
 * Check if app is running in production mode
 */
export const isProduction = (): boolean => {
  return !__DEV__;
};

/**
 * Log performance warning in development
 */
export const logPerformanceWarning = (message: string, data?: any): void => {
  if (__DEV__) {
    console.warn(`[Performance] ${message}`, data || '');
  }
};

/**
 * Measure component lifecycle
 */
export const useLifecycleTiming = (componentName: string): void => {
  const mountTime = useRef<number>(Date.now());

  useEffect(() => {
    const mountDuration = Date.now() - mountTime.current;
    if (__DEV__) {
      console.log(`[Performance] ${componentName} mounted in ${mountDuration}ms`);
    }

    return () => {
      const unmountTime = Date.now();
      const lifetimeDuration = unmountTime - mountTime.current;
      if (__DEV__) {
        console.log(`[Performance] ${componentName} lifetime: ${lifetimeDuration}ms`);
      }
    };
  }, [componentName]);
};

/**
 * Detect and warn about excessive re-renders
 */
export const useRenderCount = (componentName: string, threshold: number = 10): void => {
  const renderCount = useRef(0);
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  renderCount.current += 1;

  // Reset count after 5 seconds
  if (resetTimer.current) {
    clearTimeout(resetTimer.current);
  }

  resetTimer.current = setTimeout(() => {
    if (renderCount.current > threshold && __DEV__) {
      console.warn(
        `[Performance] ${componentName} rendered ${renderCount.current} times in 5 seconds (threshold: ${threshold})`
      );
    }
    renderCount.current = 0;
  }, 5000);
};

export default {
  performanceMonitor,
  useRenderTime,
  useSlowRenderDetection,
  useAfterInteractions,
  useDebounce,
  useThrottle,
  useMemoized,
  useOptimizedCallback,
  useLazyLoad,
  FPSMonitor,
  getMemoryUsage,
  batchUpdates,
  optimizeListData,
  isProduction,
  logPerformanceWarning,
  useLifecycleTiming,
  useRenderCount,
};

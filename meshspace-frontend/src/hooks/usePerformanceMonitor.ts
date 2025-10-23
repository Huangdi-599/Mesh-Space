import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current
        });
      }

      // Log performance metrics
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now()
      };

      // In production, you might want to send this to an analytics service
      if (process.env.NODE_ENV === 'production') {
        // Example: send to analytics service
        // analytics.track('component_render', metrics);
        console.log('Performance metrics:', metrics);
      }
    };
  });
}

// Hook for measuring API call performance
export function useApiPerformance() {
  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      // Log slow API calls
      if (duration > 1000) {
        console.warn(`Slow API call detected:`, {
          operation: operationName,
          duration: `${duration.toFixed(2)}ms`
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`API call failed:`, {
        operation: operationName,
        duration: `${duration.toFixed(2)}ms`,
        error
      });
      throw error;
    }
  };

  return { measureApiCall };
}

// Hook for measuring user interactions
export function useInteractionMetrics() {
  const measureInteraction = (interactionName: string, callback: () => void) => {
    const startTime = performance.now();
    
    callback();
    
    const duration = performance.now() - startTime;
    
    // Log slow interactions
    if (duration > 100) {
      console.warn(`Slow interaction detected:`, {
        interaction: interactionName,
        duration: `${duration.toFixed(2)}ms`
      });
    }
  };

  return { measureInteraction };
}

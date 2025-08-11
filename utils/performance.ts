import { useCallback, useEffect, useRef, useState } from 'react';
import * as Analytics from './analytics';

// Performance monitoring utilities
export const PerformanceMonitor = {
  // Measure component render time
  measureRenderTime: (componentName: string, renderFn: () => void) => {
    const startTime = performance.now();
    renderFn();
    const renderTime = performance.now() - startTime;
    
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      Analytics.trackEvent('PERFORMANCE_SLOW_RENDER', {
        component_name: componentName,
        render_time_ms: renderTime,
        threshold_exceeded: true
      });
    }
    
    return renderTime;
  },

  // Monitor memory usage
  checkMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      console.log(`📊 Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
      
      // Alert if memory usage is high
      if (usedMB > limitMB * 0.8) {
        console.warn('⚠️ High memory usage detected');
        Analytics.trackEvent('PERFORMANCE_HIGH_MEMORY', {
          used_mb: usedMB,
          total_mb: totalMB,
          limit_mb: limitMB,
          usage_percentage: (usedMB / limitMB) * 100
        });
      }
      
      return { usedMB, totalMB, limitMB };
    }
    return null;
  },

  // Measure app startup time
  measureStartupTime: (appStartTime: number) => {
    const startupTime = Date.now() - appStartTime;
    console.log(`🚀 App startup time: ${startupTime}ms`);
    
    Analytics.trackEvent('PERFORMANCE_APP_STARTUP', {
      startup_time_ms: startupTime,
      is_slow_startup: startupTime > 3000
    });
    
    return startupTime;
  },

  // Monitor FPS
  monitorFPS: () => {
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        if (fps < 30) {
          console.warn(`🎮 Low FPS detected: ${fps} FPS`);
          Analytics.trackEvent('PERFORMANCE_LOW_FPS', {
            fps,
            is_critical: fps < 20
          });
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
    return () => fps;
  }
};

// Hook for performance monitoring
export const usePerformanceMonitoring = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    
    // Log excessive re-renders
    if (renderCount.current > 10) {
      console.warn(`🔄 Excessive re-renders: ${componentName} rendered ${renderCount.current} times`);
      Analytics.trackEvent('PERFORMANCE_EXCESSIVE_RENDERS', {
        component_name: componentName,
        render_count: renderCount.current
      });
    }
    
    return () => {
      const componentLifetime = Date.now() - mountTime.current;
      Analytics.trackEvent('PERFORMANCE_COMPONENT_LIFETIME', {
        component_name: componentName,
        lifetime_ms: componentLifetime,
        render_count: renderCount.current
      });
    };
  });
  
  const measureOperation = useCallback((operationName: string, operation: () => void | Promise<void>) => {
    const startTime = performance.now();
    const result = operation();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime;
        Analytics.trackEvent('PERFORMANCE_ASYNC_OPERATION', {
          component_name: componentName,
          operation_name: operationName,
          duration_ms: duration
        });
      });
    } else {
      const duration = performance.now() - startTime;
      Analytics.trackEvent('PERFORMANCE_SYNC_OPERATION', {
        component_name: componentName,
        operation_name: operationName,
        duration_ms: duration
      });
      return result;
    }
  }, [componentName]);
  
  return { measureOperation };
};

// Bundle size analyzer
export const BundleAnalyzer = {
  logBundleInfo: () => {
    // This would be populated by build tools
    console.log('📦 Bundle Analysis:');
    console.log('- Main bundle: Calculating...');
    console.log('- Vendor bundle: Calculating...');
    console.log('- Async chunks: Calculating...');
    
    Analytics.trackEvent('PERFORMANCE_BUNDLE_ANALYSIS', {
      timestamp: Date.now(),
      platform: 'mobile'
    });
  }
};

// Image optimization utilities
export const ImageOptimizer = {
  // Generate progressive loading placeholder
  generatePlaceholder: (width: number, height: number, color = '#f0f0f0') => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
      </svg>
    `)}`;
  },

  // Optimize image URL based on device
  optimizeImageUrl: (originalUrl: string, width: number, height: number) => {
    // This would integrate with your CDN's image optimization
    const devicePixelRatio = 2; // Could be dynamic
    const optimizedWidth = Math.round(width * devicePixelRatio);
    const optimizedHeight = Math.round(height * devicePixelRatio);
    
    // Example CDN optimization (adjust for your CDN)
    if (originalUrl.includes('your-cdn.com')) {
      return `${originalUrl}?w=${optimizedWidth}&h=${optimizedHeight}&q=80&f=webp`;
    }
    
    return originalUrl;
  }
};

// Lazy loading utilities
export const LazyLoadingManager = {
  // Preload critical components
  preloadCriticalComponents: async () => {
    console.log('🔄 Preloading critical components...');
    
    try {
      // Preload video player
      await import('@/components/VideoPlayer');
      console.log('✅ VideoPlayer preloaded');
      
      // Preload course components
      await import('@/app/(root)/courses/[courseId]');
      console.log('✅ CourseDetail preloaded');
      
      Analytics.trackEvent('PERFORMANCE_PRELOAD_SUCCESS', {
        preloaded_components: ['VideoPlayer', 'CourseDetail']
      });
    } catch (error) {
      console.error('❌ Component preloading failed:', error);
      Analytics.trackEvent('PERFORMANCE_PRELOAD_ERROR', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

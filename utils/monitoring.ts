import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Analytics from './analytics';
import { NetworkRecoveryManager } from './networkRecovery';

// Error types
export enum ErrorType {
  NETWORK = 'network',
  RENDER = 'render',
  API = 'api',
  VIDEO = 'video',
  STORAGE = 'storage',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error report interface
interface ErrorReport {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  appVersion: string;
  platform: string;
  deviceInfo: Record<string, any>;
}

// Performance metrics interface
interface PerformanceMetrics {
  id: string;
  type: 'render' | 'api' | 'navigation' | 'video_load' | 'app_startup';
  duration: number;
  context: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

// Monitoring Manager
export class MonitoringManager {
  private static instance: MonitoringManager;
  private errorReports: ErrorReport[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private sessionId: string;
  private appStartTime: number;
  private maxStoredReports = 100;
  private reportingInterval = 30000; // 30 seconds
  private reportingTimer?: ReturnType<typeof setInterval>;

  static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager();
    }
    return MonitoringManager.instance;
  }

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.appStartTime = Date.now();
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Load stored reports
    this.loadStoredReports();
    
    // Start periodic reporting
    this.startPeriodicReporting();
    
    // Monitor unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
    
    // Track app startup performance
    setTimeout(() => {
      this.recordPerformanceMetric({
        type: 'app_startup',
        duration: Date.now() - this.appStartTime,
        context: {
          startup_type: 'cold_start'
        }
      });
    }, 1000);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
    
    this.reportError({
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      message: `Unhandled Promise Rejection: ${event.reason}`,
      context: {
        promise_rejection: true,
        reason: event.reason
      }
    });
  };

  // Report error
  reportError(error: Omit<ErrorReport, 'id' | 'timestamp' | 'sessionId' | 'appVersion' | 'platform' | 'deviceInfo'>) {
    const errorReport: ErrorReport = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      appVersion: '1.0.0', // Get from app config
      platform: 'mobile', // Detect platform
      deviceInfo: this.getDeviceInfo()
    };

    this.errorReports.push(errorReport);
    
    // Keep only recent reports
    if (this.errorReports.length > this.maxStoredReports) {
      this.errorReports = this.errorReports.slice(-this.maxStoredReports);
    }

    console.error(`🚨 Error Reported [${error.severity.toUpperCase()}]:`, error.message);
    
    // Track in analytics
    Analytics.trackEvent('ERROR_REPORTED', {
      error_id: errorReport.id,
      error_type: error.type,
      error_severity: error.severity,
      error_message: error.message,
      session_id: this.sessionId
    });

    // Store reports
    this.storeReports();

    // Send critical errors immediately
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.sendReportsImmediately();
    }
  }

  // Record performance metric
  recordPerformanceMetric(metric: Omit<PerformanceMetrics, 'id' | 'timestamp' | 'sessionId'>) {
    const performanceMetric: PerformanceMetrics = {
      ...metric,
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.performanceMetrics.push(performanceMetric);
    
    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxStoredReports) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxStoredReports);
    }

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${metric.type} took ${metric.duration}ms`);
    }

    // Track in analytics
    Analytics.trackEvent('PERFORMANCE_METRIC', {
      metric_id: performanceMetric.id,
      metric_type: metric.type,
      duration_ms: metric.duration,
      session_id: this.sessionId,
      is_slow: metric.duration > 1000
    });
  }

  // Get device info
  private getDeviceInfo(): Record<string, any> {
    return {
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      screen_width: typeof window !== 'undefined' ? window.screen?.width : 0,
      screen_height: typeof window !== 'undefined' ? window.screen?.height : 0,
      memory: typeof (performance as any)?.memory !== 'undefined' ? (performance as any).memory : null,
      connection: typeof (navigator as any)?.connection !== 'undefined' ? (navigator as any).connection : null
    };
  }

  // Start periodic reporting
  private startPeriodicReporting() {
    this.reportingTimer = setInterval(() => {
      this.sendReports();
    }, this.reportingInterval);
  }

  // Send reports to server
  private async sendReports() {
    if (this.errorReports.length === 0 && this.performanceMetrics.length === 0) {
      return;
    }

    const networkManager = NetworkRecoveryManager.getInstance();
    
    if (!networkManager.isNetworkAvailable()) {
      console.log('📵 Offline - deferring report sending');
      return;
    }

    try {
      console.log(`📊 Sending ${this.errorReports.length} error reports and ${this.performanceMetrics.length} performance metrics`);

      // This would be your actual monitoring endpoint
      // await fetch('/api/monitoring/reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     session_id: this.sessionId,
      //     timestamp: Date.now(),
      //     errors: this.errorReports,
      //     performance: this.performanceMetrics
      //   })
      // });

      // Simulate successful send
      console.log('✅ Reports sent successfully');
      
      // Clear sent reports
      this.errorReports = [];
      this.performanceMetrics = [];
      
      // Update storage
      this.storeReports();
      
    } catch (error) {
      console.error('❌ Failed to send reports:', error);
      
      // Add to retry queue
      networkManager.addFailedRequest({
        url: '/api/monitoring/reports',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          session_id: this.sessionId,
          errors: this.errorReports,
          performance: this.performanceMetrics
        },
        maxRetries: 3
      });
    }
  }

  // Send reports immediately (for critical errors)
  private sendReportsImmediately() {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
    }
    this.sendReports();
    this.startPeriodicReporting();
  }

  // Store reports locally
  private async storeReports() {
    try {
      await AsyncStorage.setItem('monitoring_errors', JSON.stringify(this.errorReports));
      await AsyncStorage.setItem('monitoring_performance', JSON.stringify(this.performanceMetrics));
    } catch (error) {
      console.error('❌ Failed to store monitoring data:', error);
    }
  }

  // Load stored reports
  private async loadStoredReports() {
    try {
      const [storedErrors, storedPerformance] = await Promise.all([
        AsyncStorage.getItem('monitoring_errors'),
        AsyncStorage.getItem('monitoring_performance')
      ]);

      if (storedErrors) {
        this.errorReports = JSON.parse(storedErrors);
        console.log(`📂 Loaded ${this.errorReports.length} stored error reports`);
      }

      if (storedPerformance) {
        this.performanceMetrics = JSON.parse(storedPerformance);
        console.log(`📂 Loaded ${this.performanceMetrics.length} stored performance metrics`);
      }
    } catch (error) {
      console.error('❌ Failed to load stored monitoring data:', error);
    }
  }

  // Get monitoring status
  getStatus() {
    return {
      sessionId: this.sessionId,
      errorCount: this.errorReports.length,
      performanceMetricCount: this.performanceMetrics.length,
      appUptime: Date.now() - this.appStartTime
    };
  }

  // Cleanup
  cleanup() {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }
}

// React hook for monitoring
export const useMonitoring = () => {
  const [status, setStatus] = useState({
    sessionId: '',
    errorCount: 0,
    performanceMetricCount: 0,
    appUptime: 0
  });

  const monitoringManager = useRef(MonitoringManager.getInstance());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(monitoringManager.current.getStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const reportError = useCallback((error: Omit<ErrorReport, 'id' | 'timestamp' | 'sessionId' | 'appVersion' | 'platform' | 'deviceInfo'>) => {
    monitoringManager.current.reportError(error);
  }, []);

  const recordPerformance = useCallback((metric: Omit<PerformanceMetrics, 'id' | 'timestamp' | 'sessionId'>) => {
    monitoringManager.current.recordPerformanceMetric(metric);
  }, []);

  return {
    status,
    reportError,
    recordPerformance,
    ErrorType,
    ErrorSeverity
  };
};

// Utility functions for common error reporting
export const ErrorReporter = {
  // API error
  reportApiError: (url: string, status: number, message: string, context?: Record<string, any>) => {
    MonitoringManager.getInstance().reportError({
      type: ErrorType.API,
      severity: status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      message: `API Error: ${status} - ${message}`,
      context: {
        url,
        status,
        ...context
      }
    });
  },

  // Video error
  reportVideoError: (videoId: string, error: string, context?: Record<string, any>) => {
    MonitoringManager.getInstance().reportError({
      type: ErrorType.VIDEO,
      severity: ErrorSeverity.MEDIUM,
      message: `Video Error: ${error}`,
      context: {
        video_id: videoId,
        ...context
      }
    });
  },

  // Network error
  reportNetworkError: (error: string, context?: Record<string, any>) => {
    MonitoringManager.getInstance().reportError({
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      message: `Network Error: ${error}`,
      context: context || {}
    });
  },

  // Storage error
  reportStorageError: (operation: string, error: string, context?: Record<string, any>) => {
    MonitoringManager.getInstance().reportError({
      type: ErrorType.STORAGE,
      severity: ErrorSeverity.LOW,
      message: `Storage Error: ${operation} - ${error}`,
      context: context || {}
    });
  }
};

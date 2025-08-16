import { useEffect, useMemo } from 'react';
import { useFeatureFlagStore, useFeatureFlag, useMultipleFeatureFlags } from '@/store/featureFlagStore';
import { FEATURE_FLAG_CATEGORIES } from '@/types/featureFlags';

/**
 * Main hook for accessing feature flags in components
 * Usage: const isEnabled = useFeatureFlags('video_questions');
 */
export const useFeatureFlags = (flagKey: string, context?: string) => {
  return useFeatureFlag(flagKey, context);
};

/**
 * Hook for accessing multiple feature flags at once
 * Usage: const flags = useMultipleFeatureFlags(['video_questions', 'dark_mode']);
 */
export const useMultipleFlags = (flagKeys: string[]) => {
  return useMultipleFeatureFlags(flagKeys);
};

/**
 * Hook for video-related feature flags
 */
export const useVideoFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'video_questions',
    'video_speed_control',
    'video_offline_download',
    'video_analytics',
    'video_fullscreen',
    'modern_video_player',
  ]);
};

/**
 * Hook for course-related feature flags
 */
export const useCourseFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'course_progress_tracking',
    'course_certificates',
    'course_discussions',
    'course_assignments',
    'course_tests',
  ]);
};

/**
 * Hook for user-related feature flags
 */
export const useUserFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'user_profile_edit',
    'user_theme_toggle',
    'user_notifications',
    'user_social_login',
  ]);
};

/**
 * Hook for UI-related feature flags
 */
export const useUIFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'gradient_ui',
    'dark_mode',
    'pull_to_refresh',
    'modern_video_player',
  ]);
};

/**
 * Hook for analytics-related feature flags
 */
export const useAnalyticsFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'analytics_tracking',
    'analytics_detailed',
    'analytics_export',
  ]);
};

/**
 * Hook for admin-related feature flags
 */
export const useAdminFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'admin_dashboard',
    'admin_user_management',
    'admin_content_management',
  ]);
};

/**
 * Hook for experimental feature flags
 */
export const useExperimentalFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'experimental_ai_recommendations',
    'experimental_voice_notes',
    'experimental_ar_features',
  ]);
};

/**
 * Hook for client-specific feature flags
 */
export const useClientFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'client_custom_branding',
    'client_custom_domain',
    'client_white_label',
  ]);
};

/**
 * Hook for performance-related feature flags
 */
export const usePerformanceFeatureFlags = () => {
  return useMultipleFeatureFlags([
    'performance_monitoring',
    'performance_caching',
    'performance_lazy_loading',
  ]);
};

/**
 * Hook that provides feature flag management functions
 */
export const useFeatureFlagManager = () => {
  const store = useFeatureFlagStore();
  
  return {
    // State
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,
    lastFetchTime: store.lastFetchTime,
    
    // Actions
    initializeFlags: store.initializeFlags,
    refreshFlags: store.refreshFlags,
    clearCache: store.clearCache,
    
    // Getters
    getAllFlags: store.getAllFlags,
    getEnabledFlags: store.getEnabledFlags,
    getDisabledFlags: store.getDisabledFlags,
    getFlagCount: store.getFlagCount,
  };
};

/**
 * Hook that automatically initializes feature flags when component mounts
 * Use this in your root component or splash screen
 */
export const useFeatureFlagInitializer = () => {
  const { initializeFlags, isInitialized, isLoading, error } = useFeatureFlagManager();
  
  useEffect(() => {
    if (!isInitialized) {
      initializeFlags();
    }
  }, [initializeFlags, isInitialized]);
  
  return {
    isInitialized,
    isLoading,
    error,
  };
};

/**
 * Hook for conditional rendering based on feature flags
 * Returns a render function that only renders if the feature is enabled
 */
export const useConditionalRender = (flagKey: string, context?: string) => {
  const isEnabled = useFeatureFlags(flagKey, context);
  
  return useMemo(() => ({
    isEnabled,
    renderIf: (component: React.ReactNode) => isEnabled ? component : null,
    renderIfElse: (enabledComponent: React.ReactNode, disabledComponent?: React.ReactNode) => 
      isEnabled ? enabledComponent : (disabledComponent || null),
  }), [isEnabled]);
};

/**
 * Hook for feature flag-based component variants
 * Useful for A/B testing or gradual rollouts
 */
export const useFeatureVariant = <T>(
  flagKey: string,
  variants: {
    enabled: T;
    disabled: T;
  },
  context?: string
) => {
  const isEnabled = useFeatureFlags(flagKey, context);
  
  return useMemo(() => 
    isEnabled ? variants.enabled : variants.disabled,
    [isEnabled, variants]
  );
};

/**
 * Hook that provides feature flag status with automatic refresh
 */
export const useFeatureFlagStatus = (refreshInterval?: number) => {
  const { refreshFlags, isLoading, error, lastFetchTime, getFlagCount } = useFeatureFlagManager();
  
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshFlags(false); // Don't force refresh on interval
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshFlags, refreshInterval]);
  
  const stats = getFlagCount();
  
  return {
    isLoading,
    error,
    lastFetchTime,
    stats,
    refresh: () => refreshFlags(true),
  };
};

/**
 * Hook for development/debugging feature flags
 * Only works in development mode
 */
export const useFeatureFlagDebug = () => {
  const store = useFeatureFlagStore();
  
  if (!__DEV__) {
    return {
      overrideFlag: () => console.warn('Feature flag override only available in development'),
      resetToDefaults: () => console.warn('Feature flag reset only available in development'),
      getAllFlags: () => ({}),
      logAllFlags: () => console.warn('Feature flag logging only available in development'),
    };
  }
  
  return {
    overrideFlag: store.overrideFlag,
    resetToDefaults: store.resetToDefaults,
    getAllFlags: store.getAllFlags,
    clearCache: store.clearCache,
    logAllFlags: () => {
      const flags = store.getAllFlags();
      console.group('🏁 Current Feature Flags');
      Object.entries(flags).forEach(([key, value]) => {
        console.log(`${value ? '✅' : '❌'} ${key}: ${value}`);
      });
      console.groupEnd();
    },
  };
};

/**
 * Higher-order hook that combines multiple feature flag hooks
 * Useful for components that need multiple types of flags
 */
export const useAllFeatureFlags = () => {
  const video = useVideoFeatureFlags();
  const course = useCourseFeatureFlags();
  const user = useUserFeatureFlags();
  const ui = useUIFeatureFlags();
  const analytics = useAnalyticsFeatureFlags();
  const admin = useAdminFeatureFlags();
  const experimental = useExperimentalFeatureFlags();
  const client = useClientFeatureFlags();
  const performance = usePerformanceFeatureFlags();
  
  return useMemo(() => ({
    video,
    course,
    user,
    ui,
    analytics,
    admin,
    experimental,
    client,
    performance,
  }), [video, course, user, ui, analytics, admin, experimental, client, performance]);
};

/**
 * Hook that provides feature flag categories
 */
export const useFeatureFlagCategories = () => {
  return useMemo(() => FEATURE_FLAG_CATEGORIES, []);
};

export default useFeatureFlags;

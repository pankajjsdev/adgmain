import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { DEFAULT_FEATURE_FLAGS } from '@/types/featureFlags';

/**
 * Feature flag evaluation utilities
 */

/**
 * Check if app version meets minimum requirement
 */
export const isVersionGreaterOrEqual = (currentVersion: string, minVersion: string): boolean => {
  const current = currentVersion.split('.').map(Number);
  const min = minVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(current.length, min.length); i++) {
    const currentPart = current[i] || 0;
    const minPart = min[i] || 0;
    
    if (currentPart > minPart) return true;
    if (currentPart < minPart) return false;
  }
  
  return true;
};

/**
 * Check if user is in rollout percentage
 */
export const isInRollout = (userId: string, percentage: number): boolean => {
  if (percentage >= 100) return true;
  if (percentage <= 0) return false;
  
  // Create a hash from userId for consistent rollout
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const normalizedHash = Math.abs(hash) % 100;
  return normalizedHash < percentage;
};

/**
 * Get device information for feature flag evaluation
 */
export const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    appVersion: Application.nativeApplicationVersion || '1.0.0',
    buildNumber: Application.nativeBuildVersion || '1',
  };
};

/**
 * Feature flag matchers for conditions
 */
export const featureFlagMatchers = {
  equals: (value: any, condition: any) => value === condition,
  notEquals: (value: any, condition: any) => value !== condition,
  greaterThan: (value: number, condition: number) => value > condition,
  lessThan: (value: number, condition: number) => value < condition,
  greaterThanOrEqual: (value: number, condition: number) => value >= condition,
  lessThanOrEqual: (value: number, condition: number) => value <= condition,
  contains: (value: string, condition: string) => value.includes(condition),
  in: (value: any, condition: any[]) => condition.includes(value),
  notIn: (value: any, condition: any[]) => !condition.includes(value),
};

/**
 * Evaluate feature flag conditions
 */
export const evaluateConditions = (
  conditions: any[],
  context: {
    platform: string;
    appVersion: string;
    clientName: string;
    userId?: string;
    deviceId?: string;
  }
): boolean => {
  if (!conditions || conditions.length === 0) return true;
  
  return conditions.every(condition => {
    const { type, operator, value } = condition;
    let contextValue;
    
    switch (type) {
      case 'platform':
        contextValue = context.platform;
        break;
      case 'appVersion':
        contextValue = context.appVersion;
        break;
      case 'clientName':
        contextValue = context.clientName;
        break;
      case 'userId':
        contextValue = context.userId;
        break;
      case 'deviceId':
        contextValue = context.deviceId;
        break;
      default:
        return false;
    }
    
    const matcher = featureFlagMatchers[operator as keyof typeof featureFlagMatchers];
    if (!matcher) return false;
    
    return matcher(contextValue, value);
  });
};

/**
 * Generate feature flag analytics event
 */
export const createFeatureFlagEvent = (
  flagKey: string,
  enabled: boolean,
  context?: string
) => {
  return {
    event: 'feature_flag_evaluated',
    properties: {
      flag_key: flagKey,
      enabled,
      context,
      platform: Platform.OS,
      app_version: Application.nativeApplicationVersion || '1.0.0',
      timestamp: Date.now(),
    },
  };
};

/**
 * Feature flag categories and their default states
 */
export const getFeatureFlagsByCategory = (category: string): Record<string, boolean> => {
  const categoryFlags: Record<string, Record<string, boolean>> = {
    video: {
      'video_questions': true,
      'video_speed_control': true,
      'video_offline_download': true,
      'video_analytics': true,
      'video_fullscreen': true,
      'modern_video_player': true,
    },
    course: {
      'course_progress_tracking': true,
      'course_certificates': true,
      'course_discussions': true,
      'course_assignments': true,
      'course_tests': true,
    },
    user: {
      'user_profile_edit': true,
      'user_theme_toggle': true,
      'user_notifications': true,
      'user_social_login': true,
    },
    ui: {
      'gradient_ui': true,
      'dark_mode': true,
      'pull_to_refresh': true,
      'modern_video_player': true,
    },
    analytics: {
      'analytics_tracking': true,
      'analytics_detailed': true,
      'analytics_export': true,
    },
    admin: {
      'admin_dashboard': true,
      'admin_user_management': true,
      'admin_content_management': true,
    },
    experimental: {
      'experimental_ai_recommendations': false,
      'experimental_voice_notes': false,
      'experimental_ar_features': false,
    },
    client: {
      'client_custom_branding': true,
      'client_custom_domain': true,
      'client_white_label': true,
    },
    performance: {
      'performance_monitoring': true,
      'performance_caching': true,
      'performance_lazy_loading': true,
    },
  };
  
  return categoryFlags[category] || {};
};

/**
 * Get all feature flags with their categories
 */
export const getCategorizedFeatureFlags = (): Record<string, Record<string, boolean>> => {
  return {
    video: getFeatureFlagsByCategory('video'),
    course: getFeatureFlagsByCategory('course'),
    user: getFeatureFlagsByCategory('user'),
    ui: getFeatureFlagsByCategory('ui'),
    analytics: getFeatureFlagsByCategory('analytics'),
    admin: getFeatureFlagsByCategory('admin'),
    experimental: getFeatureFlagsByCategory('experimental'),
    client: getFeatureFlagsByCategory('client'),
    performance: getFeatureFlagsByCategory('performance'),
  };
};

/**
 * Validate feature flag key format
 */
export const isValidFeatureFlagKey = (key: string): boolean => {
  // Feature flag keys should be lowercase with underscores
  const pattern = /^[a-z][a-z0-9_]*[a-z0-9]$/;
  return pattern.test(key);
};

/**
 * Generate feature flag documentation
 */
export const generateFeatureFlagDocs = (): string => {
  const categorized = getCategorizedFeatureFlags();
  let docs = '# Feature Flags Documentation\n\n';
  
  Object.entries(categorized).forEach(([category, flags]) => {
    docs += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Features\n\n`;
    
    Object.entries(flags).forEach(([key, defaultValue]) => {
      docs += `- **${key}**: ${defaultValue ? 'Enabled' : 'Disabled'} by default\n`;
    });
    
    docs += '\n';
  });
  
  return docs;
};

/**
 * Feature flag migration utilities
 */
export const migrateFeatureFlags = (
  oldFlags: Record<string, boolean>,
  flagMigrations: Record<string, string>
): Record<string, boolean> => {
  const newFlags = { ...oldFlags };
  
  Object.entries(flagMigrations).forEach(([oldKey, newKey]) => {
    if (oldKey in newFlags) {
      newFlags[newKey] = newFlags[oldKey];
      delete newFlags[oldKey];
    }
  });
  
  return newFlags;
};

/**
 * Feature flag A/B testing utilities
 */
export const getABTestVariant = (
  userId: string,
  testName: string,
  variants: string[]
): string => {
  const hash = `${userId}-${testName}`;
  let hashValue = 0;
  
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    hashValue = ((hashValue << 5) - hashValue) + char;
    hashValue = hashValue & hashValue;
  }
  
  const index = Math.abs(hashValue) % variants.length;
  return variants[index];
};

/**
 * Feature flag performance monitoring
 */
export const measureFeatureFlagPerformance = <T>(
  flagKey: string,
  operation: () => T
): T => {
  const startTime = Date.now();
  
  try {
    const result = operation();
    const duration = Date.now() - startTime;
    
    if (__DEV__ && duration > 10) {
      console.warn(`🏁 Feature flag ${flagKey} evaluation took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`🏁 Feature flag ${flagKey} evaluation failed after ${duration}ms:`, error);
    throw error;
  }
};

/**
 * Feature flag cache utilities
 */
export const createFeatureFlagCacheKey = (
  clientName: string,
  platform: string,
  appVersion: string
): string => {
  return `feature_flags_${clientName}_${platform}_${appVersion}`;
};

/**
 * Feature flag environment utilities
 */
export const getEnvironmentFeatureFlags = (): Record<string, boolean> => {
  const env = process.env.NODE_ENV || 'production';
  
  const environmentFlags: Record<string, Record<string, boolean>> = {
    development: {
      'experimental_ai_recommendations': true,
      'experimental_voice_notes': true,
      'performance_monitoring': true,
    },
    staging: {
      'experimental_ai_recommendations': true,
      'performance_monitoring': true,
    },
    production: {
      'performance_monitoring': true,
    },
  };
  
  return environmentFlags[env] || {};
};

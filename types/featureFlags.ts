export interface FeatureFlagRequest {
  clientName: string;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  deviceId?: string;
  userId?: string;
  buildNumber?: string;
  osVersion?: string;
  deviceModel?: string;
}

export interface FeatureFlagCondition {
  type: 'platform' | 'appVersion' | 'clientName' | 'userId' | 'deviceId' | 'osVersion' | 'buildNumber';
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'contains' | 'in' | 'notIn';
  value: string | string[] | number;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: FeatureFlagCondition[];
  rolloutPercentage?: number; // 0-100
  clientSpecific?: {
    [clientName: string]: boolean;
  };
  platformSpecific?: {
    ios?: boolean;
    android?: boolean;
    web?: boolean;
  };
  versionSpecific?: {
    minVersion?: string;
    maxVersion?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureFlagResponse {
  success: boolean;
  data: {
    flags: Record<string, boolean>;
    metadata: {
      clientName: string;
      platform: string;
      appVersion: string;
      evaluatedAt: string;
      cacheExpiresAt?: string;
    };
  };
  error?: string;
}

export interface FeatureFlagCache {
  flags: Record<string, boolean>;
  metadata: FeatureFlagResponse['data']['metadata'];
  cachedAt: number;
  expiresAt: number;
}

// Default feature flags - all enabled by default
export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  // Video features
  'video_questions': true,
  'video_speed_control': true,
  'video_offline_download': true,
  'video_analytics': true,
  'video_fullscreen': true,
  
  // Course features
  'course_progress_tracking': true,
  'course_certificates': true,
  'course_discussions': true,
  'course_assignments': true,
  'course_tests': true,
  
  // User features
  'user_profile_edit': true,
  'user_theme_toggle': true,
  'user_notifications': true,
  'user_social_login': true,
  
  // Analytics features
  'analytics_tracking': true,
  'analytics_detailed': true,
  'analytics_export': true,
  
  // UI features
  'modern_video_player': true,
  'gradient_ui': true,
  'dark_mode': true,
  'pull_to_refresh': true,
  
  // Admin features
  'admin_dashboard': true,
  'admin_user_management': true,
  'admin_content_management': true,
  
  // Experimental features
  'experimental_ai_recommendations': false,
  'experimental_voice_notes': false,
  'experimental_ar_features': false,
  
  // Client-specific features
  'client_custom_branding': true,
  'client_custom_domain': true,
  'client_white_label': true,
  
  // Performance features
  'performance_monitoring': true,
  'performance_caching': true,
  'performance_lazy_loading': true,
};

// Feature flag categories for better organization
export const FEATURE_FLAG_CATEGORIES = {
  VIDEO: 'video',
  COURSE: 'course', 
  USER: 'user',
  ANALYTICS: 'analytics',
  UI: 'ui',
  ADMIN: 'admin',
  EXPERIMENTAL: 'experimental',
  CLIENT: 'client',
  PERFORMANCE: 'performance',
} as const;

export type FeatureFlagCategory = typeof FEATURE_FLAG_CATEGORIES[keyof typeof FEATURE_FLAG_CATEGORIES];

import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { getApiConfig } from '@/utils/clientConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FeatureFlagRequest,
  FeatureFlagResponse,
  FeatureFlagCache,
  DEFAULT_FEATURE_FLAGS,
} from '@/types/featureFlags';

// Storage key for feature flags cache
const FEATURE_FLAGS_CACHE_KEY = '@feature_flags/cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get device and app information for feature flag request
 */
export const getFeatureFlagRequestData = async (): Promise<FeatureFlagRequest> => {
  const config = getApiConfig();
  
  try {
    return {
      clientName: config.headers['X-Client-Name'] || 'default',
      platform: Platform.OS as 'ios' | 'android' | 'web',
      appVersion: Application.nativeApplicationVersion || '1.0.0',
      deviceId: await Application.getAndroidId() || 'unknown',
      buildNumber: Application.nativeBuildVersion || '1',
      osVersion: Device.osVersion || 'unknown',
      deviceModel: Device.modelName || 'unknown',
    };
  } catch (error) {
    // Fallback if device info fails
    return {
      clientName: config.headers['X-Client-Name'] || 'default',
      platform: Platform.OS as 'ios' | 'android' | 'web',
      appVersion: '1.0.0',
      deviceId: 'unknown',
      buildNumber: '1',
      osVersion: 'unknown',
      deviceModel: 'unknown',
    };
  }
};

// Hardcoded feature flags for development/testing
export const getHardcodedFeatureFlags = (requestData: FeatureFlagRequest): FeatureFlagResponse => {
  // Simulate client-specific and platform-specific feature flags
  const flags = { ...DEFAULT_FEATURE_FLAGS };
  
  // Client-specific overrides
  if (requestData.clientName === 'adg') {
    flags.adg_branding = true;
    flags.advanced_analytics = true;
  } else if (requestData.clientName === 'techedu') {
    flags.techedu_branding = true;
    flags.gamification = true;
  } else if (requestData.clientName === 'skillboost') {
    flags.skillboost_branding = true;
    flags.ai_recommendations = true;
  }
  
  // Platform-specific overrides
  if (requestData.platform === 'ios') {
    flags.ios_native_player = true;
    flags.haptic_feedback = true;
  } else if (requestData.platform === 'android') {
    flags.android_native_player = true;
    flags.picture_in_picture = true;
  }
  
  // Version-based overrides
  const appVersion = requestData.appVersion;
  if (appVersion && appVersion >= '2.0.0') {
    flags.modern_ui = true;
    flags.advanced_search = true;
  }
  
  // Experimental features (disabled by default)
  flags.beta_features = false;
  flags.experimental_ui = false;
  
  return {
    success: true,
    data: {
      flags,
      metadata: {
        clientName: requestData.clientName,
        platform: requestData.platform,
        appVersion: requestData.appVersion,
        evaluatedAt: new Date().toISOString(),
        cacheExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      }
    }
  };
};

/**
 * Fetch feature flags (currently using hardcoded data)
 * TODO: Replace with actual API call when backend is ready
 */
export const fetchFeatureFlags = async (
  forceRefresh: boolean = false
): Promise<Record<string, boolean>> => {
  try {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedFlags = await getCachedFeatureFlags();
      if (cachedFlags) {
        console.log('🏁 Using cached feature flags');
        return cachedFlags.flags;
      }
    }

    console.log('🚀 Fetching feature flags (using hardcoded data)...');
    
    // Get request data for logging
    const requestData = await getFeatureFlagRequestData();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // HARDCODED DATA - Replace with actual API call later
    const hardcodedResponse = getHardcodedFeatureFlags(requestData);
    
    const flags = hardcodedResponse.data.flags;
    
    // Cache the response
    const cacheData: FeatureFlagCache = {
      flags,
      metadata: hardcodedResponse.data.metadata,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };
    
    await AsyncStorage.setItem(
      FEATURE_FLAGS_CACHE_KEY,
      JSON.stringify(cacheData)
    );
    
    console.log('✅ Feature flags fetched and cached (hardcoded):', {
      clientName: requestData.clientName,
      platform: requestData.platform,
      appVersion: requestData.appVersion,
      flagCount: Object.keys(flags).length,
      enabledFlags: Object.entries(flags).filter(([_, enabled]) => enabled).length,
    });
    
    return flags;
  } catch (error) {
    console.error('❌ Error fetching feature flags:', error);
    
    // Fallback to default flags
    console.log('🔄 Using default feature flags as fallback');
    return DEFAULT_FEATURE_FLAGS;
  }
};

/**
 * Get cached feature flags if they exist and are not expired
 */
export const getCachedFeatureFlags = async (): Promise<FeatureFlagCache | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(FEATURE_FLAGS_CACHE_KEY);
    
    if (!cachedData) {
      return null;
    }
    
    const cache: FeatureFlagCache = JSON.parse(cachedData);
    
    // Check if cache is expired
    if (Date.now() > cache.expiresAt) {
      console.log('⏰ Feature flags cache expired');
      await AsyncStorage.removeItem(FEATURE_FLAGS_CACHE_KEY);
      return null;
    }
    
    return cache;
  } catch (error) {
    console.error('Error reading feature flags cache:', error);
    return null;
  }
};

/**
 * Clear feature flags cache
 */
export const clearFeatureFlagsCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FEATURE_FLAGS_CACHE_KEY);
    console.log('🗑️ Feature flags cache cleared');
  } catch (error) {
    console.error('Error clearing feature flags cache:', error);
  }
};

/**
 * Check if a specific feature flag is enabled
 * This function should be used by components to check feature availability
 */
export const isFeatureEnabled = (
  flagKey: string,
  flags: Record<string, boolean>
): boolean => {
  // Return the flag value if it exists, otherwise check default flags
  if (flagKey in flags) {
    return flags[flagKey];
  }
  
  // Fallback to default flags
  if (flagKey in DEFAULT_FEATURE_FLAGS) {
    return DEFAULT_FEATURE_FLAGS[flagKey];
  }
  
  // If flag doesn't exist anywhere, default to false for safety
  console.warn(`⚠️ Feature flag '${flagKey}' not found, defaulting to false`);
  return false;
};

/**
 * Get multiple feature flags at once
 */
export const getFeatureFlags = (
  flagKeys: string[],
  flags: Record<string, boolean>
): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  
  flagKeys.forEach(key => {
    result[key] = isFeatureEnabled(key, flags);
  });
  
  return result;
};

/**
 * Log feature flag usage for analytics
 */
export const logFeatureFlagUsage = (
  flagKey: string,
  enabled: boolean,
  context?: string
): void => {
  if (__DEV__) {
    console.log(`🏁 Feature flag used: ${flagKey} = ${enabled}`, {
      context,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Here you could send analytics data to your analytics service
  // analytics.track('feature_flag_used', { flagKey, enabled, context });
};

/**
 * Validate feature flag configuration
 */
export const validateFeatureFlags = (flags: Record<string, boolean>): boolean => {
  try {
    // Check if flags is an object
    if (typeof flags !== 'object' || flags === null) {
      console.error('❌ Feature flags must be an object');
      return false;
    }
    
    // Check if all values are boolean
    const invalidFlags = Object.entries(flags).filter(
      ([key, value]) => typeof value !== 'boolean'
    );
    
    if (invalidFlags.length > 0) {
      console.error('❌ Invalid feature flag values (must be boolean):', invalidFlags);
      return false;
    }
    
    console.log('✅ Feature flags validation passed');
    return true;
  } catch (error) {
    console.error('❌ Error validating feature flags:', error);
    return false;
  }
};

/**
 * Merge feature flags with defaults
 * Ensures all default flags are present even if not returned by API
 */
export const mergeWithDefaults = (
  apiFlags: Record<string, boolean>
): Record<string, boolean> => {
  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...apiFlags,
  };
};

/**
 * Get feature flags for development/testing
 * This function can be used to override flags for testing purposes
 */
export const getDevFeatureFlags = (): Record<string, boolean> => {
  if (!__DEV__) {
    return {};
  }
  
  // You can override specific flags for development here
  return {
    // Example: Force enable experimental features in dev
    'experimental_ai_recommendations': true,
    'experimental_voice_notes': true,
    // Add more dev overrides as needed
  };
};

/**
 * Initialize feature flags system
 * This should be called during app startup
 */
export const initializeFeatureFlags = async (): Promise<Record<string, boolean>> => {
  console.log('🏁 Initializing feature flags system...');
  
  try {
    // Fetch feature flags from API or cache
    let flags = await fetchFeatureFlags();
    
    // Merge with defaults to ensure all flags are present
    flags = mergeWithDefaults(flags);
    
    // In development, merge with dev overrides
    if (__DEV__) {
      const devFlags = getDevFeatureFlags();
      flags = { ...flags, ...devFlags };
      console.log('🔧 Applied development feature flag overrides');
    }
    
    // Validate the final flags
    if (!validateFeatureFlags(flags)) {
      console.warn('⚠️ Feature flags validation failed, using defaults');
      flags = DEFAULT_FEATURE_FLAGS;
    }
    
    console.log('✅ Feature flags initialized successfully:', {
      totalFlags: Object.keys(flags).length,
      enabledFlags: Object.entries(flags).filter(([_, enabled]) => enabled).length,
    });
    
    return flags;
  } catch (error) {
    console.error('❌ Failed to initialize feature flags:', error);
    return DEFAULT_FEATURE_FLAGS;
  }
};

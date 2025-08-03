import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { getClientConfig } from './clientConfig';

/**
 * Clean Feature Flag System
 * Simple implementation that works with your existing codebase
 */

export interface FeatureContext {
  clientName?: string;
  appVersion?: string;
  platform?: 'ios' | 'android' | 'web';
  environment?: 'development' | 'preview' | 'staging' | 'production';
}

export interface FeatureCheckResult {
  enabled: boolean;
  reason?: string;
}

interface ClientConfig {
  enabled: boolean;
  minVersion?: string;
  maxVersion?: string;
  platforms?: ('ios' | 'android' | 'web')[];
}

// Simple feature flag configuration
const FEATURE_FLAGS = {
  // Authentication Features
  googleSignIn: {
    description: 'Google Sign-In authentication',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: false, minVersion: '1.1.0' }
    }
  },
  appleSignIn: {
    description: 'Apple Sign-In authentication',
    defaultEnabled: false,
    clients: {
      adg: { enabled: true, minVersion: '1.2.0', platforms: ['ios'] },
      techedu: { enabled: true, minVersion: '1.1.0', platforms: ['ios'] },
      skillboost: { enabled: false },
      edutech: { enabled: true, minVersion: '2.0.0', platforms: ['ios'] }
    }
  },
  biometricAuth: {
    description: 'Biometric authentication (Face ID, Touch ID)',
    defaultEnabled: false,
    clients: {
      adg: { enabled: true, minVersion: '1.3.0', platforms: ['ios', 'android'] },
      techedu: { enabled: true, minVersion: '1.2.0', platforms: ['ios', 'android'] },
      skillboost: { enabled: false },
      edutech: { enabled: true, minVersion: '2.0.0', platforms: ['ios', 'android'] }
    }
  },

  // Video Features
  videoQuestions: {
    description: 'Interactive video questions',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },
  videoAnalytics: {
    description: 'Video watching analytics',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: false, minVersion: '1.2.0' }
    }
  },
  videoDownload: {
    description: 'Offline video downloads',
    defaultEnabled: false,
    clients: {
      adg: { enabled: true, minVersion: '1.3.0' },
      techedu: { enabled: true, minVersion: '1.2.0' },
      skillboost: { enabled: true, minVersion: '1.4.0' },
      edutech: { enabled: false }
    }
  },

  // Course Management Features
  assignments: {
    description: 'Assignment submission system',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },
  tests: {
    description: 'Test taking system',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },
  notes: {
    description: 'Course notes system',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.1.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.1.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },

  // UI Features
  darkMode: {
    description: 'Dark mode theme support',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.1.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.1.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },
  customThemes: {
    description: 'Custom theme selection',
    defaultEnabled: false,
    clients: {
      adg: { enabled: false },
      techedu: { enabled: true, minVersion: '1.3.0' },
      skillboost: { enabled: true, minVersion: '1.2.0' },
      edutech: { enabled: false }
    }
  },
  bannerCarousel: {
    description: 'Home page banner carousel',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },

  // Analytics Features
  analytics: {
    description: 'User behavior analytics',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: false, minVersion: '1.3.0' }
    }
  },
  crashReporting: {
    description: 'Automatic crash reporting',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },

  // Social Features
  socialSharing: {
    description: 'Share courses and achievements',
    defaultEnabled: false,
    clients: {
      adg: { enabled: true, minVersion: '1.2.0' },
      techedu: { enabled: true, minVersion: '1.1.0' },
      skillboost: { enabled: true, minVersion: '1.3.0' },
      edutech: { enabled: false }
    }
  },

  // Experimental Features
  aiChatbot: {
    description: 'AI-powered course assistance chatbot',
    defaultEnabled: false,
    clients: {
      adg: { enabled: false },
      techedu: { enabled: true, minVersion: '2.0.0' },
      skillboost: { enabled: false },
      edutech: { enabled: true, minVersion: '3.0.0' }
    }
  },
  voiceNotes: {
    description: 'Voice note recording for courses',
    defaultEnabled: false,
    clients: {
      adg: { enabled: false },
      techedu: { enabled: true, minVersion: '1.5.0' },
      skillboost: { enabled: false },
      edutech: { enabled: false }
    }
  },

  // Platform-specific Features
  pushNotifications: {
    description: 'Push notification system',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0', platforms: ['ios', 'android'] },
      techedu: { enabled: true, minVersion: '1.0.0', platforms: ['ios', 'android'] },
      skillboost: { enabled: true, minVersion: '1.0.0', platforms: ['ios', 'android'] },
      edutech: { enabled: false, minVersion: '1.2.0', platforms: ['ios', 'android'] }
    }
  }
};

// Feature groups for easier management
const FEATURE_GROUPS = {
  authentication: ['googleSignIn', 'appleSignIn', 'biometricAuth'],
  video: ['videoQuestions', 'videoAnalytics', 'videoDownload'],
  courseManagement: ['assignments', 'tests', 'notes'],
  ui: ['darkMode', 'customThemes', 'bannerCarousel'],
  analytics: ['analytics', 'crashReporting'],
  social: ['socialSharing'],
  experimental: ['aiChatbot', 'voiceNotes'],
  platform: ['pushNotifications', 'biometricAuth']
};

// Environment overrides
const ENVIRONMENT_OVERRIDES = {
  development: {
    analytics: { enabled: true },
    crashReporting: { enabled: false }
  },
  preview: {
    aiChatbot: { enabled: true },
    voiceNotes: { enabled: true }
  },
  staging: {
    analytics: { enabled: true },
    crashReporting: { enabled: true }
  },
  production: {}
};

class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private context: FeatureContext = {};

  private constructor() {
    this.initializeContext();
  }

  public static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  private initializeContext() {
    try {
      const clientConfig = getClientConfig();
      this.context = {
        clientName: clientConfig?.name?.toLowerCase() || 'adg',
        appVersion: Application.nativeApplicationVersion || '1.0.0',
        platform: Platform.OS as 'ios' | 'android',
        environment: this.detectEnvironment()
      };
    } catch (error) {
      console.warn('Failed to initialize feature flag context:', error);
      this.context = {
        clientName: 'adg',
        appVersion: '1.0.0',
        platform: Platform.OS as 'ios' | 'android',
        environment: 'development'
      };
    }
  }

  private detectEnvironment(): 'development' | 'preview' | 'staging' | 'production' {
    if (__DEV__) return 'development';
    
    const appVariant = process.env.EXPO_PUBLIC_APP_VARIANT || 'production';
    
    switch (appVariant) {
      case 'development':
      case 'dev':
        return 'development';
      case 'preview':
        return 'preview';
      case 'staging':
        return 'staging';
      default:
        return 'production';
    }
  }

  public updateContext(newContext: Partial<FeatureContext>) {
    this.context = { ...this.context, ...newContext };
  }

  public getContext(): FeatureContext {
    return { ...this.context };
  }

  public checkFeature(featureName: string, customContext?: Partial<FeatureContext>): FeatureCheckResult {
    const context = { ...this.context, ...customContext };
    const feature = FEATURE_FLAGS[featureName as keyof typeof FEATURE_FLAGS];

    if (!feature) {
      return {
        enabled: false,
        reason: `Feature '${featureName}' not found`
      };
    }

    // Check environment overrides first
    const envKey = (context.environment || 'production') as keyof typeof ENVIRONMENT_OVERRIDES;
    const envOverrides = ENVIRONMENT_OVERRIDES[envKey];
    if (envOverrides && (envOverrides as any)[featureName]) {
      const override = (envOverrides as any)[featureName] as { enabled?: boolean };
      return {
        enabled: override.enabled !== false,
        reason: `Environment override (${context.environment})`
      };
    }

    // Get client-specific configuration
    const clientKey = (context.clientName || 'adg') as keyof typeof feature.clients;
    const clientConfig = feature.clients[clientKey];
    
    if (!clientConfig) {
      return {
        enabled: feature.defaultEnabled || false,
        reason: `No client config found, using default: ${feature.defaultEnabled}`
      };
    }

    // Check if feature is explicitly disabled for this client
    if (clientConfig.enabled === false) {
      return {
        enabled: false,
        reason: `Disabled for client '${context.clientName}'`
      };
    }

    // Check version constraints
    const config = clientConfig as ClientConfig;
    if (config.minVersion) {
      const currentVersion = context.appVersion || '1.0.0';
      if (this.compareVersions(currentVersion, config.minVersion) < 0) {
        return {
          enabled: false,
          reason: `Requires version ${config.minVersion} or higher (current: ${currentVersion})`
        };
      }
    }

    // Check platform constraints
    if (config.platforms && config.platforms.length > 0) {
      const currentPlatform = context.platform || 'ios';
      if (!config.platforms.includes(currentPlatform)) {
        return {
          enabled: false,
          reason: `Not available on ${currentPlatform} (available on: ${config.platforms.join(', ')})`
        };
      }
    }

    return {
      enabled: true,
      reason: 'All checks passed'
    };
  }

  public isFeatureEnabled(featureName: string, customContext?: Partial<FeatureContext>): boolean {
    return this.checkFeature(featureName, customContext).enabled;
  }

  public checkFeatures(featureNames: string[], customContext?: Partial<FeatureContext>): Record<string, boolean> {
    const results: Record<string, boolean> = {};
    featureNames.forEach(name => {
      results[name] = this.isFeatureEnabled(name, customContext);
    });
    return results;
  }

  public checkFeatureGroup(groupName: string, customContext?: Partial<FeatureContext>): Record<string, boolean> {
    const features = FEATURE_GROUPS[groupName as keyof typeof FEATURE_GROUPS];
    if (!features) {
      console.warn(`Feature group '${groupName}' not found`);
      return {};
    }
    return this.checkFeatures(features, customContext);
  }

  public getEnabledFeatures(customContext?: Partial<FeatureContext>): string[] {
    const context = { ...this.context, ...customContext };
    const enabledFeatures: string[] = [];

    Object.keys(FEATURE_FLAGS).forEach(featureName => {
      if (this.isFeatureEnabled(featureName, context)) {
        enabledFeatures.push(featureName);
      }
    });

    return enabledFeatures;
  }

  public getAllFeatures(): string[] {
    return Object.keys(FEATURE_FLAGS);
  }

  public getFeatureGroups(): Record<string, string[]> {
    return { ...FEATURE_GROUPS };
  }

  private compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split('.').map(n => parseInt(n, 10));
    const v2parts = version2.split('.').map(n => parseInt(n, 10));

    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }

    return 0;
  }
}

// Export singleton instance
export const featureFlagManager = FeatureFlagManager.getInstance();

// Convenience functions for easy usage
export const isFeatureEnabled = (featureName: string, context?: Partial<FeatureContext>): boolean => {
  return featureFlagManager.isFeatureEnabled(featureName, context);
};

export const checkFeature = (featureName: string, context?: Partial<FeatureContext>): FeatureCheckResult => {
  return featureFlagManager.checkFeature(featureName, context);
};

export const checkFeatures = (featureNames: string[], context?: Partial<FeatureContext>): Record<string, boolean> => {
  return featureFlagManager.checkFeatures(featureNames, context);
};

export const checkFeatureGroup = (groupName: string, context?: Partial<FeatureContext>): Record<string, boolean> => {
  return featureFlagManager.checkFeatureGroup(groupName, context);
};

export const getEnabledFeatures = (context?: Partial<FeatureContext>): string[] => {
  return featureFlagManager.getEnabledFeatures(context);
};

// Development helpers
export const debugFeatureFlags = () => {
  const context = featureFlagManager.getContext();
  const enabledFeatures = getEnabledFeatures();
  
  console.log('🏁 Feature Flags Debug Info');
  console.log('Context:', context);
  console.log('Enabled Features:', enabledFeatures);
  console.log('All Features:', featureFlagManager.getAllFeatures());
  console.log('Feature Groups:', featureFlagManager.getFeatureGroups());
};

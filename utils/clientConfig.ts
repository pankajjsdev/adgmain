/**
 * Client Configuration Utility
 * Provides runtime access to client-specific configuration
 */

import Constants from 'expo-constants';

export interface ClientConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    light: {
      primary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
    };
    dark: {
      primary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
    };
  };
  api: {
    baseUrl: string;
    version: string;
    timeout: number;
    endpoints: {
      auth: string;
      courses: string;
      videos: string;
      assignments: string;
      tests: string;
      banners: string;
      students: string;
    };
  };
  features: {
    analytics: boolean;
    pushNotifications: boolean;
    socialLogin: boolean;
    darkMode: boolean;
    biometricAuth: boolean;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
    privacyPolicy: string;
    termsOfService: string;
  };
  appStore: {
    appleId: string;
    googlePlayId: string;
  };
}

/**
 * Get the current client configuration from Expo Constants
 * This reads the configuration that was set at build time
 */
export const getClientConfig = (): ClientConfig => {
  const expoConfig = Constants.expoConfig;
  const clientConfig = expoConfig?.extra?.clientConfig;
  
  if (!clientConfig) {
    console.warn('Client configuration not found in Expo Constants. Using fallback configuration.');
    return getFallbackConfig();
  }
  
  return clientConfig as ClientConfig;
};

/**
 * Get the current client name
 */
export const getClientName = (): string => {
  const expoConfig = Constants.expoConfig;
  return expoConfig?.extra?.clientName || 'adg';
};

/**
 * Get the current app variant (development, preview, staging, production)
 */
export const getAppVariant = (): string => {
  const expoConfig = Constants.expoConfig;
  return expoConfig?.extra?.appVariant || 'production';
};

/**
 * Check if a feature is enabled for the current client
 */
export const isFeatureEnabled = (feature: keyof ClientConfig['features']): boolean => {
  const config = getClientConfig();
  return config.features[feature] || false;
};

/**
 * Get API configuration for the current client
 */
export const getApiConfig = () => {
  const config = getClientConfig();
  return {
    baseUrl: config.api.baseUrl,
    timeout: config.api.timeout,
    endpoints: config.api.endpoints,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Name': getClientName(),
      'X-App-Version': Constants.expoConfig?.version || '1.0.0',
    }
  };
};

/**
 * Get theme colors for the current client
 */
export const getThemeColors = (colorScheme: 'light' | 'dark' = 'light') => {
  const config = getClientConfig();
  const baseColors = config.colors;
  const themeSpecific = colorScheme === 'dark' ? baseColors.dark : baseColors.light;
  
  return {
    ...baseColors,
    ...themeSpecific,
    // Expo Router tab bar colors
    tint: themeSpecific.primary,
    tabIconDefault: baseColors.textSecondary,
    tabIconSelected: themeSpecific.primary,
  };
};

/**
 * Get contact information for the current client
 */
export const getContactInfo = () => {
  const config = getClientConfig();
  return config.contact;
};

/**
 * Get app store information for the current client
 */
export const getAppStoreInfo = () => {
  const config = getClientConfig();
  return config.appStore;
};

/**
 * Fallback configuration in case client config is not available
 */
const getFallbackConfig = (): ClientConfig => ({
  name: 'ADG Classes',
  displayName: 'ADG Classes',
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF9500',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    light: {
      primary: '#007AFF',
      background: '#FFFFFF',
      surface: '#F2F2F7',
      text: '#000000',
      textSecondary: '#8E8E93',
    },
    dark: {
      primary: '#0A84FF',
      background: '#000000',
      surface: '#1C1C1E',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
    }
  },
  api: {
    baseUrl: 'https://api.adgclasses.com',
    version: 'v1',
    timeout: 30000,
    endpoints: {
      auth: '/auth',
      courses: '/courseManagement',
      videos: '/video',
      assignments: '/assignment',
      tests: '/test',
      banners: '/banner',
      students: '/student'
    }
  },
  features: {
    analytics: true,
    pushNotifications: true,
    socialLogin: true,
    darkMode: true,
    biometricAuth: true
  },
  contact: {
    email: 'support@adgclasses.com',
    phone: '+1-800-ADG-HELP',
    website: 'https://adgclasses.com',
    privacyPolicy: 'https://adgclasses.com/privacy',
    termsOfService: 'https://adgclasses.com/terms'
  },
  appStore: {
    appleId: '1234567890',
    googlePlayId: 'com.adg.classes'
  }
});

/**
 * Development helper to log current configuration
 */
export const logCurrentConfig = () => {
  if (__DEV__) {
    console.log('=== Current Client Configuration ===');
    console.log('Client Name:', getClientName());
    console.log('App Variant:', getAppVariant());
    console.log('Display Name:', getClientConfig().displayName);
    console.log('API Base URL:', getClientConfig().api.baseUrl);
    console.log('Primary Color:', getClientConfig().colors.primary);
    console.log('=====================================');
  }
};

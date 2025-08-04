const { getClientConfig } = require('./config/clients');

/**
 * Dynamic Expo configuration for multi-tenant architecture
 * Uses environment variables to determine which client configuration to load
 */

// Get client from environment variable, default to 'adg'
const CLIENT_NAME = process.env.CLIENT_NAME || 'adg';
const APP_VARIANT = process.env.APP_VARIANT || 'production';

// Load client-specific configuration
const clientConfig = getClientConfig(CLIENT_NAME);

// Environment-based suffixes for development/staging
const getEnvironmentSuffix = () => {
  switch (APP_VARIANT) {
    case 'development':
      return ' (Dev)';
    case 'preview':
      return ' (Preview)';
    case 'staging':
      return ' (Staging)';
    default:
      return '';
  }
};

// Generate unique identifiers for different environments
const getUniqueIdentifier = (baseIdentifier) => {
  switch (APP_VARIANT) {
    case 'development':
      return `${baseIdentifier}.dev`;
    case 'preview':
      return `${baseIdentifier}.preview`;
    case 'staging':
      return `${baseIdentifier}.staging`;
    default:
      return baseIdentifier;
  }
};

// Generate app name with environment suffix
const getAppName = () => {
  return `${clientConfig.displayName}${getEnvironmentSuffix()}`;
};

// Generate scheme with client and environment
const getScheme = () => {
  const baseScheme = clientConfig.slug;
  switch (APP_VARIANT) {
    case 'development':
      return `${baseScheme}-dev`;
    case 'preview':
      return `${baseScheme}-preview`;
    case 'staging':
      return `${baseScheme}-staging`;
    default:
      return baseScheme;
  }
};

// Export dynamic configuration
export default ({ config }) => ({
  ...config,
  name: getAppName(),
  slug: clientConfig.slug,
  version: config.version || '1.0.0',
  orientation: 'portrait',
  icon: clientConfig.assets.icon,
  scheme: getScheme(),
  userInterfaceStyle: 'automatic',
  description: clientConfig.description,
  
  // iOS Configuration
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(clientConfig.bundleIdentifier),
    buildNumber: config.ios?.buildNumber || '1',
    infoPlist: {
      CFBundleDisplayName: getAppName(),
      CFBundleName: clientConfig.name,
      CFBundleShortVersionString: config.version || '1.0.0',
    }
  },
  
  // Android Configuration
  android: {
    ...config.android,
    package: getUniqueIdentifier(clientConfig.androidPackage),
    versionCode: config.android?.versionCode || 1,
    adaptiveIcon: {
      foregroundImage: clientConfig.assets.adaptiveIcon,
      backgroundColor: clientConfig.colors.background
    },
    edgeToEdgeEnabled: true,
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'RECORD_AUDIO'
    ]
  },
  
  // Web Configuration
  web: {
    ...config.web,
    bundler: 'metro',
    output: 'static',
    favicon: clientConfig.assets.favicon,
    name: getAppName(),
    shortName: clientConfig.name,
    description: clientConfig.description,
    themeColor: clientConfig.colors.primary,
    backgroundColor: clientConfig.colors.background
  },
  
  // Splash Screen Configuration
  splash: {
    image: clientConfig.assets.splash,
    resizeMode: 'contain',
    backgroundColor: clientConfig.colors.background,
    imageWidth: 200
  },
  
  // Plugins Configuration
  plugins: [
    'expo-router',
    'expo-video',
    [
      'expo-splash-screen',
      {
        image: clientConfig.assets.splash,
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: clientConfig.colors.background
      }
    ],
    'expo-secure-store',
    'expo-font',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0'
        },
        ios: {
          deploymentTarget: '15.1'
        }
      }
    ]
  ],
  
  // Experiments
  experiments: {
    typedRoutes: true
  },
  
  // Extra configuration for runtime access
  extra: {
    clientName: CLIENT_NAME,
    appVariant: APP_VARIANT,
    clientConfig: {
      name: clientConfig.name,
      displayName: clientConfig.displayName,
      colors: clientConfig.colors,
      api: clientConfig.api,
      features: clientConfig.features,
      contact: clientConfig.contact,
      appStore: clientConfig.appStore
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id'
    }
  },
  
  // Updates Configuration
  updates: {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID || 'your-eas-project-id'}`
  },
  
  // Runtime Version
  runtimeVersion: {
    policy: 'sdkVersion'
  }
});

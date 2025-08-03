/**
 * Feature Flag Configuration System
 * Enables/disables features based on client and app version
 */

/**
 * Feature flag definitions with version constraints
 * Structure:
 * {
 *   featureName: {
 *     description: 'Feature description',
 *     defaultEnabled: boolean,
 *     clients: {
 *       clientName: {
 *         enabled: boolean,
 *         minVersion: 'semver',
 *         maxVersion: 'semver',
 *         platforms: ['ios', 'android', 'web']
 *       }
 *     }
 *   }
 * }
 */

const featureFlags = {
  // Authentication Features
  googleSignIn: {
    description: 'Google Sign-In authentication',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: false, minVersion: '1.1.0' } // Will be enabled in v1.1.0
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

  // Video Features
  videoQuestions: {
    description: 'Interactive video questions',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: false, minVersion: '1.5.0' }
    }
  },

  videoAnalytics: {
    description: 'Detailed video watching analytics',
    defaultEnabled: false,
    clients: {
      adg: { enabled: true, minVersion: '1.1.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: false },
      edutech: { enabled: true, minVersion: '2.0.0' }
    }
  },

  videoDownload: {
    description: 'Offline video download capability',
    defaultEnabled: false,
    clients: {
      adg: { enabled: false }, // Premium feature for future
      techedu: { enabled: true, minVersion: '1.3.0' },
      skillboost: { enabled: true, minVersion: '1.2.0' },
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
    description: 'Online test system',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },

  notes: {
    description: 'Course notes and materials',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: false, minVersion: '1.2.0' }
    }
  },

  // UI/UX Features
  darkMode: {
    description: 'Dark mode theme support',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: true, minVersion: '1.0.0' }
    }
  },

  customThemes: {
    description: 'Custom theme selection',
    defaultEnabled: false,
    clients: {
      adg: { enabled: false }, // Future premium feature
      techedu: { enabled: true, minVersion: '1.4.0' },
      skillboost: { enabled: false },
      edutech: { enabled: true, minVersion: '2.0.0' }
    }
  },

  bannerCarousel: {
    description: 'Home page banner carousel',
    defaultEnabled: true,
    clients: {
      adg: { enabled: true, minVersion: '1.0.0' },
      techedu: { enabled: true, minVersion: '1.0.0' },
      skillboost: { enabled: true, minVersion: '1.0.0' },
      edutech: { enabled: false, minVersion: '1.1.0' }
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
      adg: { enabled: false }, // Future feature
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
  }
};

/**
 * Feature flag groups for easier management
 */
const featureGroups = {
  authentication: ['googleSignIn', 'appleSignIn', 'biometricAuth'],
  video: ['videoQuestions', 'videoAnalytics', 'videoDownload'],
  courseManagement: ['assignments', 'tests', 'notes'],
  ui: ['darkMode', 'customThemes', 'bannerCarousel'],
  analytics: ['analytics', 'crashReporting'],
  social: ['socialSharing'],
  experimental: ['aiChatbot', 'voiceNotes'],
  platform: ['pushNotifications', 'biometricAuth']
};

/**
 * Environment-based feature overrides
 * These can override client-specific settings in different environments
 */
const environmentOverrides = {
  development: {
    // Enable all features in development for testing
    analytics: { enabled: true },
    crashReporting: { enabled: false }, // Disable crash reporting in dev
  },
  preview: {
    // Preview builds might have experimental features enabled
    aiChatbot: { enabled: true },
    voiceNotes: { enabled: true }
  },
  staging: {
    // Staging should mirror production but might have some test features
    analytics: { enabled: true },
    crashReporting: { enabled: true }
  },
  production: {
    // Production uses client-specific settings only
    // No overrides unless critical
  }
};

module.exports = {
  featureFlags,
  featureGroups,
  environmentOverrides
};

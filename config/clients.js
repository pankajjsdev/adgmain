/**
 * Multi-tenant client configurations
 * Each client has their own branding, API endpoints, and app store identifiers
 */

const clients = {
  // Default/Main client (ADG Classes)
  adg: {
    name: 'ADG Classes',
    slug: 'adgclasses',
    displayName: 'ADG Classes',
    description: 'Advanced Digital Growth Classes - Learn, Grow, Succeed',
    
    // App Store Identifiers
    bundleIdentifier: 'com.adg.classes',
    androidPackage: 'com.adg.classes',
    
    // Branding
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
      // Theme specific colors
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
    
    // API Configuration
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
    
    // Assets paths
    assets: {
      icon: './assets/clients/adg/icon.png',
      adaptiveIcon: './assets/clients/adg/adaptive-icon.png',
      splash: './assets/clients/adg/splash-icon.png',
      logo: './assets/clients/adg/logo.png',
      favicon: './assets/clients/adg/favicon.png'
    },
    
    // App Store Configuration
    appStore: {
      appleId: '1234567890', // Replace with actual Apple ID
      googlePlayId: 'com.adg.classes' // Same as androidPackage
    },
    
    // Feature flags
    features: {
      analytics: true,
      pushNotifications: true,
      socialLogin: true,
      darkMode: true,
      biometricAuth: true
    },
    
    // Contact & Support
    contact: {
      email: 'support@adgclasses.com',
      phone: '+1-800-ADG-HELP',
      website: 'https://adgclasses.com',
      privacyPolicy: 'https://adgclasses.com/privacy',
      termsOfService: 'https://adgclasses.com/terms'
    }
  },

  // Example Client 1 - TechEdu
  techedu: {
    name: 'TechEdu Pro',
    slug: 'techedu-pro',
    displayName: 'TechEdu Pro',
    description: 'Professional Technology Education Platform',
    
    bundleIdentifier: 'com.techedu.pro',
    androidPackage: 'com.techedu.pro',
    
    colors: {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      accent: '#FD79A8',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#2D3436',
      textSecondary: '#636E72',
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#E17055',
      light: {
        primary: '#6C5CE7',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: '#2D3436',
        textSecondary: '#636E72',
      },
      dark: {
        primary: '#A29BFE',
        background: '#2D3436',
        surface: '#636E72',
        text: '#DDD6FE',
        textSecondary: '#B2BEC3',
      }
    },
    
    api: {
      baseUrl: 'https://api.techedu.pro',
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
    
    assets: {
      icon: './assets/clients/techedu/icon.png',
      adaptiveIcon: './assets/clients/techedu/adaptive-icon.png',
      splash: './assets/clients/techedu/splash-icon.png',
      logo: './assets/clients/techedu/logo.png',
      favicon: './assets/clients/techedu/favicon.png'
    },
    
    appStore: {
      appleId: '2345678901',
      googlePlayId: 'com.techedu.pro'
    },
    
    features: {
      analytics: true,
      pushNotifications: true,
      socialLogin: false,
      darkMode: true,
      biometricAuth: false
    },
    
    contact: {
      email: 'support@techedu.pro',
      phone: '+1-800-TECH-EDU',
      website: 'https://techedu.pro',
      privacyPolicy: 'https://techedu.pro/privacy',
      termsOfService: 'https://techedu.pro/terms'
    }
  },

  // Example Client 2 - SkillBoost
  skillboost: {
    name: 'SkillBoost Academy',
    slug: 'skillboost-academy',
    displayName: 'SkillBoost Academy',
    description: 'Boost Your Skills with Expert-Led Courses',
    
    bundleIdentifier: 'com.skillboost.academy',
    androidPackage: 'com.skillboost.academy',
    
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
      background: '#FFFFFF',
      surface: '#F7F9FC',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      success: '#2ECC71',
      warning: '#F39C12',
      error: '#E74C3C',
      light: {
        primary: '#FF6B6B',
        background: '#FFFFFF',
        surface: '#F7F9FC',
        text: '#2C3E50',
        textSecondary: '#7F8C8D',
      },
      dark: {
        primary: '#FF8A80',
        background: '#1A252F',
        surface: '#2C3E50',
        text: '#ECF0F1',
        textSecondary: '#BDC3C7',
      }
    },
    
    api: {
      baseUrl: 'https://api.skillboost.academy',
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
    
    assets: {
      icon: './assets/clients/skillboost/icon.png',
      adaptiveIcon: './assets/clients/skillboost/adaptive-icon.png',
      splash: './assets/clients/skillboost/splash-icon.png',
      logo: './assets/clients/skillboost/logo.png',
      favicon: './assets/clients/skillboost/favicon.png'
    },
    
    appStore: {
      appleId: '3456789012',
      googlePlayId: 'com.skillboost.academy'
    },
    
    features: {
      analytics: true,
      pushNotifications: true,
      socialLogin: true,
      darkMode: true,
      biometricAuth: true
    },
    
    contact: {
      email: 'hello@skillboost.academy',
      phone: '+1-800-SKILL-UP',
      website: 'https://skillboost.academy',
      privacyPolicy: 'https://skillboost.academy/privacy',
      termsOfService: 'https://skillboost.academy/terms'
    }
  }
};

/**
 * Get client configuration by name
 * @param {string} clientName - The client identifier
 * @returns {object} Client configuration object
 */
const getClientConfig = (clientName = 'adg') => {
  const config = clients[clientName];
  if (!config) {
    console.warn(`Client configuration for '${clientName}' not found. Using default 'adg' configuration.`);
    return clients.adg;
  }
  return config;
};

/**
 * Get all available client names
 * @returns {string[]} Array of client identifiers
 */
const getAvailableClients = () => {
  return Object.keys(clients);
};

/**
 * Validate client configuration
 * @param {string} clientName - The client identifier to validate
 * @returns {boolean} True if configuration is valid
 */
const validateClientConfig = (clientName) => {
  const config = clients[clientName];
  if (!config) return false;
  
  // Check required fields
  const requiredFields = ['name', 'bundleIdentifier', 'androidPackage', 'api', 'assets'];
  return requiredFields.every(field => config[field]);
};

module.exports = {
  clients,
  getClientConfig,
  getAvailableClients,
  validateClientConfig
};

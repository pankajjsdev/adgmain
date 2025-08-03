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
      baseUrl: 'https://api.closm.com/api',
      version: 'v1',
      timeout: 30000,
      vendorCode: 'adg',
      countryCode: 'IN',
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

    // Google OAuth Configuration
    googleAuth: {
      webClientId: 'YOUR_ADG_WEB_CLIENT_ID.apps.googleusercontent.com',
      iosClientId: 'YOUR_ADG_IOS_CLIENT_ID.apps.googleusercontent.com',
      androidClientId: 'YOUR_ADG_ANDROID_CLIENT_ID.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      hostedDomain: null
    },

    // Features
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
    },

    // Onboarding & UI Configuration
    onboarding: {
      enabled: true,
      screens: [
        {
          id: 'welcome',
          title: 'Welcome to ADG Classes',
          subtitle: 'Your premier destination for quality education',
          description: 'Join thousands of students who have transformed their careers with our comprehensive courses.',
          image: 'onboarding-welcome.png',
          backgroundColor: '#007AFF',
          textColor: '#FFFFFF'
        },
        {
          id: 'features',
          title: 'Learn at Your Pace',
          subtitle: 'Flexible learning designed for you',
          description: 'Access courses anytime, anywhere. Learn from industry experts with our interactive content.',
          image: 'onboarding-features.png',
          backgroundColor: '#34C759',
          textColor: '#FFFFFF'
        },
        {
          id: 'community',
          title: 'Join Our Community',
          subtitle: 'Connect with fellow learners',
          description: 'Be part of a vibrant learning community. Share knowledge and grow together.',
          image: 'onboarding-community.png',
          backgroundColor: '#FF9500',
          textColor: '#FFFFFF'
        }
      ],
      skipEnabled: true,
      showProgress: true
    },

    // Splash Screen Configuration
    splash: {
      backgroundColor: '#007AFF',
      logoImage: 'splash-logo.png',
      brandText: 'ADG Classes',
      tagline: 'Excellence in Education',
      showBrandText: true,
      showTagline: true,
      animationType: 'fade', // 'fade', 'slide', 'bounce'
      duration: 2000
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
      vendorCode: 'techedu',
      countryCode: 'IN',
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
      vendorCode: 'skillboost',
      countryCode: 'IN',
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
  },

  // Example Client 4 - EduTech Solutions
  edutech: {
    name: 'EduTech Solutions',
    slug: 'edutech-solutions',
    displayName: 'EduTech Solutions',
    description: 'Innovative Educational Technology Solutions',
    bundleIdentifier: 'com.edutech.solutions',
    androidPackage: 'com.edutech.solutions',
    colors: {
      primary: '#2E7D32',
      secondary: '#4CAF50',
      accent: '#8BC34A',
      background: '#FFFFFF',
      surface: '#F1F8E9',
      text: '#1B5E20',
      textSecondary: '#388E3C',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      light: {
        primary: '#2E7D32',
        background: '#FFFFFF',
        surface: '#F1F8E9',
        text: '#1B5E20',
        textSecondary: '#388E3C',
      },
      dark: {
        primary: '#4CAF50',
        background: '#0D1B0F',
        surface: '#1B5E20',
        text: '#C8E6C9',
        textSecondary: '#81C784',
      }
    },
    api: {
      baseUrl: 'https://api.edutech-solutions.com',
      version: 'v1',
      timeout: 30000,
      vendorCode: 'edutech',
      countryCode: 'IN',
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
      icon: './assets/clients/edutech/icon.png',
      adaptiveIcon: './assets/clients/edutech/adaptive-icon.png',
      splash: './assets/clients/edutech/splash-icon.png',
      logo: './assets/clients/edutech/logo.png',
      favicon: './assets/clients/edutech/favicon.png'
    },
    appStore: {
      appleId: '4567890123',
      googlePlayId: 'com.edutech.solutions'
    },
    features: {
      analytics: true,
      pushNotifications: true,
      socialLogin: true,
      darkMode: true,
      biometricAuth: true
    },
    contact: {
      email: 'support@edutech-solutions.com',
      phone: '+1-800-EDU-TECH',
      website: 'https://edutech-solutions.com',
      privacyPolicy: 'https://edutech-solutions.com/privacy',
      termsOfService: 'https://edutech-solutions.com/terms'
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

# How to Create Multiple Client Configurations

This guide explains step-by-step how to create multiple client configurations in the multi-tenant system.

## 🎯 Overview

The multi-tenant system allows you to create unlimited client configurations, each with their own:
- **App Name & Branding** (colors, logos, icons)
- **Bundle Identifiers** (iOS Bundle ID, Android Package)
- **API Endpoints** (different backend servers)
- **Feature Flags** (enable/disable features per client)
- **Contact Information** (support emails, websites)
- **App Store Configurations** (Apple ID, Google Play ID)

## 📋 Step-by-Step Process

### Step 1: Add Client Configuration

Edit `config/clients.js` and add your new client to the `clients` object:

```javascript
const clients = {
  // ... existing clients (adg, techedu, skillboost, edutech)
  
  // Your New Client
  yourclient: {
    name: 'Your Client Name',
    slug: 'your-client-slug',
    displayName: 'Your Client Display Name',
    description: 'Description of your client app',
    
    // App Store Identifiers (MUST BE UNIQUE)
    bundleIdentifier: 'com.yourclient.app',
    androidPackage: 'com.yourclient.app',
    
    // Branding Colors
    colors: {
      primary: '#YOUR_PRIMARY_COLOR',
      secondary: '#YOUR_SECONDARY_COLOR',
      accent: '#YOUR_ACCENT_COLOR',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      
      // Light Theme Colors
      light: {
        primary: '#YOUR_PRIMARY_COLOR',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#000000',
        textSecondary: '#666666',
      },
      
      // Dark Theme Colors
      dark: {
        primary: '#YOUR_PRIMARY_COLOR_DARK',
        background: '#121212',
        surface: '#1E1E1E',
        text: '#FFFFFF',
        textSecondary: '#AAAAAA',
      }
    },
    
    // API Configuration
    api: {
      baseUrl: 'https://api.yourclient.com',
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
    
    // Asset Paths
    assets: {
      icon: './assets/clients/yourclient/icon.png',
      adaptiveIcon: './assets/clients/yourclient/adaptive-icon.png',
      splash: './assets/clients/yourclient/splash-icon.png',
      logo: './assets/clients/yourclient/logo.png',
      favicon: './assets/clients/yourclient/favicon.png'
    },
    
    // App Store Configuration
    appStore: {
      appleId: 'YOUR_APPLE_ID',
      googlePlayId: 'com.yourclient.app'
    },
    
    // Feature Flags
    features: {
      analytics: true,
      pushNotifications: true,
      socialLogin: false,
      darkMode: true,
      biometricAuth: true
    },
    
    // Contact Information
    contact: {
      email: 'support@yourclient.com',
      phone: '+1-800-YOUR-NUM',
      website: 'https://yourclient.com',
      privacyPolicy: 'https://yourclient.com/privacy',
      termsOfService: 'https://yourclient.com/terms'
    }
  }
};
```

### Step 2: Create Asset Directory

Create a directory for your client's assets:

```bash
mkdir -p assets/clients/yourclient
```

Add these required assets to `assets/clients/yourclient/`:
- `icon.png` - App icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `splash-icon.png` - Splash screen icon (400x400)
- `logo.png` - App logo for UI
- `favicon.png` - Web favicon (32x32)

### Step 3: Add EAS Build Profiles

Edit `eas.json` and add build profiles for your client:

```json
{
  "build": {
    "yourclient-dev": {
      "extends": "development",
      "env": {
        "APP_VARIANT": "development",
        "CLIENT_NAME": "yourclient"
      }
    },
    "yourclient-preview": {
      "extends": "preview",
      "env": {
        "APP_VARIANT": "preview",
        "CLIENT_NAME": "yourclient"
      }
    },
    "yourclient-production": {
      "extends": "production",
      "env": {
        "APP_VARIANT": "production",
        "CLIENT_NAME": "yourclient"
      }
    }
  },
  "submit": {
    "yourclient-production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APPLE_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### Step 4: Add NPM Scripts

Edit `package.json` and add scripts for your client:

```json
{
  "scripts": {
    // Build Scripts
    "build:yourclient:dev": "node scripts/build-client.js yourclient development",
    "build:yourclient:preview": "node scripts/build-client.js yourclient preview",
    "build:yourclient:prod": "node scripts/build-client.js yourclient production",
    
    // Deployment Scripts
    "deploy:yourclient": "node scripts/deploy-client.js yourclient",
    "deploy:yourclient:ios": "node scripts/deploy-client.js yourclient ios",
    "deploy:yourclient:android": "node scripts/deploy-client.js yourclient android",
    
    // Development Script
    "dev:yourclient": "CLIENT_NAME=yourclient APP_VARIANT=development expo start"
  }
}
```

### Step 5: Test Your Configuration

1. **Validate Configuration**:
   ```bash
   npm run validate:client yourclient
   ```

2. **List All Clients**:
   ```bash
   npm run list:clients
   ```

3. **Test Development**:
   ```bash
   npm run dev:yourclient
   ```

## 🚀 Current Available Clients

1. **ADG Classes** (`adg`) - Blue theme (#007AFF)
2. **TechEdu Pro** (`techedu`) - Purple theme (#6C5CE7)
3. **SkillBoost Academy** (`skillboost`) - Red/Teal theme (#FF6B6B)
4. **EduTech Solutions** (`edutech`) - Green theme (#2E7D32) ✨ NEW!

## 🎨 Usage Examples

### Development Commands
```bash
npm run dev:adg          # ADG Classes (Blue theme)
npm run dev:techedu      # TechEdu Pro (Purple theme)
npm run dev:skillboost   # SkillBoost (Red theme)
npm run dev:edutech      # EduTech (Green theme)
```

### Build Commands
```bash
npm run build:adg:prod
npm run build:techedu:prod
npm run build:skillboost:prod
npm run build:edutech:prod
```

### Deployment Commands
```bash
npm run deploy:adg
npm run deploy:techedu
npm run deploy:skillboost
npm run deploy:edutech
```

## 🔧 Key Benefits

- ✅ **Single Codebase**: One codebase generates unlimited branded apps
- ✅ **Unique Branding**: Each client has their own colors, logos, and identity
- ✅ **Separate APIs**: Each client can use different backend servers
- ✅ **Feature Control**: Enable/disable features per client
- ✅ **App Store Ready**: Direct submission to iOS and Android stores
- ✅ **Easy Scaling**: Add new clients by extending configuration

Your multi-tenant system now supports unlimited client configurations! 🚀

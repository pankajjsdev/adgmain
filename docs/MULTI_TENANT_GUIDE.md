# Multi-Tenant (White-Label) App Architecture Guide

This guide explains how to use the multi-tenant architecture to generate separate branded apps for different clients from a single codebase.

## 🏗️ Architecture Overview

The multi-tenant system allows you to:
- Generate separate branded apps for different clients
- Customize app names, logos, colors, API endpoints, and store identifiers
- Publish unique apps to Play Store and App Store
- Maintain a single codebase for all clients

## 📁 Project Structure

```
├── config/
│   └── clients.js              # Client configurations
├── assets/
│   └── clients/
│       ├── adg/               # ADG Classes assets
│       ├── techedu/           # TechEdu Pro assets
│       └── skillboost/        # SkillBoost Academy assets
├── scripts/
│   ├── build-client.js        # Build script for specific clients
│   ├── deploy-client.js       # Deployment script
│   └── package-scripts.json   # NPM script templates
├── utils/
│   └── clientConfig.ts        # Runtime client configuration utility
├── app.config.js              # Dynamic Expo configuration
├── eas.json                   # EAS build profiles for all clients
└── constants/
    └── Colors.ts              # Multi-tenant color system
```

## 🎨 Client Configuration

### Adding a New Client

1. **Update `config/clients.js`**:
```javascript
newclient: {
  name: 'New Client App',
  slug: 'newclient-app',
  displayName: 'New Client App',
  description: 'Description for the new client app',
  
  // App Store Identifiers
  bundleIdentifier: 'com.newclient.app',
  androidPackage: 'com.newclient.app',
  
  // Branding Colors
  colors: {
    primary: '#YOUR_PRIMARY_COLOR',
    secondary: '#YOUR_SECONDARY_COLOR',
    // ... other colors
  },
  
  // API Configuration
  api: {
    baseUrl: 'https://api.newclient.com',
    // ... other API settings
  },
  
  // Assets
  assets: {
    icon: './assets/clients/newclient/icon.png',
    adaptiveIcon: './assets/clients/newclient/adaptive-icon.png',
    splash: './assets/clients/newclient/splash-icon.png',
    logo: './assets/clients/newclient/logo.png',
    favicon: './assets/clients/newclient/favicon.png'
  },
  
  // ... other configurations
}
```

2. **Create Asset Directory**:
```bash
mkdir -p assets/clients/newclient
# Add your client-specific assets (icon.png, splash-icon.png, etc.)
```

3. **Update EAS Configuration** in `eas.json`:
```json
{
  "build": {
    "newclient-dev": {
      "extends": "development",
      "env": {
        "APP_VARIANT": "development",
        "CLIENT_NAME": "newclient"
      }
    },
    "newclient-production": {
      "extends": "production",
      "env": {
        "APP_VARIANT": "production",
        "CLIENT_NAME": "newclient"
      }
    }
  }
}
```

## 🚀 Building and Deploying

### Development

Run the app locally for a specific client:
```bash
# ADG Classes
npm run dev:adg

# TechEdu Pro
npm run dev:techedu

# SkillBoost Academy
npm run dev:skillboost
```

### Building for Production

Build a specific client app:
```bash
# Build ADG Classes for production
npm run build:adg:prod

# Build TechEdu Pro for development
npm run build:techedu:dev

# Build SkillBoost Academy for preview
npm run build:skillboost:preview
```

### Manual Build Commands

```bash
# Build specific client and variant
node scripts/build-client.js [client] [variant] [platform]

# Examples:
node scripts/build-client.js adg production ios
node scripts/build-client.js techedu development android
node scripts/build-client.js skillboost preview all
```

### Deploying to App Stores

```bash
# Deploy to both iOS and Android
npm run deploy:adg

# Deploy to specific platform
npm run deploy:techedu:ios
npm run deploy:skillboost:android

# Manual deployment
node scripts/deploy-client.js [client] [platform]
```

## 🎯 Available Clients

### 1. ADG Classes (Default)
- **Client ID**: `adg`
- **Bundle ID**: `com.adg.classes`
- **Colors**: Blue theme (#007AFF primary)
- **API**: `https://api.adgclasses.com`

### 2. TechEdu Pro
- **Client ID**: `techedu`
- **Bundle ID**: `com.techedu.pro`
- **Colors**: Purple theme (#6C5CE7 primary)
- **API**: `https://api.techedu.pro`

### 3. SkillBoost Academy
- **Client ID**: `skillboost`
- **Bundle ID**: `com.skillboost.academy`
- **Colors**: Red/Teal theme (#FF6B6B primary)
- **API**: `https://api.skillboost.academy`

## 🔧 Environment Variables

The system uses these environment variables for build-time configuration:

- `CLIENT_NAME`: Determines which client configuration to use
- `APP_VARIANT`: Determines the build variant (development, preview, staging, production)
- `EAS_PROJECT_ID`: Your EAS project ID

## 📱 Runtime Configuration

### Accessing Client Config in Code

```typescript
import { 
  getClientConfig, 
  getClientName, 
  getThemeColors, 
  getApiConfig,
  isFeatureEnabled 
} from '@/utils/clientConfig';

// Get current client configuration
const config = getClientConfig();
console.log(config.displayName); // "ADG Classes"

// Get theme colors
const colors = getThemeColors('light');
console.log(colors.primary); // "#007AFF"

// Get API configuration
const apiConfig = getApiConfig();
console.log(apiConfig.baseUrl); // "https://api.adgclasses.com"

// Check feature flags
if (isFeatureEnabled('socialLogin')) {
  // Show social login options
}
```

### Using in Components

```typescript
import { useColorScheme } from 'react-native';
import { getThemeColors } from '@/utils/clientConfig';

export default function MyComponent() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme ?? 'light');
  
  return (
    <View style={{ backgroundColor: colors.primary }}>
      <Text style={{ color: colors.text }}>
        Hello from {getClientConfig().displayName}!
      </Text>
    </View>
  );
}
```

## 🛠️ Utility Commands

```bash
# List all available clients
npm run list:clients

# Validate a client configuration
npm run validate:client adg

# Check current configuration (in development)
node -e "require('./utils/clientConfig').logCurrentConfig()"
```

## 📋 Build Profiles

Each client has multiple build profiles:

### Development Profiles
- `adg-dev`, `techedu-dev`, `skillboost-dev`
- For development and testing
- Includes development client
- App name suffix: "(Dev)"

### Preview Profiles
- `adg-preview`, `techedu-preview`, `skillboost-preview`
- For internal testing and demos
- App name suffix: "(Preview)"

### Production Profiles
- `adg-production`, `techedu-production`, `skillboost-production`
- For app store submission
- No app name suffix

## 🎨 Asset Requirements

For each client, provide these assets in `assets/clients/[client]/`:

### Required Assets
- `icon.png` - App icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon foreground (1024x1024)
- `splash-icon.png` - Splash screen icon (400x400 recommended)
- `logo.png` - App logo for use in UI
- `favicon.png` - Web favicon (32x32)

### Asset Guidelines
- Use PNG format for all assets
- Maintain consistent branding across all assets
- Follow platform-specific guidelines (iOS/Android)
- Test assets on different screen sizes and densities

## 🔐 App Store Configuration

### iOS App Store
1. Create separate App Store Connect entries for each client
2. Use unique bundle identifiers
3. Configure app metadata, screenshots, and descriptions
4. Set up App Store Connect API keys for automated submission

### Google Play Store
1. Create separate Google Play Console projects for each client
2. Use unique package names
3. Configure store listings with client-specific content
4. Set up Google Play Console API access for automated submission

## 🚨 Troubleshooting

### Common Issues

1. **Build fails with "Client configuration not found"**
   - Ensure `CLIENT_NAME` environment variable is set correctly
   - Verify client exists in `config/clients.js`

2. **Assets not found during build**
   - Check asset paths in client configuration
   - Ensure all required assets exist in the client's asset directory

3. **API calls failing**
   - Verify API base URL in client configuration
   - Check network connectivity and API endpoint availability

4. **Colors not updating**
   - Clear Metro cache: `npx expo start --clear`
   - Restart development server

### Debug Commands

```bash
# Check current client configuration
CLIENT_NAME=adg node -e "console.log(require('./utils/clientConfig').getClientConfig())"

# Validate all client configurations
node -e "const { getAvailableClients, validateClientConfig } = require('./config/clients'); getAvailableClients().forEach(c => console.log(c + ':', validateClientConfig(c)))"

# Test API configuration
CLIENT_NAME=techedu node -e "console.log(require('./utils/clientConfig').getApiConfig())"
```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Build Multi-Tenant Apps

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        client: [adg, techedu, skillboost]
        platform: [ios, android]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build ${{ matrix.client }} for ${{ matrix.platform }}
        run: node scripts/build-client.js ${{ matrix.client }} production ${{ matrix.platform }}
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## 📚 Best Practices

1. **Configuration Management**
   - Keep client configurations in version control
   - Use environment-specific API endpoints
   - Validate configurations before builds

2. **Asset Management**
   - Use consistent naming conventions
   - Optimize asset sizes for mobile
   - Test assets on various devices

3. **Build Management**
   - Use descriptive build profiles
   - Tag releases with client and version info
   - Maintain separate app store listings

4. **Testing**
   - Test each client configuration thoroughly
   - Verify API integrations for each client
   - Test on multiple devices and OS versions

## 🆘 Support

For issues with the multi-tenant system:

1. Check this documentation first
2. Validate your client configuration
3. Review build logs for specific errors
4. Test with a known working client (e.g., ADG)

---

**Happy building! 🚀**

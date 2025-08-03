# Client-Specific Branding Test Guide

This guide provides comprehensive instructions for testing the multi-tenant client branding features including onboarding screens, splash screens, app icons, and Google authentication.

## 🎯 Features Implemented

### 1. **Client-Specific Onboarding Screens**
- Unique onboarding flows per client with custom images, colors, and content
- Skip functionality and progress indicators
- Persistent completion tracking per client
- Client-specific branding and messaging

### 2. **Client-Specific Splash Screens**
- Animated logo and brand text with configurable animation types
- Client-specific background colors, logos, and taglines
- Multiple animation types: fade, bounce, slide
- Configurable duration and visibility settings

### 3. **Client-Specific Google Authentication**
- Separate Google OAuth credentials per client
- True multi-tenant isolation with different Google Cloud Console projects
- Client-specific vendor codes and domain restrictions
- Feature flag support to enable/disable per client

### 4. **App Initialization System**
- Seamless integration of splash and onboarding screens
- Intelligent flow control based on client configuration
- Persistent state management with AsyncStorage
- Utility functions for testing and debugging

## 🧪 Testing Components

### 1. **AppInitializer Component**
- **Location**: `components/AppInitializer.tsx`
- **Purpose**: Manages the app initialization flow (splash → onboarding → app)
- **Features**: 
  - Automatic state management
  - Client-specific flow control
  - Persistent completion tracking

### 2. **ClientBrandingTest Component**
- **Location**: `components/ClientBrandingTest.tsx`
- **Purpose**: Comprehensive test harness for all branding features
- **Features**:
  - Live client configuration display
  - Feature flag status
  - Onboarding reset utilities
  - Multi-client testing

### 3. **Test Screen**
- **Location**: `app/(tabs)/test-branding.tsx`
- **Purpose**: Dedicated screen for testing branding features
- **Access**: Available in the app's tab navigation

## 🚀 How to Test

### Step 1: Access the Test Screen
1. Run the app: `npm run dev:adg` (or any client variant)
2. Navigate to the "Test Branding" tab
3. Explore the current client configuration

### Step 2: Test Onboarding Screens
1. In the test screen, click "Reset Onboarding for [client]"
2. Restart the app or force refresh
3. You should see the client-specific onboarding screens
4. Test skip functionality and progress indicators
5. Complete onboarding and verify it doesn't show again

### Step 3: Test Splash Screens
1. Modify client configuration to enable splash screen
2. Set different animation types: 'fade', 'bounce', 'slide'
3. Restart the app to see the splash screen
4. Verify client-specific colors, logos, and animations

### Step 4: Test Different Clients
1. Build with different client configurations:
   ```bash
   npm run dev:adg      # ADG Classes
   npm run dev:techedu  # TechEdu Pro
   npm run dev:skillboost # SkillBoost Academy
   ```
2. Compare branding differences between clients
3. Verify each client has unique onboarding and splash screens

### Step 5: Test Google Authentication
1. Configure real Google OAuth credentials in `config/clients.js`
2. Test Google Sign-In on login and signup pages
3. Verify client-specific vendor codes are sent to API
4. Test with different Google accounts per client

## 🔧 Configuration Testing

### Client Configuration Structure
Each client in `config/clients.js` supports:

```javascript
{
  // Basic client info
  name: 'client-name',
  appName: 'Client App Name',
  colors: { primary: '#color', secondary: '#color' },
  
  // Onboarding configuration
  onboarding: {
    enabled: true,
    screens: [
      {
        id: 'screen1',
        title: 'Welcome',
        subtitle: 'Get Started',
        description: 'Description text',
        image: 'image-url',
        backgroundColor: '#color',
        textColor: '#color'
      }
    ]
  },
  
  // Splash screen configuration
  splash: {
    enabled: true,
    backgroundColor: '#color',
    logoImage: 'logo-url',
    brandText: 'Brand Name',
    tagline: 'Brand Tagline',
    animationType: 'fade', // 'fade', 'bounce', 'slide'
    duration: 2000,
    showBrandText: true,
    showTagline: true,
    textColor: '#color'
  },
  
  // Google OAuth configuration
  googleAuth: {
    webClientId: 'web-client-id',
    iosClientId: 'ios-client-id',
    androidClientId: 'android-client-id',
    scopes: ['profile', 'email'],
    hostedDomain: 'company.com' // optional
  }
}
```

### Testing Different Configurations
1. **Disable Features**: Set `enabled: false` for onboarding or splash
2. **Change Animation Types**: Test 'fade', 'bounce', 'slide' animations
3. **Modify Colors**: Update background and text colors
4. **Test Content**: Change titles, descriptions, and taglines
5. **Asset Testing**: Update logo and image URLs

## 🛠 Utility Functions

### AppInitializerUtils
Available utility functions for testing:

```typescript
import { AppInitializerUtils } from '@/components/AppInitializer';

// Reset onboarding for specific client
await AppInitializerUtils.resetOnboarding('adg');

// Reset all onboarding data
await AppInitializerUtils.resetAllOnboarding();

// Check onboarding status
const completed = await AppInitializerUtils.checkOnboardingStatus('adg');
```

### Manual Testing Commands
```bash
# Test different clients
npm run dev:adg
npm run dev:techedu
npm run dev:skillboost

# Build for testing
npm run build:adg:dev
npm run build:techedu:dev
npm run build:skillboost:dev

# Reset Metro cache if needed
npx expo start --clear
```

## 📱 Expected Behavior

### First App Launch (New User)
1. **Splash Screen** (if enabled): Shows client-specific animated splash
2. **Onboarding** (if enabled and not completed): Shows client-specific onboarding flow
3. **Main App**: User enters the main application

### Subsequent Launches (Returning User)
1. **Splash Screen** (if enabled): Shows client-specific animated splash
2. **Main App**: Directly enters main app (onboarding skipped)

### Different Clients
- Each client should have completely different branding
- Onboarding completion is tracked separately per client
- Google OAuth uses different credentials per client
- Colors, logos, and content are unique per client

## 🐛 Troubleshooting

### Common Issues
1. **Onboarding Not Showing**: Check if it's already completed, use reset function
2. **Splash Not Showing**: Verify `enabled: true` in client configuration
3. **Wrong Branding**: Ensure correct `CLIENT_NAME` environment variable
4. **Google Auth Errors**: Verify OAuth credentials are correctly configured

### Debug Steps
1. Check console logs for client configuration loading
2. Use the test screen to verify current client settings
3. Reset onboarding data if testing flow changes
4. Clear Metro cache and restart if configuration changes don't apply

## 🎨 Customization Examples

### ADG Classes (Blue Theme)
- Primary Color: #007AFF (Blue)
- Professional onboarding focused on academic excellence
- Clean, educational branding

### TechEdu Pro (Purple Theme)
- Primary Color: #6C5CE7 (Purple)
- Tech-focused onboarding with modern design
- Innovation and technology messaging

### SkillBoost Academy (Red/Teal Theme)
- Primary Color: #FF6B6B (Red)
- Skill development focused onboarding
- Dynamic, energetic branding

## ✅ Test Checklist

- [ ] Splash screen shows with correct client branding
- [ ] Onboarding screens display client-specific content
- [ ] Onboarding completion is tracked per client
- [ ] Different clients show different branding
- [ ] Google Sign-In uses client-specific credentials
- [ ] Feature flags work correctly per client
- [ ] App initialization flow works seamlessly
- [ ] Reset utilities function properly
- [ ] Asset directories are organized per client
- [ ] Configuration changes apply correctly

## 🚀 Production Deployment

Before deploying to production:
1. Replace placeholder Google OAuth credentials with real ones
2. Update asset URLs to point to production CDN
3. Test all clients with real Google accounts
4. Verify app store assets (icons, splash screens) are client-specific
5. Test the complete user journey for each client

This comprehensive branding system now provides true multi-tenant capabilities with complete client isolation and unique user experiences for each branded app.

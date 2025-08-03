# Feature Flags System Guide

A comprehensive feature flag system that enables/disables features based on client configuration, app version, platform, and environment. This system integrates seamlessly with the multi-tenant architecture to provide granular feature control.

## 🎯 Overview

The feature flag system consists of:
- **Configuration Layer**: Define features with client/version/platform constraints
- **Utility Layer**: Core logic for feature checking and validation
- **React Layer**: Hooks and components for easy integration
- **Integration Layer**: Seamless integration with multi-tenant system

## 🏗️ Architecture

### 1. Feature Flag Configuration (`config/featureFlags.js`)
```javascript
const featureFlags = {
  featureName: {
    description: 'Feature description',
    defaultEnabled: boolean,
    clients: {
      clientName: {
        enabled: boolean,
        minVersion: 'semver',
        maxVersion: 'semver',
        platforms: ['ios', 'android', 'web']
      }
    }
  }
}
```

### 2. Feature Flag Utility (`utils/featureFlags.ts`)
- `FeatureFlagManager`: Singleton class managing all feature flag logic
- Version constraint checking with semantic versioning
- Platform and environment-based overrides
- Context management and debugging utilities

### 3. React Hooks (`hooks/useFeatureFlags.ts`)
- `useFeatureFlag`: Check single feature
- `useFeatureFlags`: Check multiple features
- `useFeatureGroup`: Check feature groups
- `useFeatureGate`: Conditional rendering hook

### 4. React Components (`components/FeatureFlag.tsx`)
- `FeatureGate`: Conditional rendering component
- `MultiFeatureGate`: Multiple feature conditions
- `FeatureGroupGate`: Feature group conditions
- `FeatureDebugPanel`: Development debugging

## 🚀 Quick Start

### Basic Usage

```typescript
import { isFeatureEnabled } from '@/utils/featureFlags';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { FeatureGate } from '@/components/FeatureFlag';

// 1. Simple boolean check
const hasGoogleAuth = isFeatureEnabled('googleSignIn');

// 2. React hook with detailed result
function MyComponent() {
  const { enabled, result } = useFeatureFlag('videoQuestions');
  
  return (
    <View>
      {enabled && <VideoQuestionButton />}
    </View>
  );
}

// 3. Declarative component
function App() {
  return (
    <FeatureGate feature="darkMode">
      <DarkModeToggle />
    </FeatureGate>
  );
}
```

### Advanced Usage

```typescript
// Check multiple features
const authFeatures = useFeatureFlags(['googleSignIn', 'appleSignIn']);

// Check feature groups
const videoFeatures = useFeatureGroup('video');

// Custom context
const customEnabled = isFeatureEnabled('aiChatbot', {
  clientName: 'techedu',
  appVersion: '2.0.0',
  platform: 'ios'
});

// Conditional rendering with fallback
<FeatureGate 
  feature="socialSharing" 
  fallback={<Text>Feature not available</Text>}
>
  <SocialShareButton />
</FeatureGate>
```

## 📋 Available Features

### Authentication Features
- `googleSignIn`: Google Sign-In authentication
- `appleSignIn`: Apple Sign-In authentication (iOS only)
- `biometricAuth`: Biometric authentication (Face ID, Touch ID)

### Video Features
- `videoQuestions`: Interactive video questions
- `videoAnalytics`: Video watching analytics
- `videoDownload`: Offline video downloads

### Course Management Features
- `assignments`: Assignment submission system
- `tests`: Test taking system
- `notes`: Course notes system

### UI Features
- `darkMode`: Dark mode theme support
- `customThemes`: Custom theme selection
- `bannerCarousel`: Home page banner carousel

### Analytics Features
- `analytics`: User behavior analytics
- `crashReporting`: Automatic crash reporting

### Social Features
- `socialSharing`: Share courses and achievements

### Experimental Features
- `aiChatbot`: AI-powered course assistance
- `voiceNotes`: Voice note recording

### Platform Features
- `pushNotifications`: Push notification system
- `biometricAuth`: Biometric authentication

## 🎛️ Feature Groups

Features are organized into logical groups for easier management:

```typescript
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
```

## 🏢 Client-Specific Configuration

Each client can have different feature availability:

### ADG Classes (Default)
- All core features enabled
- Conservative approach to experimental features
- Full analytics and crash reporting

### TechEdu Pro
- Advanced features like AI chatbot
- Voice notes for professional courses
- Enhanced video analytics

### SkillBoost Academy
- Focus on social features
- Gamification elements
- Custom themes

### EduTech Solutions
- Enterprise features
- Advanced analytics
- Biometric authentication

## 📱 Version and Platform Constraints

### Version Constraints
```javascript
{
  minVersion: '1.2.0', // Requires version 1.2.0 or higher
  maxVersion: '2.0.0'  // Requires version 2.0.0 or lower
}
```

### Platform Constraints
```javascript
{
  platforms: ['ios', 'android'] // Only available on mobile
}
```

## 🌍 Environment Overrides

Different environments can override feature settings:

```javascript
const environmentOverrides = {
  development: {
    analytics: { enabled: true },
    crashReporting: { enabled: false }
  },
  preview: {
    aiChatbot: { enabled: true },
    voiceNotes: { enabled: true }
  },
  production: {
    // Uses client-specific settings only
  }
};
```

## 🔧 Integration Examples

### 1. Authentication Screen
```typescript
import { useAuthFeatures } from '@/hooks/useFeatureFlags';

function LoginScreen() {
  const authFeatures = useAuthFeatures();
  
  return (
    <View>
      <EmailLoginForm />
      
      {authFeatures.googleSignIn && (
        <GoogleSignInButton />
      )}
      
      {authFeatures.appleSignIn && Platform.OS === 'ios' && (
        <AppleSignInButton />
      )}
      
      {authFeatures.biometricAuth && (
        <BiometricAuthButton />
      )}
    </View>
  );
}
```

### 2. Video Player
```typescript
import { useVideoFeatures } from '@/hooks/useFeatureFlags';

function VideoPlayer({ videoId }) {
  const videoFeatures = useVideoFeatures();
  
  return (
    <View>
      <VideoPlayerCore videoId={videoId} />
      
      <FeatureGate feature="videoQuestions">
        <VideoQuestionOverlay videoId={videoId} />
      </FeatureGate>
      
      {videoFeatures.videoDownload && (
        <DownloadButton videoId={videoId} />
      )}
      
      {videoFeatures.videoAnalytics && (
        <VideoAnalyticsTracker videoId={videoId} />
      )}
    </View>
  );
}
```

### 3. Settings Screen
```typescript
import { useUIFeatures, useExperimentalFeatures } from '@/hooks/useFeatureFlags';

function SettingsScreen() {
  const uiFeatures = useUIFeatures();
  const experimentalFeatures = useExperimentalFeatures();
  
  return (
    <ScrollView>
      {uiFeatures.darkMode && (
        <SettingsItem title="Dark Mode" component={<DarkModeToggle />} />
      )}
      
      {uiFeatures.customThemes && (
        <SettingsItem title="Themes" component={<ThemeSelector />} />
      )}
      
      <FeatureGate feature="pushNotifications">
        <SettingsItem title="Notifications" component={<NotificationSettings />} />
      </FeatureGate>
      
      {experimentalFeatures.aiChatbot && (
        <SettingsSection title="Experimental">
          <SettingsItem title="AI Assistant" component={<AISettings />} />
        </SettingsSection>
      )}
    </ScrollView>
  );
}
```

## 🐛 Debugging

### Development Debug Panel
```typescript
import { FeatureDebugPanel } from '@/components/FeatureFlag';

function App() {
  return (
    <View>
      <YourApp />
      
      {/* Only shows in development */}
      <FeatureDebugPanel 
        features={['googleSignIn', 'darkMode', 'aiChatbot']}
        groups={['authentication', 'video']}
      />
    </View>
  );
}
```

### Console Debugging
```typescript
import { debugFeatureFlags } from '@/utils/featureFlags';

// Log all feature flag information
debugFeatureFlags();
```

### Hook Debugging
```typescript
import { useFeatureFlagDebug } from '@/hooks/useFeatureFlags';

function DebugComponent() {
  const { debugInfo, logDebugInfo } = useFeatureFlagDebug();
  
  useEffect(() => {
    logDebugInfo(); // Logs debug info to console
  }, []);
  
  return null;
}
```

## 🔄 Adding New Features

### 1. Add to Configuration
```javascript
// config/featureFlags.js
newFeature: {
  description: 'Description of the new feature',
  defaultEnabled: false,
  clients: {
    adg: { enabled: true, minVersion: '1.5.0' },
    techedu: { enabled: true, minVersion: '1.3.0' },
    skillboost: { enabled: false },
    edutech: { enabled: true, minVersion: '2.0.0' }
  }
}
```

### 2. Add to Feature Group (Optional)
```javascript
// config/featureFlags.js
const featureGroups = {
  // ... existing groups
  newCategory: ['newFeature', 'relatedFeature']
};
```

### 3. Use in Components
```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const { enabled } = useFeatureFlag('newFeature');
  
  return (
    <View>
      {enabled && <NewFeatureComponent />}
    </View>
  );
}
```

## 🚀 Best Practices

### 1. Feature Naming
- Use camelCase for feature names
- Be descriptive but concise
- Group related features with common prefixes

### 2. Version Management
- Use semantic versioning (major.minor.patch)
- Be conservative with version requirements
- Test thoroughly before enabling in production

### 3. Client Configuration
- Start with features disabled for new clients
- Enable gradually based on client needs
- Document client-specific requirements

### 4. Performance
- Feature flag checks are lightweight
- Use hooks for reactive updates
- Avoid excessive feature flag checks in render loops

### 5. Testing
- Test with different client configurations
- Verify version constraints work correctly
- Test platform-specific features on target platforms

## 🔒 Security Considerations

- Feature flags are not security boundaries
- Sensitive features should have server-side validation
- Don't rely solely on client-side feature flags for access control
- Use environment overrides carefully in production

## 📦 Integration with Other Projects

To integrate this feature flag system into other projects:

### 1. Copy Core Files
```bash
# Copy configuration and utilities
cp config/featureFlags.js /path/to/new/project/config/
cp utils/featureFlags.ts /path/to/new/project/utils/
cp hooks/useFeatureFlags.ts /path/to/new/project/hooks/
cp components/FeatureFlag.tsx /path/to/new/project/components/
```

### 2. Install Dependencies
```bash
npm install expo-application
```

### 3. Update Client Configuration
- Modify `config/featureFlags.js` with your client configurations
- Update feature definitions based on your app's needs
- Adjust version constraints and platform requirements

### 4. Initialize in App
```typescript
// App.tsx or _layout.tsx
import { featureFlagManager } from '@/utils/featureFlags';

export default function App() {
  useEffect(() => {
    // Initialize feature flag context
    featureFlagManager.updateContext({
      clientName: 'your-client-name',
      appVersion: '1.0.0'
    });
  }, []);
  
  return <YourApp />;
}
```

## 🎉 Conclusion

This feature flag system provides:
- **Flexibility**: Enable/disable features per client, version, platform
- **Scalability**: Easy to add new features and clients
- **Developer Experience**: Simple APIs, React hooks, and components
- **Debugging**: Comprehensive debugging tools for development
- **Production Ready**: Environment overrides and performance optimized

The system integrates seamlessly with your multi-tenant architecture and provides a solid foundation for feature management across multiple clients and app versions.

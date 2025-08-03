# Feature Flag Integration Checklist

## ✅ System Setup Complete
- [x] Feature flag configuration (config/featureFlags.js)
- [x] Core utilities (utils/featureFlags.ts)
- [x] React hooks (hooks/useFeatureFlags.ts)
- [x] React components (components/FeatureFlag.tsx)
- [x] Documentation (docs/FEATURE_FLAGS_GUIDE.md)

## 🔧 Integration Steps

### 1. Initialize in App Root
Add to your main App component or _layout.tsx:

```typescript
import { featureFlagManager } from '@/utils/featureFlags';

export default function App() {
  useEffect(() => {
    // Initialize with current client context
    featureFlagManager.updateContext({
      clientName: process.env.EXPO_PUBLIC_CLIENT_NAME || 'adg'
    });
  }, []);
  
  return <YourApp />;
}
```

### 2. Update Existing Components

#### Authentication Components

// Add to your component imports
import { useFeatureFlag, useFeatureFlags, useAuthFeatures } from '@/hooks/useFeatureFlags';

// In your component
function MyComponent() {
  const { enabled } = useFeatureFlag('featureName');
  const authFeatures = useAuthFeatures();
  
  return (
    <View>
      {enabled && <FeatureComponent />}
      {authFeatures.googleSignIn && <GoogleSignInButton />}
    </View>
  );
}


#### UI Components

// Add to your component imports
import { FeatureGate, MultiFeatureGate } from '@/components/FeatureFlag';

// In your JSX
<FeatureGate feature="featureName" fallback={<AlternativeComponent />}>
  <FeatureComponent />
</FeatureGate>

<MultiFeatureGate features={['feature1', 'feature2']} mode="any">
  <ConditionalComponent />
</MultiFeatureGate>


#### Utility Functions

// Add to your utility imports
import { isFeatureEnabled, checkFeature } from '@/utils/featureFlags';

// In your functions
function myFunction() {
  if (isFeatureEnabled('featureName')) {
    // Feature-specific logic
  }
  
  const result = checkFeature('featureName');
  if (result.enabled) {
    console.log('Feature enabled:', result.reason);
  }
}


### 3. Common Integration Patterns

#### Login Screen
```typescript
import { useAuthFeatures } from '@/hooks/useFeatureFlags';

function LoginScreen() {
  const authFeatures = useAuthFeatures();
  
  return (
    <View>
      <EmailLoginForm />
      {authFeatures.googleSignIn && <GoogleSignInButton />}
      {authFeatures.appleSignIn && <AppleSignInButton />}
    </View>
  );
}
```

#### Settings Screen
```typescript
import { FeatureGate } from '@/components/FeatureFlag';

function SettingsScreen() {
  return (
    <ScrollView>
      <SettingsItem title="Profile" />
      
      <FeatureGate feature="darkMode">
        <SettingsItem title="Dark Mode" />
      </FeatureGate>
      
      <FeatureGate feature="pushNotifications">
        <SettingsItem title="Notifications" />
      </FeatureGate>
    </ScrollView>
  );
}
```

#### Video Player
```typescript
import { useVideoFeatures } from '@/hooks/useFeatureFlags';

function VideoPlayer({ videoId }) {
  const videoFeatures = useVideoFeatures();
  
  return (
    <View>
      <VideoPlayerCore />
      {videoFeatures.videoQuestions && <QuestionOverlay />}
      {videoFeatures.videoDownload && <DownloadButton />}
    </View>
  );
}
```

## 🧪 Testing Your Integration

### 1. Test Different Clients
```bash
# Test with different clients
EXPO_PUBLIC_CLIENT_NAME=adg npm start
EXPO_PUBLIC_CLIENT_NAME=techedu npm start
EXPO_PUBLIC_CLIENT_NAME=skillboost npm start
```

### 2. Test Different Versions
Update version in app.json or use environment variables:
```json
{
  "expo": {
    "version": "1.0.0"  // Try different versions
  }
}
```

### 3. Use Debug Components
Add to your development screens:
```typescript
import { FeatureDebugPanel } from '@/components/FeatureFlag';

<FeatureDebugPanel 
  features={['googleSignIn', 'darkMode']}
  groups={['authentication', 'video']}
/>
```

## 🚀 Ready to Use!

Your feature flag system is now ready. Start by:
1. Adding feature gates to existing components
2. Testing with different client configurations
3. Gradually migrating components to use feature flags
4. Adding new features with proper flag configurations

For detailed usage examples, see: docs/FEATURE_FLAGS_GUIDE.md
#!/usr/bin/env node

/**
 * Feature Flag Integration Helper Script
 * Helps integrate the feature flag system into existing components
 */

const fs = require('fs');
const path = require('path');

const INTEGRATION_EXAMPLES = {
  // Common integration patterns
  hooks: `
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
`,

  components: `
// Add to your component imports
import { FeatureGate, MultiFeatureGate } from '@/components/FeatureFlag';

// In your JSX
<FeatureGate feature="featureName" fallback={<AlternativeComponent />}>
  <FeatureComponent />
</FeatureGate>

<MultiFeatureGate features={['feature1', 'feature2']} mode="any">
  <ConditionalComponent />
</MultiFeatureGate>
`,

  utilities: `
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
`
};

function createIntegrationGuide() {
  const guide = `
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

\`\`\`typescript
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
\`\`\`

### 2. Update Existing Components

#### Authentication Components
${INTEGRATION_EXAMPLES.hooks}

#### UI Components
${INTEGRATION_EXAMPLES.components}

#### Utility Functions
${INTEGRATION_EXAMPLES.utilities}

### 3. Common Integration Patterns

#### Login Screen
\`\`\`typescript
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
\`\`\`

#### Settings Screen
\`\`\`typescript
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
\`\`\`

#### Video Player
\`\`\`typescript
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
\`\`\`

## 🧪 Testing Your Integration

### 1. Test Different Clients
\`\`\`bash
# Test with different clients
EXPO_PUBLIC_CLIENT_NAME=adg npm start
EXPO_PUBLIC_CLIENT_NAME=techedu npm start
EXPO_PUBLIC_CLIENT_NAME=skillboost npm start
\`\`\`

### 2. Test Different Versions
Update version in app.json or use environment variables:
\`\`\`json
{
  "expo": {
    "version": "1.0.0"  // Try different versions
  }
}
\`\`\`

### 3. Use Debug Components
Add to your development screens:
\`\`\`typescript
import { FeatureDebugPanel } from '@/components/FeatureFlag';

<FeatureDebugPanel 
  features={['googleSignIn', 'darkMode']}
  groups={['authentication', 'video']}
/>
\`\`\`

## 🚀 Ready to Use!

Your feature flag system is now ready. Start by:
1. Adding feature gates to existing components
2. Testing with different client configurations
3. Gradually migrating components to use feature flags
4. Adding new features with proper flag configurations

For detailed usage examples, see: docs/FEATURE_FLAGS_GUIDE.md
`;

  fs.writeFileSync(
    path.join(__dirname, '..', 'FEATURE_FLAG_INTEGRATION.md'),
    guide.trim()
  );
  
  console.log('✅ Integration guide created: FEATURE_FLAG_INTEGRATION.md');
}

function validateIntegration() {
  const requiredFiles = [
    'config/featureFlags.js',
    'utils/featureFlags.ts',
    'hooks/useFeatureFlags.ts',
    'components/FeatureFlag.tsx',
    'docs/FEATURE_FLAGS_GUIDE.md'
  ];

  console.log('🔍 Validating feature flag system integration...\n');

  let allValid = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Missing!`);
      allValid = false;
    }
  });

  console.log('\n' + '='.repeat(50));
  
  if (allValid) {
    console.log('🎉 All feature flag system files are present!');
    console.log('📚 Check FEATURE_FLAG_INTEGRATION.md for next steps');
  } else {
    console.log('⚠️  Some files are missing. Please run the setup again.');
  }

  return allValid;
}

function showUsageExamples() {
  console.log(`
🏁 Feature Flag System - Quick Usage Examples

1. Simple boolean check:
   import { isFeatureEnabled } from '@/utils/featureFlags';
   const hasFeature = isFeatureEnabled('googleSignIn');

2. React hook:
   import { useFeatureFlag } from '@/hooks/useFeatureFlags';
   const { enabled } = useFeatureFlag('darkMode');

3. Component gate:
   import { FeatureGate } from '@/components/FeatureFlag';
   <FeatureGate feature="aiChatbot">
     <ChatButton />
   </FeatureGate>

4. Feature groups:
   import { useAuthFeatures } from '@/hooks/useFeatureFlags';
   const authFeatures = useAuthFeatures();

5. Debug panel (dev only):
   import { FeatureDebugPanel } from '@/components/FeatureFlag';
   <FeatureDebugPanel features={['googleSignIn']} />

📖 For complete documentation: docs/FEATURE_FLAGS_GUIDE.md
`);
}

// CLI Interface
const command = process.argv[2];

switch (command) {
  case 'validate':
    validateIntegration();
    break;
  case 'guide':
    createIntegrationGuide();
    break;
  case 'examples':
    showUsageExamples();
    break;
  default:
    console.log(`
🏁 Feature Flag Integration Helper

Usage:
  node scripts/integrate-feature-flags.js <command>

Commands:
  validate  - Check if all feature flag files are present
  guide     - Create integration guide with examples
  examples  - Show quick usage examples

Examples:
  node scripts/integrate-feature-flags.js validate
  node scripts/integrate-feature-flags.js guide
  node scripts/integrate-feature-flags.js examples
`);
}

# Feature Flags System Guide

## Overview

The feature flag system provides client-specific, platform-aware, and version-based feature control for your multi-tenant application. Features can be enabled/disabled dynamically based on:

- **Client Name**: Different features for different clients
- **Platform**: iOS vs Android specific features
- **App Version**: Version-based rollouts
- **Device ID**: Device-specific targeting
- **User ID**: User-specific features

## Quick Start

### 1. Initialize Feature Flags

Feature flags are automatically initialized in the splash screen, but you can also initialize them manually:

```typescript
import { useFeatureFlagInitializer } from '@/hooks/useFeatureFlags';

function App() {
  const { isInitialized, isLoading, error } = useFeatureFlagInitializer();
  
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  return <MainApp />;
}
```

### 2. Use Feature Flags in Components

```typescript
import { useFeatureFlags, useConditionalRender } from '@/hooks/useFeatureFlags';
import { FeatureGate } from '@/components/FeatureFlagProvider';

function VideoPlayer() {
  // Simple flag check
  const isQuestionsEnabled = useFeatureFlags('video_questions');
  
  // Conditional rendering hook
  const { renderIf } = useConditionalRender('modern_video_player');
  
  return (
    <View>
      {/* Method 1: Direct conditional */}
      {isQuestionsEnabled && <QuestionModal />}
      
      {/* Method 2: Render hook */}
      {renderIf(<ModernVideoControls />)}
      
      {/* Method 3: Feature Gate component */}
      <FeatureGate flag="video_analytics" fallback={<BasicAnalytics />}>
        <AdvancedAnalytics />
      </FeatureGate>
    </View>
  );
}
```

### 3. Category-Specific Hooks

```typescript
import { 
  useVideoFeatureFlags,
  useCourseFeatureFlags,
  useUIFeatureFlags 
} from '@/hooks/useFeatureFlags';

function Dashboard() {
  const videoFlags = useVideoFeatureFlags();
  const courseFlags = useCourseFeatureFlags();
  const uiFlags = useUIFeatureFlags();
  
  return (
    <View>
      {videoFlags.video_questions && <VideoQuestions />}
      {courseFlags.course_certificates && <Certificates />}
      {uiFlags.gradient_ui && <GradientBackground />}
    </View>
  );
}
```

## API Integration

### Backend API Endpoint

The system calls `/feature-flags/evaluate` with the following payload:

```json
{
  "clientName": "adg",
  "platform": "ios",
  "appVersion": "1.0.0",
  "deviceId": "device_123",
  "buildNumber": "1",
  "osVersion": "17.0",
  "deviceModel": "iPhone 15"
}
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "flags": {
      "video_questions": true,
      "modern_video_player": true,
      "experimental_ai_recommendations": false
    },
    "metadata": {
      "clientName": "adg",
      "platform": "ios",
      "appVersion": "1.0.0",
      "evaluatedAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

## Available Feature Flags

### Video Features
- `video_questions` - Enable video questions
- `video_speed_control` - Playback speed controls
- `video_offline_download` - Offline video downloads
- `video_analytics` - Video analytics tracking
- `video_fullscreen` - Fullscreen video support
- `modern_video_player` - Modern video player UI

### Course Features
- `course_progress_tracking` - Course progress tracking
- `course_certificates` - Course completion certificates
- `course_discussions` - Course discussion forums
- `course_assignments` - Course assignments
- `course_tests` - Course tests and quizzes

### User Features
- `user_profile_edit` - User profile editing
- `user_theme_toggle` - Theme switching
- `user_notifications` - Push notifications
- `user_social_login` - Social media login

### UI Features
- `gradient_ui` - Gradient UI elements
- `dark_mode` - Dark mode support
- `pull_to_refresh` - Pull-to-refresh functionality
- `modern_video_player` - Modern video player interface

### Analytics Features
- `analytics_tracking` - Basic analytics tracking
- `analytics_detailed` - Detailed analytics
- `analytics_export` - Analytics data export

### Admin Features
- `admin_dashboard` - Admin dashboard access
- `admin_user_management` - User management tools
- `admin_content_management` - Content management

### Experimental Features
- `experimental_ai_recommendations` - AI-powered recommendations
- `experimental_voice_notes` - Voice note features
- `experimental_ar_features` - Augmented reality features

### Client Features
- `client_custom_branding` - Custom client branding
- `client_custom_domain` - Custom domain support
- `client_white_label` - White-label functionality

### Performance Features
- `performance_monitoring` - Performance monitoring
- `performance_caching` - Advanced caching
- `performance_lazy_loading` - Lazy loading optimization

## Advanced Usage

### Feature Flag Variants

```typescript
import { useFeatureVariant } from '@/hooks/useFeatureFlags';

function Button() {
  const buttonText = useFeatureVariant(
    'experimental_ai_recommendations',
    {
      enabled: 'AI-Powered Search',
      disabled: 'Standard Search'
    }
  );
  
  return <TouchableOpacity><Text>{buttonText}</Text></TouchableOpacity>;
}
```

### Higher-Order Component

```typescript
import { withFeatureFlag } from '@/components/FeatureFlagProvider';

const EnhancedVideoPlayer = withFeatureFlag(
  VideoPlayer,
  'modern_video_player',
  LegacyVideoPlayer
);
```

### Development Tools

```typescript
import { useFeatureFlagDebug } from '@/hooks/useFeatureFlags';

function DevPanel() {
  const { overrideFlag, resetToDefaults, logAllFlags } = useFeatureFlagDebug();
  
  return (
    <View>
      <Button onPress={() => overrideFlag('experimental_ai_recommendations', true)}>
        Enable AI Features
      </Button>
      <Button onPress={resetToDefaults}>Reset Flags</Button>
      <Button onPress={logAllFlags}>Log All Flags</Button>
    </View>
  );
}
```

## Configuration

### Default Values

All feature flags default to `true` except experimental features which default to `false`. This ensures new features are enabled by default unless explicitly disabled.

### Caching

Feature flags are cached for 30 minutes to reduce API calls. The cache is automatically refreshed when:
- App starts
- User pulls to refresh
- Manual refresh is triggered

### Error Handling

If the API fails, the system falls back to default values ensuring the app continues to function.

## Testing

### Demo Page

Visit `/feature-flags-demo` to see all feature flags in action and test the system.

### Manual Testing

```typescript
// Override flags in development
if (__DEV__) {
  useFeatureFlagStore.getState().overrideFlag('experimental_ai_recommendations', true);
}
```

### Unit Testing

```typescript
import { renderWithFeatureFlags } from '@/test-utils';

test('renders video questions when flag is enabled', () => {
  const { getByText } = renderWithFeatureFlags(
    <VideoPlayer />,
    { video_questions: true }
  );
  
  expect(getByText('Question 1')).toBeInTheDocument();
});
```

## Best Practices

### 1. Use Descriptive Names
- ✅ `video_questions_v2`
- ❌ `new_feature`

### 2. Default to Enabled
- New features should default to `true`
- Only experimental features default to `false`

### 3. Clean Up Old Flags
- Remove flags after full rollout
- Use migration utilities for flag renames

### 4. Test Both States
- Always test both enabled and disabled states
- Use the demo page for manual testing

### 5. Monitor Performance
- Feature flag evaluation is logged in development
- Monitor API response times

## Troubleshooting

### Common Issues

**Feature flags not loading:**
- Check network connectivity
- Verify API endpoint configuration
- Check console for error messages

**Flags not updating:**
- Clear cache manually
- Force refresh feature flags
- Check if app version is cached

**Performance issues:**
- Avoid complex flag evaluations in render loops
- Use category hooks for multiple flags
- Monitor flag evaluation times

### Debug Commands

```typescript
// Log all current flags
useFeatureFlagStore.getState().getAllFlags()

// Clear cache
useFeatureFlagStore.getState().clearCache()

// Force refresh
useFeatureFlagStore.getState().refreshFlags(true)
```

## Migration Guide

### From Legacy System

1. Replace direct feature checks with hooks
2. Update component conditional rendering
3. Test all feature combinations
4. Remove legacy feature flag code

### Flag Renaming

```typescript
import { migrateFeatureFlags } from '@/utils/featureFlagHelpers';

const migrations = {
  'old_video_player': 'modern_video_player',
  'legacy_ui': 'gradient_ui'
};

const newFlags = migrateFeatureFlags(oldFlags, migrations);
```

This comprehensive feature flag system provides enterprise-grade feature management with client-specific control, platform awareness, and robust error handling.

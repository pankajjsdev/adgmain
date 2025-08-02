# Analytics Integration Guide

## Overview

This project includes a comprehensive analytics system that tracks key events and user interactions throughout the application. The system is designed with flexibility in mind, allowing easy switching from console logging (current implementation) to API-based analytics in the future.

## Architecture

### Core Components

1. **Analytics Manager** (`utils/analytics.ts`)
   - Main analytics interface
   - Supports multiple providers (Console, API)
   - Event enrichment with metadata
   - Local storage for debugging

2. **Analytics Hooks** (`hooks/useAnalytics.ts`)
   - React hooks for easy integration
   - Specialized hooks for different use cases
   - Automatic screen tracking
   - Component lifecycle tracking

3. **Event Constants** (`utils/analytics.ts`)
   - Centralized event naming
   - Consistent event structure
   - Easy maintenance and updates

## Current Implementation

### Console Analytics Provider
- Logs all events to console with detailed formatting
- Stores events locally for debugging (last 100 events)
- Enriches events with session, user, and platform data
- Perfect for development and testing

### Future API Provider
- Ready-to-use API provider implementation
- Automatic event queuing and batching
- Retry logic and error handling
- Easy configuration switch

## Usage Examples

### Basic Event Tracking

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

const { track, events } = useAnalytics();

// Track a simple event
track(events.HOME_BANNER_CLICKED, {
  banner_id: 'banner_123',
  position: 1
});
```

### Screen Tracking

```typescript
import { useScreenTracking } from '@/hooks/useAnalytics';

// Automatic screen view tracking
useScreenTracking('ProfileScreen', {
  user_id: user?.id,
  profile_complete: user?.profileComplete
});
```

### User Interaction Tracking

```typescript
import { useInteractionTracking } from '@/hooks/useAnalytics';

const { trackClick, trackPress } = useInteractionTracking();

// Track button clicks
<TouchableOpacity onPress={() => trackClick('submit_button', { form: 'login' })}>
  <Text>Submit</Text>
</TouchableOpacity>
```

### Video/Media Tracking

```typescript
import { useMediaTracking } from '@/hooks/useAnalytics';

const { trackVideoStart, trackVideoComplete } = useMediaTracking();

// Track video events
trackVideoStart(videoId, { 
  video_title: 'Introduction to React',
  duration: 300 
});
```

### Form Tracking

```typescript
import { useFormTracking } from '@/hooks/useAnalytics';

const { trackFormStart, trackFormSubmit } = useFormTracking('LoginForm');

// Track form interactions
trackFormStart({ form_type: 'authentication' });
trackFormSubmit({ success: true, fields_filled: 2 });
```

## Event Categories

### App Lifecycle
- `APP_OPENED` - App launch
- `APP_BACKGROUNDED` - App goes to background
- `APP_FOREGROUNDED` - App returns to foreground

### Authentication
- `LOGIN_ATTEMPT` - User attempts login
- `LOGIN_SUCCESS` - Successful login
- `LOGIN_FAILED` - Failed login attempt
- `LOGOUT` - User logout
- `SIGNUP_ATTEMPT` - User attempts signup
- `SIGNUP_SUCCESS` - Successful signup
- `SIGNUP_FAILED` - Failed signup attempt

### Navigation
- `SCREEN_VIEW` - Screen viewed
- `TAB_CHANGED` - Tab navigation
- `NAVIGATION_BACK` - Back navigation

### Home Page
- `HOME_BANNER_VIEWED` - Banner carousel loaded
- `HOME_BANNER_CLICKED` - Banner clicked
- `HOME_QUICK_LINK_CLICKED` - Quick link clicked
- `HOME_TASK_CLICKED` - Task clicked
- `HOME_VIEW_ALL_TASKS` - View all tasks clicked

### Course Management
- `COURSE_VIEWED` - Course page viewed
- `COURSE_ENROLLED` - User enrolled in course
- `CHAPTER_OPENED` - Chapter accessed
- `VIDEO_STARTED` - Video playback started
- `VIDEO_COMPLETED` - Video completed
- `VIDEO_PAUSED` - Video paused
- `VIDEO_RESUMED` - Video resumed
- `VIDEO_SEEKED` - Video position changed
- `VIDEO_QUESTION_ANSWERED` - Video question answered

### Assignments & Tests
- `ASSIGNMENT_OPENED` - Assignment viewed
- `ASSIGNMENT_SUBMITTED` - Assignment submitted
- `TEST_STARTED` - Test started
- `TEST_COMPLETED` - Test completed
- `TEST_QUESTION_ANSWERED` - Test question answered

## Implementation Status

### ✅ Completed Components

1. **BannerCarousel** (`components/BannerCarousel.tsx`)
   - Banner fetch tracking
   - Banner view events
   - Banner click tracking
   - Error tracking

2. **Home Screen** (`app/(tabs)/index.tsx`)
   - Screen view tracking
   - Header icon interactions
   - View all tasks clicks

3. **Analytics System** (`utils/analytics.ts`)
   - Complete analytics manager
   - Console and API providers
   - Event enrichment
   - Local storage

4. **Analytics Hooks** (`hooks/useAnalytics.ts`)
   - Screen tracking hook
   - Interaction tracking hook
   - Media tracking hook
   - Form tracking hook
   - Component analytics hook

### 🔄 Recommended Next Steps

1. **Video Player Integration**
   - Add analytics to `useVideoPlayer` hook
   - Track video lifecycle events
   - Track question interactions
   - Track seeking behavior

2. **Course Management**
   - Add analytics to course store
   - Track enrollment events
   - Track progress updates
   - Track assignment submissions

3. **Authentication Flow**
   - Add analytics to auth store
   - Track login/logout events
   - Track signup flow
   - Track authentication errors

4. **Navigation Tracking**
   - Add tab change tracking
   - Track deep link usage
   - Track back navigation

## Configuration

### Switch to API Provider

When ready to integrate with a backend analytics service:

```typescript
import { configureAnalyticsAPI } from '@/utils/analytics';

// Configure API endpoint and authentication
configureAnalyticsAPI('https://api.yourapp.com/analytics', 'your-api-key');
```

### Environment Configuration

Add to your `.env` file:

```env
EXPO_PUBLIC_ANALYTICS_ENDPOINT=https://api.yourapp.com/analytics
EXPO_PUBLIC_ANALYTICS_API_KEY=your-api-key
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

### Disable Analytics

```typescript
import analytics from '@/utils/analytics';

// Disable analytics (useful for testing)
analytics.setEnabled(false);
```

## Data Structure

### Event Format

```typescript
interface AnalyticsEvent {
  event: string;                    // Event name
  properties?: Record<string, any>; // Custom properties
  userId?: string;                  // User identifier
  timestamp?: number;               // Event timestamp
  sessionId?: string;               // Session identifier
  platform?: string;                // iOS/Android
  appVersion?: string;              // App version
}
```

### Enriched Event Example

```json
{
  "event": "HOME_BANNER_CLICKED",
  "properties": {
    "banner_id": "banner_123",
    "banner_link": "/courses/react-basics",
    "link_type": "internal",
    "carousel_height": 200
  },
  "userId": "user_456",
  "timestamp": 1704067200000,
  "sessionId": "session_1704067200_abc123",
  "platform": "ios",
  "appVersion": "1.0.0"
}
```

## Best Practices

### Event Naming
- Use consistent naming conventions
- Use the predefined event constants
- Include context in event names
- Avoid sensitive data in event names

### Properties
- Include relevant context
- Use consistent property names
- Avoid deeply nested objects
- Include IDs for tracking relationships

### Performance
- Events are queued and batched
- Local storage is limited to 100 events
- Failed events are retried automatically
- Analytics calls are non-blocking

### Privacy
- Avoid logging sensitive user data
- Use user IDs instead of personal information
- Respect user privacy preferences
- Consider GDPR compliance

## Debugging

### View Local Events

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get stored events
const events = await AsyncStorage.getItem('analytics_events');
console.log(JSON.parse(events || '[]'));
```

### Console Output

All events are logged to console in development mode with detailed formatting:

```
📊 Analytics Event: {
  "event": "HOME_BANNER_CLICKED",
  "properties": { ... },
  "timestamp": 1704067200000,
  ...
}
```

## Integration Checklist

- [ ] Add screen tracking to all major screens
- [ ] Track key user interactions (buttons, links, forms)
- [ ] Track video/media events
- [ ] Track course progress and completions
- [ ] Track authentication events
- [ ] Track errors and performance issues
- [ ] Test analytics in development
- [ ] Configure API provider for production
- [ ] Set up analytics dashboard
- [ ] Document custom events

## Support

For questions or issues with the analytics system:

1. Check console logs for event tracking
2. Verify event names match constants
3. Check local storage for event history
4. Review component integration
5. Test with different user scenarios

The analytics system is designed to be robust and fail gracefully, ensuring it never impacts the user experience while providing valuable insights into app usage and performance.

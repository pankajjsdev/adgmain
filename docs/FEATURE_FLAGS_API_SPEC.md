# Feature Flags API Specification

This document defines the API endpoint structure that the backend developer needs to implement for the feature flag system.

## Endpoint: `/feature-flags/evaluate`

### Method: `POST`

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

### Request Body Structure

```typescript
interface FeatureFlagRequest {
  client: string;           // Client identifier (e.g., "adg", "techedu", "skillboost")
  platform: string;        // Platform ("ios", "android", "web")
  appVersion: string;       // App version (e.g., "1.0.0")
  deviceInfo: {
    deviceId: string;       // Unique device identifier
    osVersion: string;      // OS version (e.g., "17.0", "14.0")
    deviceModel: string;    // Device model (e.g., "iPhone15,2", "SM-G991B")
  };
  userId?: string;          // Optional user ID if authenticated
  context?: {               // Optional additional context
    [key: string]: any;
  };
}
```

### Example Request
```json
{
  "client": "adg",
  "platform": "ios",
  "appVersion": "1.0.0",
  "deviceInfo": {
    "deviceId": "ABC123-DEF456-GHI789",
    "osVersion": "17.0",
    "deviceModel": "iPhone15,2"
  },
  "userId": "user_12345",
  "context": {
    "userTier": "premium",
    "experimentGroup": "A"
  }
}
```

### Response Structure

```typescript
interface FeatureFlagResponse {
  success: boolean;
  data: {
    flags: Record<string, boolean>;  // Key-value pairs of flag names and their states
  };
  metadata: {
    cacheExpiry: number;            // Unix timestamp when flags should be refreshed
    evaluationTime: number;         // Time taken to evaluate flags (ms)
    version: string;                // Feature flag configuration version
    clientConfig: {
      client: string;
      platform: string;
      appVersion: string;
    };
  };
  error?: string;                   // Error message if success is false
}
```

### Example Success Response
```json
{
  "success": true,
  "data": {
    "flags": {
      "video_questions": true,
      "modern_video_player": true,
      "dark_mode": false,
      "offline_downloads": true,
      "push_notifications": true,
      "analytics_tracking": true,
      "course_recommendations": false,
      "social_sharing": true,
      "advanced_search": false,
      "video_speed_control": true,
      "course_bookmarks": true,
      "discussion_forums": false,
      "live_streaming": false,
      "ai_tutoring": false,
      "gamification": true,
      "progress_sync": true,
      "offline_mode": false,
      "experimental_ui": false,
      "experimental_ai_recommendations": false,
      "experimental_voice_notes": false,
      "performance_monitoring": true,
      "crash_reporting": true,
      "feature_usage_analytics": true,
      "admin_panel": false,
      "content_moderation": false,
      "user_management": false,
      "client_branding": true,
      "white_label": false,
      "custom_domains": false
    }
  },
  "metadata": {
    "cacheExpiry": 1692201600000,
    "evaluationTime": 45,
    "version": "1.2.3",
    "clientConfig": {
      "client": "adg",
      "platform": "ios",
      "appVersion": "1.0.0"
    }
  }
}
```

### Example Error Response
```json
{
  "success": false,
  "data": {
    "flags": {}
  },
  "metadata": {
    "cacheExpiry": 1692201600000,
    "evaluationTime": 12,
    "version": "1.2.3",
    "clientConfig": {
      "client": "adg",
      "platform": "ios",
      "appVersion": "1.0.0"
    }
  },
  "error": "Invalid client identifier"
}
```

## Feature Flag Categories

The system supports the following feature flag categories:

### Video Features
- `video_questions` - Enable video questions functionality
- `modern_video_player` - Use modern video player UI
- `video_speed_control` - Allow video playback speed control
- `offline_downloads` - Enable video downloads for offline viewing

### Course Features  
- `course_recommendations` - Show AI-powered course recommendations
- `course_bookmarks` - Allow users to bookmark courses
- `progress_sync` - Sync progress across devices

### UI Features
- `dark_mode` - Enable dark mode theme
- `experimental_ui` - Enable experimental UI components
- `social_sharing` - Show social sharing buttons

### Analytics Features
- `analytics_tracking` - Enable user analytics tracking
- `feature_usage_analytics` - Track feature usage statistics
- `performance_monitoring` - Monitor app performance

### Admin Features
- `admin_panel` - Enable admin panel access
- `content_moderation` - Enable content moderation tools
- `user_management` - Enable user management features

### Experimental Features
- `experimental_ai_recommendations` - AI-powered recommendations
- `experimental_voice_notes` - Voice note functionality
- `ai_tutoring` - AI tutoring assistant

### Client Features
- `client_branding` - Enable client-specific branding
- `white_label` - Enable white-label functionality
- `custom_domains` - Support custom domains

### Performance Features
- `crash_reporting` - Enable crash reporting
- `offline_mode` - Enable offline functionality

## Implementation Notes

### Client-Specific Overrides
The backend should support client-specific feature flag overrides:
- Each client (ADG, TechEdu, SkillBoost) can have different flag values
- Platform-specific overrides (iOS vs Android)
- Version-based rollouts (enable features for specific app versions)

### Caching Strategy
- Client apps cache flags for 30 minutes by default
- `cacheExpiry` timestamp indicates when to refresh
- Apps should respect cache expiry to avoid excessive API calls

### Error Handling
- Always return a valid response structure, even on errors
- Include default flag values when evaluation fails
- Provide meaningful error messages for debugging

### Security Considerations
- Validate client identifier against allowed values
- Implement rate limiting to prevent abuse
- Log flag evaluations for audit purposes
- Sanitize user input in context data

### Performance Requirements
- API should respond within 100ms for optimal UX
- Support concurrent requests from multiple users
- Implement efficient flag evaluation logic
- Consider database indexing for fast lookups

## Testing

### Test Cases to Implement
1. Valid request with all parameters
2. Missing required parameters
3. Invalid client identifier
4. Malformed request body
5. Authentication failures
6. Rate limiting scenarios
7. Database connectivity issues

### Load Testing
- Test with 1000+ concurrent requests
- Verify response times under load
- Test cache invalidation scenarios
- Monitor memory usage during peak loads

## Monitoring & Analytics

### Metrics to Track
- API response times
- Flag evaluation counts per client
- Error rates and types
- Cache hit/miss ratios
- Feature flag usage statistics

### Logging Requirements
- Log all flag evaluations with context
- Track flag changes and rollouts
- Monitor for unusual usage patterns
- Alert on high error rates

This specification provides everything needed to implement a robust, scalable feature flag evaluation API that supports the multi-tenant architecture and client-specific requirements.

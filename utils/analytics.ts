import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Analytics Event Types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
  sessionId?: string;
  platform?: string;
  appVersion?: string;
}

// Common Event Names - Centralized for consistency
export const ANALYTICS_EVENTS = {
  // App Lifecycle
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  APP_FOREGROUNDED: 'app_foregrounded',
  
  // Authentication
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  SIGNUP_ATTEMPT: 'signup_attempt',
  SIGNUP_SUCCESS: 'signup_success',
  SIGNUP_FAILED: 'signup_failed',
  
  // Navigation
  SCREEN_VIEW: 'screen_view',
  TAB_CHANGED: 'tab_changed',
  NAVIGATION_BACK: 'navigation_back',
  
  // Home Page
  HOME_BANNER_VIEWED: 'home_banner_viewed',
  HOME_BANNER_CLICKED: 'home_banner_clicked',
  HOME_QUICK_LINK_CLICKED: 'home_quick_link_clicked',
  HOME_TASK_CLICKED: 'home_task_clicked',
  HOME_VIEW_ALL_TASKS: 'home_view_all_tasks',
  
  // Course Management
  COURSE_VIEWED: 'course_viewed',
  COURSE_ENROLLED: 'course_enrolled',
  CHAPTER_OPENED: 'chapter_opened',
  VIDEO_STARTED: 'video_started',
  VIDEO_COMPLETED: 'video_completed',
  VIDEO_PAUSED: 'video_paused',
  VIDEO_RESUMED: 'video_resumed',
  VIDEO_SEEKED: 'video_seeked',
  VIDEO_REPLAYED: 'video_replayed',
  
  // Assignments & Tests
  ASSIGNMENT_OPENED: 'assignment_opened',
  ASSIGNMENT_SUBMITTED: 'assignment_submitted',
  ASSIGNMENT_STARTED: 'assignment_started',
  ASSIGNMENT_CONTINUED: 'assignment_continued',
  ASSIGNMENT_SAVED: 'assignment_saved',
  ASSIGNMENT_EXPIRED: 'assignment_expired',
  ASSIGNMENT_ERROR: 'assignment_error',
  ASSIGNMENT_LOAD_SUCCESS: 'assignment_load_success',
  ASSIGNMENT_LOAD_FAILED: 'assignment_load_failed',
  ASSIGNMENT_TAB_CHANGED: 'assignment_tab_changed',
  ASSIGNMENT_FILE_DOWNLOADED: 'assignment_file_downloaded',
  ASSIGNMENT_FILE_UPLOAD: 'assignment_file_upload',
  ASSIGNMENT_RUBRIC_VIEWED: 'assignment_rubric_viewed',
  
  // Question Page Events
  QUESTION_PAGE_OPENED: 'question_page_opened',
  QUESTION_ANSWERED: 'question_answered',
  QUESTION_SKIPPED: 'question_skipped',
  QUESTION_NAVIGATION: 'question_navigation',
  QUESTION_TIMER_WARNING: 'question_timer_warning',
  QUESTION_TIMER_EXPIRED: 'question_timer_expired',
  QUESTION_PROGRESS_UPDATED: 'question_progress_updated',
  QUESTION_EXPLANATION_ADDED: 'question_explanation_added',
  QUESTION_TYPE_RENDERED: 'question_type_rendered',
  QUESTION_LOAD_ERROR: 'question_load_error',
  QUESTION_SAVE_SUCCESS: 'question_save_success',
  QUESTION_SAVE_ERROR: 'question_save_error',
  QUESTION_SUBMIT_SUCCESS: 'question_submit_success',
  QUESTION_SUBMIT_ERROR: 'question_submit_error',
  QUESTION_AUTO_SAVE: 'question_auto_save',
  QUESTION_SUMMARY_VIEWED: 'question_summary_viewed',
  
  // Video Player Events
  VIDEO_PLAYER_OPENED: 'video_player_opened',
  VIDEO_PLAYBACK_STARTED: 'video_playback_started',
  VIDEO_PLAYBACK_PAUSED: 'video_playback_paused',
  VIDEO_PLAYBACK_RESUMED: 'video_playback_resumed',
  VIDEO_PLAYBACK_COMPLETED: 'video_playback_completed',
  VIDEO_SEEK_PERFORMED: 'video_seek_performed',
  VIDEO_QUALITY_CHANGED: 'video_quality_changed',
  VIDEO_SPEED_CHANGED: 'video_speed_changed',
  VIDEO_VOLUME_CHANGED: 'video_volume_changed',
  VIDEO_FULLSCREEN_ENTERED: 'video_fullscreen_entered',
  VIDEO_FULLSCREEN_EXITED: 'video_fullscreen_exited',
  VIDEO_BUFFER_START: 'video_buffer_start',
  VIDEO_BUFFER_END: 'video_buffer_end',
  VIDEO_ERROR: 'video_error',
  VIDEO_LOAD_SUCCESS: 'video_load_success',
  VIDEO_LOAD_ERROR: 'video_load_error',
  VIDEO_PROGRESS_UPDATE: 'video_progress_update',
  VIDEO_MILESTONE_REACHED: 'video_milestone_reached',
  
  // Video Detail Page Events
  VIDEO_DETAIL_PAGE_OPENED: 'video_detail_page_opened',
  VIDEO_DETAIL_TAB_CHANGED: 'video_detail_tab_changed',
  VIDEO_RESOURCES_VIEWED: 'video_resources_viewed',
  VIDEO_DESCRIPTION_VIEWED: 'video_description_viewed',
  VIDEO_QUESTIONS_VIEWED: 'video_questions_viewed',
  VIDEO_RESOURCE_DOWNLOADED: 'video_resource_downloaded',
  VIDEO_NOTES_OPENED: 'video_notes_opened',
  VIDEO_TRANSCRIPT_VIEWED: 'video_transcript_viewed',
  
  // Video Question Modal Events
  VIDEO_QUESTION_SHOWN: 'video_question_shown',
  VIDEO_QUESTION_ANSWERED: 'video_question_answered',
  VIDEO_QUESTION_SKIPPED: 'video_question_skipped',
  VIDEO_QUESTION_TIMEOUT: 'video_question_timeout',
  VIDEO_QUESTION_CLOSED: 'video_question_closed',
  VIDEO_QUESTION_NAVIGATION: 'video_question_navigation',
  VIDEO_QUESTION_HINT_USED: 'video_question_hint_used',
  VIDEO_QUESTION_RETRY: 'video_question_retry',
  
  // Profile & Settings
  PROFILE_VIEWED: 'profile_viewed',
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',
  
  // Search & Discovery
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',
  FILTER_APPLIED: 'filter_applied',
  
  // Errors & Performance
  ERROR_OCCURRED: 'error_occurred',
  API_CALL_FAILED: 'api_call_failed',
  PERFORMANCE_ISSUE: 'performance_issue',
  
  // Engagement
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_CLICKED: 'notification_clicked',
  SHARE_CONTENT: 'share_content',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
} as const;

// Analytics Provider Interface - Easy to swap implementations
interface AnalyticsProvider {
  track(event: AnalyticsEvent): Promise<void>;
  identify(userId: string, properties?: Record<string, any>): Promise<void>;
  flush(): Promise<void>;
}

// Console Analytics Provider (Current Implementation)
class ConsoleAnalyticsProvider implements AnalyticsProvider {
  async track(event: AnalyticsEvent): Promise<void> {
    const enrichedEvent = await this.enrichEvent(event);
    console.log('📊 Analytics Event:', JSON.stringify(enrichedEvent, null, 2));
    
    // Store locally for debugging/testing
    await this.storeEventLocally(enrichedEvent);
  }

  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    console.log('👤 Analytics Identify:', { userId, properties });
    await AsyncStorage.setItem('analytics_user_id', userId);
    if (properties) {
      await AsyncStorage.setItem('analytics_user_properties', JSON.stringify(properties));
    }
  }

  async flush(): Promise<void> {
    console.log('🚀 Analytics Flush: Events would be sent to backend here');
  }

  private async enrichEvent(event: AnalyticsEvent): Promise<AnalyticsEvent> {
    const sessionId = await this.getSessionId();
    const userId = await AsyncStorage.getItem('analytics_user_id');
    
    return {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: event.sessionId || sessionId,
      userId: event.userId || userId || undefined,
      platform: event.platform || Platform.OS,
      appVersion: event.appVersion || '1.0.0', // Get from app config
    };
  }

  private async getSessionId(): Promise<string> {
    let sessionId = await AsyncStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private async storeEventLocally(event: AnalyticsEvent): Promise<void> {
    try {
      const existingEvents = await AsyncStorage.getItem('analytics_events');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(event);
      
      // Keep only last 100 events locally
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      await AsyncStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store analytics event locally:', error);
    }
  }
}

// API Analytics Provider (Future Implementation)
class APIAnalyticsProvider implements AnalyticsProvider {
  private apiEndpoint: string;
  private apiKey: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor(apiEndpoint: string, apiKey: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.startAutoFlush();
  }

  async track(event: AnalyticsEvent): Promise<void> {
    const enrichedEvent = await this.enrichEvent(event);
    this.eventQueue.push(enrichedEvent);
    
    // Also log to console in development
    if (__DEV__) {
      console.log('📊 Analytics Event (API):', JSON.stringify(enrichedEvent, null, 2));
    }
    
    // Auto-flush if queue gets too large
    if (this.eventQueue.length >= 10) {
      await this.flush();
    }
  }

  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    await AsyncStorage.setItem('analytics_user_id', userId);
    if (properties) {
      await AsyncStorage.setItem('analytics_user_properties', JSON.stringify(properties));
    }
    
    // Send identify event to API
    await this.sendToAPI('/identify', { userId, properties });
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      await this.sendToAPI('/events', { events: eventsToSend });
      console.log(`🚀 Analytics: Sent ${eventsToSend.length} events to API`);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  private async enrichEvent(event: AnalyticsEvent): Promise<AnalyticsEvent> {
    const sessionId = await this.getSessionId();
    const userId = await AsyncStorage.getItem('analytics_user_id');
    
    return {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: event.sessionId || sessionId,
      userId: event.userId || userId || undefined,
      platform: event.platform || Platform.OS,
      appVersion: event.appVersion || '1.0.0',
    };
  }

  private async getSessionId(): Promise<string> {
    let sessionId = await AsyncStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private async sendToAPI(endpoint: string, data: any): Promise<void> {
    const response = await fetch(`${this.apiEndpoint}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);
    }
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  public stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

// Analytics Manager - Main Interface
class AnalyticsManager {
  private provider: AnalyticsProvider;
  private isEnabled: boolean = true;

  constructor(provider: AnalyticsProvider) {
    this.provider = provider;
  }

  // Switch provider (e.g., from Console to API)
  setProvider(provider: AnalyticsProvider): void {
    this.provider = provider;
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Track an event
  async track(eventName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.provider.track({
        event: eventName,
        properties,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Track screen view
  async trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    await this.track(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track user action
  async trackUserAction(action: string, properties?: Record<string, any>): Promise<void> {
    await this.track(action, {
      action_type: 'user_interaction',
      ...properties,
    });
  }

  // Track error
  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.track(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    });
  }

  // Identify user
  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.provider.identify(userId, properties);
    } catch (error) {
      console.error('Analytics identify error:', error);
    }
  }

  // Flush events
  async flush(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.provider.flush();
    } catch (error) {
      console.error('Analytics flush error:', error);
    }
  }
}

// Create and export the analytics instance
const analytics = new AnalyticsManager(new ConsoleAnalyticsProvider());

// Helper functions for easy usage
export const trackEvent = (eventName: string, properties?: Record<string, any>) => 
  analytics.track(eventName, properties);

export const trackScreenView = (screenName: string, properties?: Record<string, any>) => 
  analytics.trackScreenView(screenName, properties);

export const trackUserAction = (action: string, properties?: Record<string, any>) => 
  analytics.trackUserAction(action, properties);

export const trackError = (error: Error, context?: Record<string, any>) => 
  analytics.trackError(error, context);

export const identifyUser = (userId: string, properties?: Record<string, any>) => 
  analytics.identify(userId, properties);

export const flushAnalytics = () => analytics.flush();

// Export the manager for advanced usage
export { AnalyticsManager, ConsoleAnalyticsProvider, APIAnalyticsProvider };
export default analytics;

// Configuration helper for switching to API provider
export const configureAnalyticsAPI = (apiEndpoint: string, apiKey: string) => {
  const apiProvider = new APIAnalyticsProvider(apiEndpoint, apiKey);
  analytics.setProvider(apiProvider);
  console.log('🔄 Analytics: Switched to API provider');
};

// Assignment-specific Analytics Helper Functions
export const AssignmentAnalytics = {
  // Assignment Detail Page Events
  trackAssignmentOpened: (assignmentId: string, assignmentType: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_OPENED, {
      assignment_id: assignmentId,
      assignment_type: assignmentType,
      ...properties
    }),

  trackAssignmentStarted: (assignmentId: string, assignmentType: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_STARTED, {
      assignment_id: assignmentId,
      assignment_type: assignmentType,
      ...properties
    }),

  trackAssignmentContinued: (assignmentId: string, progressPercentage: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_CONTINUED, {
      assignment_id: assignmentId,
      progress_percentage: progressPercentage,
      ...properties
    }),

  trackAssignmentTabChanged: (assignmentId: string, fromTab: string, toTab: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_TAB_CHANGED, {
      assignment_id: assignmentId,
      from_tab: fromTab,
      to_tab: toTab,
      ...properties
    }),

  trackAssignmentLoadSuccess: (assignmentId: string, loadTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_LOAD_SUCCESS, {
      assignment_id: assignmentId,
      load_time_ms: loadTime,
      ...properties
    }),

  trackAssignmentLoadFailed: (assignmentId: string, error: Error, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_LOAD_FAILED, {
      assignment_id: assignmentId,
      error_message: error.message,
      error_type: error.name,
      ...properties
    }),

  trackAssignmentExpired: (assignmentId: string, timeRemaining: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_EXPIRED, {
      assignment_id: assignmentId,
      time_remaining_seconds: timeRemaining,
      ...properties
    }),

  trackAssignmentFileDownload: (assignmentId: string, fileName: string, fileType: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_FILE_DOWNLOADED, {
      assignment_id: assignmentId,
      file_name: fileName,
      file_type: fileType,
      ...properties
    }),

  trackAssignmentFileUpload: (assignmentId: string, fileName: string, fileSize: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_FILE_UPLOAD, {
      assignment_id: assignmentId,
      file_name: fileName,
      file_size_bytes: fileSize,
      ...properties
    }),

  trackAssignmentRubricViewed: (assignmentId: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_RUBRIC_VIEWED, {
      assignment_id: assignmentId,
      ...properties
    }),

  // Question Page Events
  trackQuestionPageOpened: (assignmentId: string, totalQuestions: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_PAGE_OPENED, {
      assignment_id: assignmentId,
      total_questions: totalQuestions,
      ...properties
    }),

  trackQuestionAnswered: (assignmentId: string, questionId: string, questionType: string, answerTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_ANSWERED, {
      assignment_id: assignmentId,
      question_id: questionId,
      question_type: questionType,
      answer_time_seconds: answerTime,
      ...properties
    }),

  trackQuestionNavigation: (assignmentId: string, fromQuestion: number, toQuestion: number, navigationMethod: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_NAVIGATION, {
      assignment_id: assignmentId,
      from_question: fromQuestion,
      to_question: toQuestion,
      navigation_method: navigationMethod, // 'next', 'previous', 'jump', 'navigator'
      ...properties
    }),

  trackQuestionProgressUpdated: (assignmentId: string, currentQuestion: number, totalQuestions: number, answeredCount: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_PROGRESS_UPDATED, {
      assignment_id: assignmentId,
      current_question: currentQuestion,
      total_questions: totalQuestions,
      answered_count: answeredCount,
      progress_percentage: Math.round((answeredCount / totalQuestions) * 100),
      ...properties
    }),

  trackQuestionTimerWarning: (assignmentId: string, timeRemaining: number, warningType: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_TIMER_WARNING, {
      assignment_id: assignmentId,
      time_remaining_seconds: timeRemaining,
      warning_type: warningType, // 'urgent', 'warning', 'normal'
      ...properties
    }),

  trackQuestionTimerExpired: (assignmentId: string, currentQuestion: number, answeredCount: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_TIMER_EXPIRED, {
      assignment_id: assignmentId,
      current_question: currentQuestion,
      answered_count: answeredCount,
      ...properties
    }),

  trackQuestionTypeRendered: (assignmentId: string, questionId: string, questionType: string, renderTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_TYPE_RENDERED, {
      assignment_id: assignmentId,
      question_id: questionId,
      question_type: questionType,
      render_time_ms: renderTime,
      ...properties
    }),

  trackQuestionSaveSuccess: (assignmentId: string, questionId: string, saveTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_SAVE_SUCCESS, {
      assignment_id: assignmentId,
      question_id: questionId,
      save_time_ms: saveTime,
      ...properties
    }),

  trackQuestionSaveError: (assignmentId: string, questionId: string, error: Error, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_SAVE_ERROR, {
      assignment_id: assignmentId,
      question_id: questionId,
      error_message: error.message,
      error_type: error.name,
      ...properties
    }),

  trackQuestionSubmitSuccess: (assignmentId: string, totalQuestions: number, answeredCount: number, submitTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_SUBMIT_SUCCESS, {
      assignment_id: assignmentId,
      total_questions: totalQuestions,
      answered_count: answeredCount,
      completion_percentage: Math.round((answeredCount / totalQuestions) * 100),
      submit_time_ms: submitTime,
      ...properties
    }),

  trackQuestionSubmitError: (assignmentId: string, error: Error, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_SUBMIT_ERROR, {
      assignment_id: assignmentId,
      error_message: error.message,
      error_type: error.name,
      ...properties
    }),

  trackQuestionAutoSave: (assignmentId: string, questionId: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_AUTO_SAVE, {
      assignment_id: assignmentId,
      question_id: questionId,
      ...properties
    }),

  trackQuestionSummaryViewed: (assignmentId: string, totalQuestions: number, answeredCount: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_SUMMARY_VIEWED, {
      assignment_id: assignmentId,
      total_questions: totalQuestions,
      answered_count: answeredCount,
      completion_percentage: Math.round((answeredCount / totalQuestions) * 100),
      ...properties
    }),

  trackQuestionExplanationAdded: (assignmentId: string, questionId: string, explanationLength: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_EXPLANATION_ADDED, {
      assignment_id: assignmentId,
      question_id: questionId,
      explanation_length: explanationLength,
      ...properties
    }),

  // Performance and Error Tracking
  trackAssignmentError: (assignmentId: string, errorType: string, error: Error, context?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.ASSIGNMENT_ERROR, {
      assignment_id: assignmentId,
      error_type: errorType,
      error_message: error.message,
      error_stack: error.stack,
      ...context
    }),

  trackQuestionLoadError: (assignmentId: string, questionId: string, error: Error, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.QUESTION_LOAD_ERROR, {
      assignment_id: assignmentId,
      question_id: questionId,
      error_message: error.message,
      error_type: error.name,
      ...properties
    }),
};

// Video Analytics Helper Functions
export const VideoAnalytics = {
  // Video Player Events
  trackVideoPlayerOpened: (videoId: string, videoUrl: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_PLAYER_OPENED, {
      video_id: videoId,
      video_url: videoUrl,
      ...properties
    }),

  trackVideoPlaybackStarted: (videoId: string, currentTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_PLAYBACK_STARTED, {
      video_id: videoId,
      current_time_seconds: currentTime,
      ...properties
    }),

  trackVideoPlaybackPaused: (videoId: string, currentTime: number, duration: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_PLAYBACK_PAUSED, {
      video_id: videoId,
      current_time_seconds: currentTime,
      duration_seconds: duration,
      progress_percentage: duration > 0 ? Math.round((currentTime / duration) * 100) : 0,
      ...properties
    }),

  trackVideoPlaybackResumed: (videoId: string, currentTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_PLAYBACK_RESUMED, {
      video_id: videoId,
      current_time_seconds: currentTime,
      ...properties
    }),

  trackVideoPlaybackCompleted: (videoId: string, duration: number, watchTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_PLAYBACK_COMPLETED, {
      video_id: videoId,
      duration_seconds: duration,
      watch_time_seconds: watchTime,
      completion_percentage: duration > 0 ? Math.round((watchTime / duration) * 100) : 0,
      ...properties
    }),

  trackVideoSeekPerformed: (videoId: string, fromTime: number, toTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_SEEK_PERFORMED, {
      video_id: videoId,
      from_time_seconds: fromTime,
      to_time_seconds: toTime,
      seek_distance_seconds: Math.abs(toTime - fromTime),
      seek_direction: toTime > fromTime ? 'forward' : 'backward',
      ...properties
    }),

  trackVideoQualityChanged: (videoId: string, fromQuality: string, toQuality: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUALITY_CHANGED, {
      video_id: videoId,
      from_quality: fromQuality,
      to_quality: toQuality,
      ...properties
    }),

  trackVideoSpeedChanged: (videoId: string, fromSpeed: number, toSpeed: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_SPEED_CHANGED, {
      video_id: videoId,
      from_speed: fromSpeed,
      to_speed: toSpeed,
      ...properties
    }),

  trackVideoVolumeChanged: (videoId: string, fromVolume: number, toVolume: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_VOLUME_CHANGED, {
      video_id: videoId,
      from_volume: fromVolume,
      to_volume: toVolume,
      ...properties
    }),

  trackVideoReplayed: (videoId: string, previousWatchTime: number, duration: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_REPLAYED, {
      video_id: videoId,
      previous_watch_time_seconds: previousWatchTime,
      duration_seconds: duration,
      completion_percentage: duration > 0 ? Math.round((previousWatchTime / duration) * 100) : 0,
      replay_timestamp: Date.now(),
      ...properties
    }),

  trackVideoFullscreenEntered: (videoId: string, currentTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_FULLSCREEN_ENTERED, {
      video_id: videoId,
      current_time_seconds: currentTime,
      ...properties
    }),

  trackVideoFullscreenExited: (videoId: string, currentTime: number, fullscreenDuration: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_FULLSCREEN_EXITED, {
      video_id: videoId,
      current_time_seconds: currentTime,
      fullscreen_duration_seconds: fullscreenDuration,
      ...properties
    }),

  trackVideoBufferStart: (videoId: string, currentTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_BUFFER_START, {
      video_id: videoId,
      current_time_seconds: currentTime,
      ...properties
    }),

  trackVideoBufferEnd: (videoId: string, currentTime: number, bufferDuration: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_BUFFER_END, {
      video_id: videoId,
      current_time_seconds: currentTime,
      buffer_duration_ms: bufferDuration,
      ...properties
    }),

  trackVideoError: (videoId: string, error: Error, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_ERROR, {
      video_id: videoId,
      error_message: error.message,
      error_type: error.name,
      ...properties
    }),

  trackVideoLoadSuccess: (videoId: string, loadTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_LOAD_SUCCESS, {
      video_id: videoId,
      load_time_ms: loadTime,
      ...properties
    }),

  trackVideoLoadError: (videoId: string, error: Error, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_LOAD_ERROR, {
      video_id: videoId,
      error_message: error.message,
      error_type: error.name,
      ...properties
    }),

  trackVideoProgressUpdate: (videoId: string, currentTime: number, duration: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_PROGRESS_UPDATE, {
      video_id: videoId,
      current_time_seconds: currentTime,
      duration_seconds: duration,
      progress_percentage: duration > 0 ? Math.round((currentTime / duration) * 100) : 0,
      ...properties
    }),

  trackVideoMilestoneReached: (videoId: string, milestone: number, currentTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_MILESTONE_REACHED, {
      video_id: videoId,
      milestone_percentage: milestone,
      current_time_seconds: currentTime,
      ...properties
    }),

  // Video Detail Page Events
  trackVideoDetailPageOpened: (videoId: string, videoTitle: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_DETAIL_PAGE_OPENED, {
      video_id: videoId,
      video_title: videoTitle,
      ...properties
    }),

  trackVideoDetailTabChanged: (videoId: string, fromTab: string, toTab: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_DETAIL_TAB_CHANGED, {
      video_id: videoId,
      from_tab: fromTab,
      to_tab: toTab,
      ...properties
    }),

  trackVideoResourcesViewed: (videoId: string, resourceCount: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_RESOURCES_VIEWED, {
      video_id: videoId,
      resource_count: resourceCount,
      ...properties
    }),

  trackVideoDescriptionViewed: (videoId: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_DESCRIPTION_VIEWED, {
      video_id: videoId,
      ...properties
    }),

  trackVideoQuestionsViewed: (videoId: string, questionCount: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTIONS_VIEWED, {
      video_id: videoId,
      question_count: questionCount,
      ...properties
    }),

  trackVideoResourceDownloaded: (videoId: string, resourceName: string, resourceType: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_RESOURCE_DOWNLOADED, {
      video_id: videoId,
      resource_name: resourceName,
      resource_type: resourceType,
      ...properties
    }),

  trackVideoNotesOpened: (videoId: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_NOTES_OPENED, {
      video_id: videoId,
      ...properties
    }),

  trackVideoTranscriptViewed: (videoId: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_TRANSCRIPT_VIEWED, {
      video_id: videoId,
      ...properties
    }),

  // Video Question Modal Events
  trackVideoQuestionShown: (videoId: string, questionId: string, questionType: string, currentTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTION_SHOWN, {
      video_id: videoId,
      question_id: questionId,
      question_type: questionType,
      video_time_seconds: currentTime,
      ...properties
    }),

  trackVideoQuestionAnswered: (videoId: string, questionId: string, answer: string, isCorrect: boolean, responseTime: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTION_ANSWERED, {
      video_id: videoId,
      question_id: questionId,
      answer: answer,
      is_correct: isCorrect,
      response_time_seconds: responseTime,
      ...properties
    }),

  trackVideoQuestionSkipped: (videoId: string, questionId: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTION_SKIPPED, {
      video_id: videoId,
      question_id: questionId,
      ...properties
    }),

  trackVideoQuestionTimeout: (videoId: string, questionId: string, timeLimit: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTION_TIMEOUT, {
      video_id: videoId,
      question_id: questionId,
      time_limit_seconds: timeLimit,
      ...properties
    }),

  trackVideoQuestionClosed: (videoId: string, questionId: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTION_CLOSED, {
      video_id: videoId,
      question_id: questionId,
      ...properties
    }),

  trackVideoQuestionNavigation: (videoId: string, fromQuestion: string, toQuestion: string, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTION_NAVIGATION, {
      video_id: videoId,
      from_question: fromQuestion,
      to_question: toQuestion,
      ...properties
    }),

  trackVideoQuestionHintUsed: (videoId: string, questionId: string, hintNumber: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTION_HINT_USED, {
      video_id: videoId,
      question_id: questionId,
      hint_number: hintNumber,
      ...properties
    }),

  trackVideoQuestionRetry: (videoId: string, questionId: string, attemptNumber: number, properties?: Record<string, any>) => 
    trackEvent(ANALYTICS_EVENTS.VIDEO_QUESTION_RETRY, {
      video_id: videoId,
      question_id: questionId,
      attempt_number: attemptNumber,
      ...properties
    }),
};

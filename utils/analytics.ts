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
  VIDEO_QUESTION_ANSWERED: 'video_question_answered',
  
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
  
  TEST_STARTED: 'test_started',
  TEST_COMPLETED: 'test_completed',
  TEST_QUESTION_ANSWERED: 'test_question_answered',
  
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

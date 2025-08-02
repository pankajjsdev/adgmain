import { useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  trackEvent, 
  trackScreenView, 
  trackUserAction, 
  trackError, 
  identifyUser,
  ANALYTICS_EVENTS 
} from '@/utils/analytics';

// Hook for general analytics usage
export const useAnalytics = () => {
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    trackEvent(eventName, properties);
  }, []);

  const trackAction = useCallback((action: string, properties?: Record<string, any>) => {
    trackUserAction(action, properties);
  }, []);

  const trackScreen = useCallback((screenName: string, properties?: Record<string, any>) => {
    trackScreenView(screenName, properties);
  }, []);

  const trackErrorEvent = useCallback((error: Error, context?: Record<string, any>) => {
    trackError(error, context);
  }, []);

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    identifyUser(userId, properties);
  }, []);

  return {
    track,
    trackAction,
    trackScreen,
    trackError: trackErrorEvent,
    identify,
    events: ANALYTICS_EVENTS,
  };
};

// Hook for automatic screen tracking
export const useScreenTracking = (screenName: string, properties?: Record<string, any>) => {
  const { trackScreen } = useAnalytics();

  useFocusEffect(
    useCallback(() => {
      trackScreen(screenName, properties);
    }, [screenName, properties, trackScreen])
  );
};

// Hook for tracking component lifecycle events
export const useComponentAnalytics = (componentName: string) => {
  const { track } = useAnalytics();

  useEffect(() => {
    track('component_mounted', { component_name: componentName });

    return () => {
      track('component_unmounted', { component_name: componentName });
    };
  }, [componentName, track]);

  const trackComponentEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    track(eventName, {
      component_name: componentName,
      ...properties,
    });
  }, [componentName, track]);

  return { trackComponentEvent };
};

// Hook for tracking user interactions with debouncing
export const useInteractionTracking = () => {
  const { trackAction } = useAnalytics();

  const trackClick = useCallback((elementName: string, properties?: Record<string, any>) => {
    trackAction('click', {
      element_name: elementName,
      interaction_type: 'click',
      ...properties,
    });
  }, [trackAction]);

  const trackPress = useCallback((elementName: string, properties?: Record<string, any>) => {
    trackAction('press', {
      element_name: elementName,
      interaction_type: 'press',
      ...properties,
    });
  }, [trackAction]);

  const trackSwipe = useCallback((direction: string, elementName?: string, properties?: Record<string, any>) => {
    trackAction('swipe', {
      element_name: elementName,
      interaction_type: 'swipe',
      swipe_direction: direction,
      ...properties,
    });
  }, [trackAction]);

  const trackScroll = useCallback((elementName: string, properties?: Record<string, any>) => {
    trackAction('scroll', {
      element_name: elementName,
      interaction_type: 'scroll',
      ...properties,
    });
  }, [trackAction]);

  return {
    trackClick,
    trackPress,
    trackSwipe,
    trackScroll,
  };
};

// Hook for tracking form interactions
export const useFormTracking = (formName: string) => {
  const { track } = useAnalytics();

  const trackFormStart = useCallback((properties?: Record<string, any>) => {
    track('form_started', {
      form_name: formName,
      ...properties,
    });
  }, [formName, track]);

  const trackFormSubmit = useCallback((properties?: Record<string, any>) => {
    track('form_submitted', {
      form_name: formName,
      ...properties,
    });
  }, [formName, track]);

  const trackFormError = useCallback((error: string, properties?: Record<string, any>) => {
    track('form_error', {
      form_name: formName,
      error_message: error,
      ...properties,
    });
  }, [formName, track]);

  const trackFieldInteraction = useCallback((fieldName: string, action: string, properties?: Record<string, any>) => {
    track('form_field_interaction', {
      form_name: formName,
      field_name: fieldName,
      field_action: action,
      ...properties,
    });
  }, [formName, track]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
    trackFieldInteraction,
  };
};

// Hook for tracking video/media events
export const useMediaTracking = () => {
  const { track } = useAnalytics();

  const trackVideoStart = useCallback((videoId: string, properties?: Record<string, any>) => {
    track(ANALYTICS_EVENTS.VIDEO_STARTED, {
      video_id: videoId,
      ...properties,
    });
  }, [track]);

  const trackVideoComplete = useCallback((videoId: string, duration: number, properties?: Record<string, any>) => {
    track(ANALYTICS_EVENTS.VIDEO_COMPLETED, {
      video_id: videoId,
      video_duration: duration,
      ...properties,
    });
  }, [track]);

  const trackVideoPause = useCallback((videoId: string, currentTime: number, properties?: Record<string, any>) => {
    track(ANALYTICS_EVENTS.VIDEO_PAUSED, {
      video_id: videoId,
      current_time: currentTime,
      ...properties,
    });
  }, [track]);

  const trackVideoSeek = useCallback((videoId: string, fromTime: number, toTime: number, properties?: Record<string, any>) => {
    track(ANALYTICS_EVENTS.VIDEO_SEEKED, {
      video_id: videoId,
      from_time: fromTime,
      to_time: toTime,
      seek_distance: toTime - fromTime,
      ...properties,
    });
  }, [track]);

  const trackVideoQuestion = useCallback((videoId: string, questionId: string, answer: string, isCorrect: boolean, properties?: Record<string, any>) => {
    track(ANALYTICS_EVENTS.VIDEO_QUESTION_ANSWERED, {
      video_id: videoId,
      question_id: questionId,
      user_answer: answer,
      is_correct: isCorrect,
      ...properties,
    });
  }, [track]);

  return {
    trackVideoStart,
    trackVideoComplete,
    trackVideoPause,
    trackVideoSeek,
    trackVideoQuestion,
  };
};

// Hook for tracking navigation events
export const useNavigationTracking = () => {
  const { track } = useAnalytics();

  const trackTabChange = useCallback((fromTab: string, toTab: string, properties?: Record<string, any>) => {
    track(ANALYTICS_EVENTS.TAB_CHANGED, {
      from_tab: fromTab,
      to_tab: toTab,
      ...properties,
    });
  }, [track]);

  const trackNavigationBack = useCallback((fromScreen: string, toScreen: string, properties?: Record<string, any>) => {
    track(ANALYTICS_EVENTS.NAVIGATION_BACK, {
      from_screen: fromScreen,
      to_screen: toScreen,
      ...properties,
    });
  }, [track]);

  const trackDeepLink = useCallback((url: string, properties?: Record<string, any>) => {
    track('deep_link_opened', {
      deep_link_url: url,
      ...properties,
    });
  }, [track]);

  return {
    trackTabChange,
    trackNavigationBack,
    trackDeepLink,
  };
};

export default useAnalytics;

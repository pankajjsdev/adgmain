import { useState, useEffect, useMemo } from 'react';
import { 
  checkFeature, 
  checkFeatures, 
  checkFeatureGroup,
  getEnabledFeatures,
  featureFlagManager,
  FeatureContext,
  FeatureCheckResult
} from '@/utils/featureFlags';

/**
 * Clean Feature Flag Hooks
 * Simple React hooks for feature flag checking
 */

// Hook for checking a single feature flag
export function useFeatureFlag(featureName: string, context?: Partial<FeatureContext>) {
  const contextKey = useMemo(() => JSON.stringify(context), [context]);
  
  const [result, setResult] = useState<FeatureCheckResult>(() => 
    checkFeature(featureName, context)
  );

  useEffect(() => {
    const newResult = checkFeature(featureName, context);
    setResult(newResult);
  }, [featureName, contextKey, context]);

  return {
    enabled: result.enabled,
    result,
    isEnabled: result.enabled,
    reason: result.reason
  };
}

// Hook for checking multiple feature flags
export function useFeatureFlags(featureNames: string[], context?: Partial<FeatureContext>) {
  const featuresKey = useMemo(() => JSON.stringify(featureNames), [featureNames]);
  const contextKey = useMemo(() => JSON.stringify(context), [context]);
  
  const [results, setResults] = useState<Record<string, boolean>>(() => 
    checkFeatures(featureNames, context)
  );

  useEffect(() => {
    const newResults = checkFeatures(featureNames, context);
    setResults(newResults);
  }, [featuresKey, contextKey, featureNames, context]);

  return results;
}

// Hook for checking a feature group
export function useFeatureGroup(groupName: string, context?: Partial<FeatureContext>) {
  const contextKey = useMemo(() => JSON.stringify(context), [context]);
  
  const [results, setResults] = useState<Record<string, boolean>>(() => 
    checkFeatureGroup(groupName, context)
  );

  useEffect(() => {
    const newResults = checkFeatureGroup(groupName, context);
    setResults(newResults);
  }, [groupName, contextKey, context]);

  return results;
}

// Hook for getting all enabled features
export function useEnabledFeatures(context?: Partial<FeatureContext>) {
  const contextKey = useMemo(() => JSON.stringify(context), [context]);
  
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(() => 
    getEnabledFeatures(context)
  );

  useEffect(() => {
    const newEnabledFeatures = getEnabledFeatures(context);
    setEnabledFeatures(newEnabledFeatures);
  }, [contextKey, context]);

  return enabledFeatures;
}

// Hook for feature flag context management
export function useFeatureFlagContext() {
  const [context, setContext] = useState<FeatureContext>(() => 
    featureFlagManager.getContext()
  );

  const updateContext = (newContext: Partial<FeatureContext>) => {
    featureFlagManager.updateContext(newContext);
    setContext(featureFlagManager.getContext());
  };

  return {
    context,
    updateContext
  };
}

// Convenience hooks for specific feature groups

// Authentication features hook
export function useAuthFeatures(context?: Partial<FeatureContext>) {
  return useFeatureGroup('authentication', context);
}

// Video features hook
export function useVideoFeatures(context?: Partial<FeatureContext>) {
  return useFeatureGroup('video', context);
}

// Course management features hook
export function useCourseFeatures(context?: Partial<FeatureContext>) {
  return useFeatureGroup('courseManagement', context);
}

// UI features hook
export function useUIFeatures(context?: Partial<FeatureContext>) {
  return useFeatureGroup('ui', context);
}

// Analytics features hook
export function useAnalyticsFeatures(context?: Partial<FeatureContext>) {
  return useFeatureGroup('analytics', context);
}

// Social features hook
export function useSocialFeatures(context?: Partial<FeatureContext>) {
  return useFeatureGroup('social', context);
}

// Experimental features hook
export function useExperimentalFeatures(context?: Partial<FeatureContext>) {
  return useFeatureGroup('experimental', context);
}

// Platform features hook
export function usePlatformFeatures(context?: Partial<FeatureContext>) {
  return useFeatureGroup('platform', context);
}

// Hook for development debugging
export function useFeatureFlagDebug() {
  const context = featureFlagManager.getContext();
  const enabledFeatures = getEnabledFeatures();
  const allFeatures = featureFlagManager.getAllFeatures();
  const featureGroups = featureFlagManager.getFeatureGroups();

  const debugInfo = {
    context,
    enabledFeatures,
    allFeatures,
    featureGroups,
    enabledCount: enabledFeatures.length,
    totalCount: allFeatures.length
  };

  const logDebugInfo = () => {
    console.log('🏁 Feature Flags Debug Info');
    console.log('Context:', context);
    console.log('Enabled Features:', enabledFeatures);
    console.log('All Features:', allFeatures);
    console.log('Feature Groups:', featureGroups);
    console.log(`Enabled: ${enabledFeatures.length}/${allFeatures.length}`);
  };

  return {
    debugInfo,
    logDebugInfo
  };
}

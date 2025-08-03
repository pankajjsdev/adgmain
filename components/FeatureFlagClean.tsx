import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFeatureFlag, useFeatureFlags, useFeatureGroup } from '@/hooks/useFeatureFlags';
import { FeatureContext } from '@/utils/featureFlags';

/**
 * Clean Feature Flag Components
 * Simple components for feature flag conditional rendering
 */

interface FeatureGateProps {
  feature: string;
  context?: Partial<FeatureContext>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Simple feature gate component
export function FeatureGate({ feature, context, children, fallback = null }: FeatureGateProps) {
  const { enabled } = useFeatureFlag(feature, context);
  
  if (enabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface MultiFeatureGateProps {
  features: string[];
  mode?: 'all' | 'any';
  context?: Partial<FeatureContext>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Multi-feature gate component
export function MultiFeatureGate({ 
  features, 
  mode = 'all', 
  context, 
  children, 
  fallback = null 
}: MultiFeatureGateProps) {
  const results = useFeatureFlags(features, context);
  
  const shouldShow = mode === 'all' 
    ? features.every(feature => results[feature])
    : features.some(feature => results[feature]);
  
  if (shouldShow) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface FeatureGroupGateProps {
  group: string;
  mode?: 'all' | 'any';
  context?: Partial<FeatureContext>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Feature group gate component
export function FeatureGroupGate({ 
  group, 
  mode = 'any', 
  context, 
  children, 
  fallback = null 
}: FeatureGroupGateProps) {
  const results = useFeatureGroup(group, context);
  const features = Object.keys(results);
  
  const shouldShow = mode === 'all' 
    ? features.every(feature => results[feature])
    : features.some(feature => results[feature]);
  
  if (shouldShow) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface ConditionalFeatureProps {
  feature: string;
  context?: Partial<FeatureContext>;
  enabled: React.ReactNode;
  disabled: React.ReactNode;
}

// Conditional feature component
export function ConditionalFeature({ feature, context, enabled, disabled }: ConditionalFeatureProps) {
  const { enabled: isEnabled } = useFeatureFlag(feature, context);
  
  return <>{isEnabled ? enabled : disabled}</>;
}

interface FeatureDebugPanelProps {
  context?: Partial<FeatureContext>;
  showOnlyEnabled?: boolean;
}

// Debug panel for development
export function FeatureDebugPanel({ context, showOnlyEnabled = false }: FeatureDebugPanelProps) {
  if (!__DEV__) {
    return null;
  }

  const allFeatures = [
    'googleSignIn', 'appleSignIn', 'biometricAuth',
    'videoQuestions', 'videoAnalytics', 'videoDownload',
    'assignments', 'tests', 'notes',
    'darkMode', 'customThemes', 'bannerCarousel',
    'analytics', 'crashReporting', 'socialSharing',
    'aiChatbot', 'voiceNotes', 'pushNotifications'
  ];
  
  const results = useFeatureFlags(allFeatures, context);
  const displayFeatures = showOnlyEnabled 
    ? allFeatures.filter(feature => results[feature])
    : allFeatures;

  return (
    <View style={styles.debugPanel}>
      <Text style={styles.debugTitle}>🏁 Feature Flags Debug</Text>
      <ScrollView style={styles.debugScroll}>
        {displayFeatures.map(feature => (
          <View key={feature} style={styles.debugItem}>
            <Text style={[styles.debugFeature, results[feature] ? styles.enabled : styles.disabled]}>
              {results[feature] ? '✅' : '❌'} {feature}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Convenience components for common feature groups

export function AuthFeatureGate({ children, fallback, context }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGroupGate group="authentication" context={context} fallback={fallback}>
      {children}
    </FeatureGroupGate>
  );
}

export function VideoFeatureGate({ children, fallback, context }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGroupGate group="video" context={context} fallback={fallback}>
      {children}
    </FeatureGroupGate>
  );
}

export function ExperimentalFeatureGate({ children, fallback, context }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGroupGate group="experimental" context={context} fallback={fallback}>
      {children}
    </FeatureGroupGate>
  );
}

const styles = StyleSheet.create({
  debugPanel: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    maxHeight: 300,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  debugScroll: {
    maxHeight: 200,
  },
  debugItem: {
    paddingVertical: 4,
  },
  debugFeature: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  enabled: {
    color: '#22c55e',
  },
  disabled: {
    color: '#ef4444',
  },
});

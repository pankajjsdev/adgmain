import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { 
  useFeatureFlag, 
  useFeatureFlags, 
  useAuthFeatures,
  useVideoFeatures,
  useFeatureFlagContext
} from '../hooks/useFeatureFlags';
import { 
  FeatureGate, 
  MultiFeatureGate, 
  ConditionalFeature,
  FeatureDebugPanel 
} from './FeatureFlagSimple';

/**
 * Simple working example of the feature flag system
 * This demonstrates the key functionality without complex styling
 */
export function FeatureFlagExample() {
  const { context, updateContext } = useFeatureFlagContext();

  // Individual feature checks
  const { enabled: hasGoogleAuth } = useFeatureFlag('googleSignIn');
  const { enabled: hasAppleAuth } = useFeatureFlag('appleSignIn');
  const { enabled: hasDarkMode } = useFeatureFlag('darkMode');

  // Feature group checks
  const authFeatures = useAuthFeatures();
  const videoFeatures = useVideoFeatures();

  // Bulk feature checks
  const experimentalFeatures = useFeatureFlags(['aiChatbot', 'voiceNotes']);

  const handleClientSwitch = (clientName: string) => {
    updateContext({ clientName });
    Alert.alert('Client Switched', `Now using ${clientName} configuration`);
  };

  const handleVersionUpdate = (version: string) => {
    updateContext({ appVersion: version });
    Alert.alert('Version Updated', `Now using version ${version}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        
        {/* Header */}
        <Text style={styles.title}>
          🏁 Feature Flag System Example
        </Text>

        {/* Current Context */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Context</Text>
          <Text style={styles.contextText}>Client: {context.clientName}</Text>
          <Text style={styles.contextText}>Version: {context.appVersion}</Text>
          <Text style={styles.contextText}>Platform: {context.platform}</Text>
          <Text style={styles.contextText}>Environment: {context.environment}</Text>
        </View>

        {/* Client Switching */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Switch Client</Text>
          <View style={styles.buttonRow}>
            {['adg', 'techedu', 'skillboost', 'edutech'].map(client => (
              <TouchableOpacity
                key={client}
                style={[
                  styles.button,
                  context.clientName === client && styles.buttonActive
                ]}
                onPress={() => handleClientSwitch(client)}
              >
                <Text style={[
                  styles.buttonText,
                  context.clientName === client && styles.buttonTextActive
                ]}>
                  {client.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Version Switching */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Switch Version</Text>
          <View style={styles.buttonRow}>
            {['1.0.0', '1.2.0', '2.0.0', '3.0.0'].map(version => (
              <TouchableOpacity
                key={version}
                style={[
                  styles.button,
                  context.appVersion === version && styles.buttonActive
                ]}
                onPress={() => handleVersionUpdate(version)}
              >
                <Text style={[
                  styles.buttonText,
                  context.appVersion === version && styles.buttonTextActive
                ]}>
                  v{version}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Individual Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Features</Text>
          <Text style={styles.featureText}>
            Google Sign-In: {hasGoogleAuth ? '✅ Enabled' : '❌ Disabled'}
          </Text>
          <Text style={styles.featureText}>
            Apple Sign-In: {hasAppleAuth ? '✅ Enabled' : '❌ Disabled'}
          </Text>
          <Text style={styles.featureText}>
            Dark Mode: {hasDarkMode ? '✅ Enabled' : '❌ Disabled'}
          </Text>
        </View>

        {/* Feature Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Groups</Text>
          
          <Text style={styles.groupTitle}>Authentication:</Text>
          {Object.entries(authFeatures).map(([feature, enabled]) => (
            <Text key={feature} style={styles.featureText}>
              {feature}: {enabled ? '✅' : '❌'}
            </Text>
          ))}

          <Text style={styles.groupTitle}>Video:</Text>
          {Object.entries(videoFeatures).map(([feature, enabled]) => (
            <Text key={feature} style={styles.featureText}>
              {feature}: {enabled ? '✅' : '❌'}
            </Text>
          ))}

          <Text style={styles.groupTitle}>Experimental:</Text>
          {Object.entries(experimentalFeatures).map(([feature, enabled]) => (
            <Text key={feature} style={styles.featureText}>
              {feature}: {enabled ? '✅' : '❌'}
            </Text>
          ))}
        </View>

        {/* Component Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component Examples</Text>

          {/* Simple Feature Gate */}
          <FeatureGate 
            feature="googleSignIn"
            fallback={
              <View style={styles.disabledFeature}>
                <Text style={styles.disabledText}>🚫 Google Sign-In not available</Text>
              </View>
            }
          >
            <View style={styles.enabledFeature}>
              <Text style={styles.enabledText}>✅ Google Sign-In Available</Text>
            </View>
          </FeatureGate>

          {/* Multi Feature Gate */}
          <MultiFeatureGate 
            features={['appleSignIn', 'biometricAuth']}
            mode="any"
            fallback={
              <View style={styles.disabledFeature}>
                <Text style={styles.disabledText}>🚫 No advanced auth available</Text>
              </View>
            }
          >
            <View style={styles.enabledFeature}>
              <Text style={styles.enabledText}>✅ Advanced auth available</Text>
            </View>
          </MultiFeatureGate>

          {/* Conditional Feature */}
          <ConditionalFeature
            feature="aiChatbot"
            enabled={
              <View style={styles.enabledFeature}>
                <Text style={styles.enabledText}>🤖 AI Chatbot enabled</Text>
              </View>
            }
            disabled={
              <View style={styles.disabledFeature}>
                <Text style={styles.disabledText}>🤖 AI Chatbot disabled</Text>
              </View>
            }
          />
        </View>

        {/* Debug Panel */}
        <FeatureDebugPanel 
          features={['googleSignIn', 'appleSignIn', 'darkMode', 'aiChatbot']}
          groups={['authentication', 'video']}
        />

      </View>
    </ScrollView>
  );
}

/**
 * Practical usage example for existing components
 */
export function PracticalFeatureExample() {
  const authFeatures = useAuthFeatures();
  const { enabled: hasAssignments } = useFeatureFlag('assignments');
  const { enabled: hasTests } = useFeatureFlag('tests');
  const { enabled: hasSocialSharing } = useFeatureFlag('socialSharing');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practical Usage Example</Text>

      {/* Authentication Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Login Options</Text>
        
        {/* Always show email login */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>📧 Email Login</Text>
        </TouchableOpacity>

        {/* Conditionally show other auth methods */}
        {authFeatures.googleSignIn && (
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>🔍 Google Sign-In</Text>
          </TouchableOpacity>
        )}

        {authFeatures.appleSignIn && (
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>🍎 Apple Sign-In</Text>
          </TouchableOpacity>
        )}

        {authFeatures.biometricAuth && (
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>👆 Biometric Auth</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Course Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Actions</Text>
        
        {/* Always available */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📚 View Courses</Text>
        </TouchableOpacity>

        {/* Feature-gated actions */}
        <FeatureGate feature="assignments">
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📝 Assignments</Text>
          </TouchableOpacity>
        </FeatureGate>

        <FeatureGate feature="tests">
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🧪 Tests</Text>
          </TouchableOpacity>
        </FeatureGate>

        <FeatureGate feature="socialSharing">
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🔗 Share Course</Text>
          </TouchableOpacity>
        </FeatureGate>
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <FeatureGate feature="darkMode">
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>🌙 Dark Mode</Text>
          </View>
        </FeatureGate>

        <FeatureGate feature="pushNotifications">
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>🔔 Push Notifications</Text>
          </View>
        </FeatureGate>

        <FeatureGate feature="customThemes">
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>🎨 Custom Themes</Text>
          </View>
        </FeatureGate>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  contextText: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  featureText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginTop: 8,
    marginBottom: 4,
  },
  enabledFeature: {
    backgroundColor: '#D4EDDA',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  enabledText: {
    color: '#155724',
    fontSize: 14,
  },
  disabledFeature: {
    backgroundColor: '#F8D7DA',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  disabledText: {
    color: '#721C24',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  settingText: {
    fontSize: 14,
    color: '#495057',
  },
});

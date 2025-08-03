import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getClientConfig, getAvailableClients } from '@/utils/clientConfig';
import { AppInitializerUtils } from './AppInitializer';

export default function ClientBrandingTest() {
  const [selectedClient, setSelectedClient] = useState('adg');
  const clientConfig = getClientConfig();
  const availableClients = getAvailableClients();

  const handleResetOnboarding = async () => {
    try {
      await AppInitializerUtils.resetOnboarding(selectedClient);
      Alert.alert('Success', `Onboarding reset for ${selectedClient}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset onboarding');
    }
  };

  const handleResetAllOnboarding = async () => {
    try {
      await AppInitializerUtils.resetAllOnboarding();
      Alert.alert('Success', 'All onboarding data reset');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset all onboarding');
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const status = await AppInitializerUtils.checkOnboardingStatus(selectedClient);
      Alert.alert('Onboarding Status', `${selectedClient}: ${status ? 'Completed' : 'Not completed'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to check onboarding status');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Client Branding Test</Text>

        {/* Current Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Client Configuration</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{clientConfig.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Display Name:</Text>
            <Text style={styles.value}>{clientConfig.displayName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Primary Color:</Text>
            <View style={[styles.colorBox, { backgroundColor: clientConfig.colors.primary }]} />
            <Text style={styles.value}>{clientConfig.colors.primary}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>API Base:</Text>
            <Text style={styles.value}>{clientConfig.api.baseUrl}</Text>
          </View>
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Flags</Text>
          
          <View style={styles.featureRow}>
            <Text style={styles.label}>Social Login:</Text>
            <View style={[styles.statusBadge, { backgroundColor: clientConfig.features.socialLogin ? '#4CAF50' : '#F44336' }]}>
              <Text style={styles.badgeText}>
                {clientConfig.features.socialLogin ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <Text style={styles.label}>Dark Mode:</Text>
            <View style={[styles.statusBadge, { backgroundColor: clientConfig.features.darkMode ? '#4CAF50' : '#F44336' }]}>
              <Text style={styles.badgeText}>
                {clientConfig.features.darkMode ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <Text style={styles.label}>Biometric Auth:</Text>
            <View style={[styles.statusBadge, { backgroundColor: clientConfig.features.biometricAuth ? '#4CAF50' : '#F44336' }]}>
              <Text style={styles.badgeText}>
                {clientConfig.features.biometricAuth ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>

        {/* Onboarding Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Onboarding Configuration</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Enabled:</Text>
            <Text style={styles.value}>
              {clientConfig.onboarding?.enabled ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Screens:</Text>
            <Text style={styles.value}>
              {clientConfig.onboarding?.screens?.length || 0}
            </Text>
          </View>
        </View>

        {/* Splash Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Splash Screen Configuration</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Enabled:</Text>
            <Text style={styles.value}>
              {clientConfig.splash ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Animation:</Text>
            <Text style={styles.value}>
              {clientConfig.splash?.animationType || 'fade'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>
              {clientConfig.splash?.duration || 2000}ms
            </Text>
          </View>
        </View>

        {/* Google OAuth Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google OAuth Configuration</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Web Client ID:</Text>
            <Text style={[styles.value, styles.smallText]} numberOfLines={1}>
              {clientConfig.googleAuth?.webClientId || 'Not configured'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>iOS Client ID:</Text>
            <Text style={[styles.value, styles.smallText]} numberOfLines={1}>
              {clientConfig.googleAuth?.iosClientId || 'Not configured'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Android Client ID:</Text>
            <Text style={[styles.value, styles.smallText]} numberOfLines={1}>
              {clientConfig.googleAuth?.androidClientId || 'Not configured'}
            </Text>
          </View>
        </View>

        {/* Client Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Other Clients</Text>
          
          <View style={styles.clientGrid}>
            {availableClients.map((client) => (
              <TouchableOpacity
                key={client}
                style={[
                  styles.clientButton,
                  {
                    backgroundColor: selectedClient === client ? clientConfig.colors.primary : '#E0E0E0',
                  }
                ]}
                onPress={() => setSelectedClient(client)}
              >
                <Text style={[
                  styles.clientButtonText,
                  { color: selectedClient === client ? '#FFFFFF' : '#333333' }
                ]}>
                  {client.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Test Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={checkOnboardingStatus}
          >
            <Text style={styles.buttonText}>Check Onboarding Status</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleResetOnboarding}
          >
            <Text style={[styles.buttonText, { color: '#333333' }]}>Reset Onboarding for {selectedClient}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleResetAllOnboarding}
          >
            <Text style={styles.buttonText}>Reset All Onboarding</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
    textAlign: 'right',
  },
  smallText: {
    fontSize: 12,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginHorizontal: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  clientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  clientButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  clientButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClientConfig } from '@/utils/clientConfig';
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';

interface AppInitializerProps {
  children: React.ReactNode;
}

type InitializationState = 'splash' | 'onboarding' | 'complete';

export default function AppInitializer({ children }: AppInitializerProps) {
  const [initState, setInitState] = useState<InitializationState>('splash');
  const [isReady, setIsReady] = useState(false);
  
  const clientConfig = getClientConfig();

  // Check if onboarding has been completed for this client
  const checkOnboardingStatus = useCallback(async () => {
    try {
      const onboardingKey = `onboarding_completed_${clientConfig.name}`;
      const completed = await AsyncStorage.getItem(onboardingKey);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }, [clientConfig.name]);

  // Mark onboarding as completed for this client
  const markOnboardingComplete = useCallback(async () => {
    try {
      const onboardingKey = `onboarding_completed_${clientConfig.name}`;
      await AsyncStorage.setItem(onboardingKey, 'true');
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  }, [clientConfig.name]);

  // Handle splash screen completion
  const handleSplashComplete = useCallback(async () => {
    // Check if we need to show onboarding
    const onboardingCompleted = await checkOnboardingStatus();
    
    if (clientConfig.onboarding?.enabled && !onboardingCompleted) {
      setInitState('onboarding');
    } else {
      setInitState('complete');
      setIsReady(true);
    }
  }, [clientConfig.onboarding?.enabled, checkOnboardingStatus]);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(async () => {
    await markOnboardingComplete();
    setInitState('complete');
    setIsReady(true);
  }, [markOnboardingComplete]);

  // Initialize the app state
  useEffect(() => {
    const initializeApp = async () => {
      await handleSplashComplete();
    };

    initializeApp();
  }, [handleSplashComplete]);

  // Render based on current initialization state
  if (!isReady) {
    switch (initState) {
      case 'splash':
        return <SplashScreen onAnimationComplete={handleSplashComplete} />;
      
      case 'onboarding':
        if (clientConfig.onboarding?.enabled) {
          return <OnboardingScreen onComplete={handleOnboardingComplete} />;
        }
        // If onboarding is disabled, fall through to complete
        break;
      
      case 'complete':
      default:
        setIsReady(true);
        break;
    }
  }

  // App is ready, render children
  return <View style={{ flex: 1 }}>{children}</View>;
}

// Export utility functions for manual control
export const AppInitializerUtils = {
  /**
   * Reset onboarding for a specific client (useful for testing)
   */
  resetOnboarding: async (clientName: string) => {
    try {
      const onboardingKey = `onboarding_completed_${clientName}`;
      await AsyncStorage.removeItem(onboardingKey);
      console.log(`Onboarding reset for client: ${clientName}`);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  },

  /**
   * Reset onboarding for all clients
   */
  resetAllOnboarding: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const onboardingKeys = keys.filter(key => key.startsWith('onboarding_completed_'));
      await AsyncStorage.multiRemove(onboardingKeys);
      console.log('All onboarding data reset');
    } catch (error) {
      console.error('Error resetting all onboarding:', error);
    }
  },

  /**
   * Check onboarding status for a specific client
   */
  checkOnboardingStatus: async (clientName: string) => {
    try {
      const onboardingKey = `onboarding_completed_${clientName}`;
      const completed = await AsyncStorage.getItem(onboardingKey);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const ONBOARDING_STORAGE_KEY = 'has-seen-onboarding';
const ONBOARDING_ASYNC_STORAGE_KEY = '@adg_onboarding_completed';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  loading: boolean;
  isInitialized: boolean;
  checkOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>; // For testing purposes
}

// Helper function to safely get onboarding status with fallback
const getOnboardingStatus = async (): Promise<boolean> => {
  try {
    // Try SecureStore first
    const secureValue = await SecureStore.getItemAsync(ONBOARDING_STORAGE_KEY);
    if (secureValue !== null) {
      console.log('📱 SecureStore value:', secureValue);
      return secureValue === 'true';
    }
  } catch (secureError) {
    console.warn('⚠️ SecureStore failed, trying AsyncStorage fallback:', secureError);
  }

  try {
    // Fallback to AsyncStorage
    const asyncValue = await AsyncStorage.getItem(ONBOARDING_ASYNC_STORAGE_KEY);
    if (asyncValue !== null) {
      console.log('📱 AsyncStorage fallback value:', asyncValue);
      return asyncValue === 'true';
    }
  } catch (asyncError) {
    console.warn('⚠️ AsyncStorage also failed:', asyncError);
  }

  // Default to false if both storage methods fail
  console.log('📱 No stored value found, defaulting to false');
  return false;
};

// Helper function to safely save onboarding status with fallback
const saveOnboardingStatus = async (completed: boolean): Promise<void> => {
  const value = completed ? 'true' : 'false';
  let secureStoreSaved = false;
  let asyncStorageSaved = false;

  try {
    await SecureStore.setItemAsync(ONBOARDING_STORAGE_KEY, value);
    secureStoreSaved = true;
    console.log('✅ SecureStore save successful');
  } catch (secureError) {
    console.warn('⚠️ SecureStore save failed, using AsyncStorage fallback:', secureError);
  }

  try {
    await AsyncStorage.setItem(ONBOARDING_ASYNC_STORAGE_KEY, value);
    asyncStorageSaved = true;
    console.log('✅ AsyncStorage save successful');
  } catch (asyncError) {
    console.warn('⚠️ AsyncStorage save failed:', asyncError);
  }

  if (!secureStoreSaved && !asyncStorageSaved) {
    throw new Error('Failed to save onboarding status to any storage method');
  }
};

const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasSeenOnboarding: false,
  loading: true,
  isInitialized: false,

  checkOnboardingStatus: async () => {
    const state = get();
    
    // Prevent multiple simultaneous initialization calls
    if (state.isInitialized && !state.loading) {
      console.log('🔄 Onboarding status already initialized, skipping...');
      return;
    }

    set({ loading: true });
    try {
      console.log('🔍 Checking onboarding status...');
      const isComplete = await getOnboardingStatus();
      console.log('✅ Onboarding complete:', isComplete);
      
      set({ 
        hasSeenOnboarding: isComplete,
        loading: false,
        isInitialized: true
      });
    } catch (error) {
      console.error('❌ Failed to check onboarding status:', error);
      set({ 
        hasSeenOnboarding: false, 
        loading: false,
        isInitialized: true
      });
    }
  },

  completeOnboarding: async () => {
    try {
      console.log('💾 Saving onboarding completion...');
      await saveOnboardingStatus(true);
      console.log('✅ Onboarding status saved successfully');
      
      // Verify the save worked by checking both storage methods
      const isComplete = await getOnboardingStatus();
      console.log('🔍 Verification check:', isComplete);
      
      if (isComplete) {
        console.log('✅ Onboarding completion verified');
        set({ hasSeenOnboarding: true });
      } else {
        console.error('❌ Onboarding save verification failed');
        throw new Error('Failed to verify onboarding save');
      }
    } catch (error) {
      console.error('❌ Failed to save onboarding status:', error);
      console.error('📱 This might be a storage permission or availability issue');
      // Don't update state if save failed to prevent showing onboarding again
      throw error;
    }
  },

  resetOnboarding: async () => {
    try {
      console.log('🔄 Resetting onboarding status...');
      
      // Clear from both storage methods
      try {
        await SecureStore.deleteItemAsync(ONBOARDING_STORAGE_KEY);
        console.log('✅ SecureStore cleared');
      } catch (secureError) {
        console.warn('⚠️ Failed to clear SecureStore:', secureError);
      }
      
      try {
        await AsyncStorage.removeItem(ONBOARDING_ASYNC_STORAGE_KEY);
        console.log('✅ AsyncStorage cleared');
      } catch (asyncError) {
        console.warn('⚠️ Failed to clear AsyncStorage:', asyncError);
      }
      
      set({ 
        hasSeenOnboarding: false,
        isInitialized: false // Reset initialization flag
      });
      console.log('✅ Onboarding reset complete');
    } catch (error) {
      console.error('❌ Failed to reset onboarding status:', error);
      throw error;
    }
  },
}));

export default useOnboardingStore;

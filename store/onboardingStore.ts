import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const ONBOARDING_STORAGE_KEY = 'has-seen-onboarding';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  loading: boolean;
  checkOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>; // For testing purposes
}

const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasSeenOnboarding: false,
  loading: true,

  checkOnboardingStatus: async () => {
    set({ loading: true });
    try {
      const hasSeenOnboarding = await SecureStore.getItemAsync(ONBOARDING_STORAGE_KEY);
      set({ 
        hasSeenOnboarding: hasSeenOnboarding === 'true',
        loading: false 
      });
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      set({ hasSeenOnboarding: false, loading: false });
    }
  },

  completeOnboarding: async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_STORAGE_KEY, 'true');
      set({ hasSeenOnboarding: true });
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  },

  resetOnboarding: async () => {
    try {
      await SecureStore.deleteItemAsync(ONBOARDING_STORAGE_KEY);
      set({ hasSeenOnboarding: false });
    } catch (error) {
      console.error('Failed to reset onboarding status:', error);
    }
  },
}));

export default useOnboardingStore;

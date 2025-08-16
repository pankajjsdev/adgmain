import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_FEATURE_FLAGS,
} from '@/types/featureFlags';
import {
  fetchFeatureFlags,
  clearFeatureFlagsCache,
  initializeFeatureFlags,
  isFeatureEnabled,
  getFeatureFlags,
  logFeatureFlagUsage,
  mergeWithDefaults,
} from '@/utils/featureFlags';

interface FeatureFlagState {
  // State
  flags: Record<string, boolean>;
  isLoading: boolean;
  isInitialized: boolean;
  lastFetchTime: number | null;
  error: string | null;
  
  // Actions
  initializeFlags: () => Promise<void>;
  refreshFlags: (forceRefresh?: boolean) => Promise<void>;
  isFeatureEnabled: (flagKey: string, logUsage?: boolean, context?: string) => boolean;
  getMultipleFlags: (flagKeys: string[]) => Record<string, boolean>;
  clearCache: () => Promise<void>;
  setFlags: (flags: Record<string, boolean>) => void;
  
  // Dev/Testing actions
  overrideFlag: (flagKey: string, value: boolean) => void;
  resetToDefaults: () => void;
  
  // Getters
  getAllFlags: () => Record<string, boolean>;
  getEnabledFlags: () => string[];
  getDisabledFlags: () => string[];
  getFlagCount: () => { total: number; enabled: number; disabled: number };
}

export const useFeatureFlagStore = create<FeatureFlagState>()(
  persist(
    (set, get) => ({
      // Initial state
      flags: DEFAULT_FEATURE_FLAGS,
      isLoading: false,
      isInitialized: false,
      lastFetchTime: null,
      error: null,

      // Initialize feature flags system
      initializeFlags: async () => {
        const state = get();
        if (state.isInitialized && !state.error) {
          console.log('🏁 Feature flags already initialized');
          return;
        }

        set({ isLoading: true, error: null });

        try {
          console.log('🚀 Initializing feature flags...');
          const flags = await initializeFeatureFlags();
          
          set({
            flags,
            isLoading: false,
            isInitialized: true,
            lastFetchTime: Date.now(),
            error: null,
          });

          console.log('✅ Feature flags initialized in store');
        } catch (error) {
          console.error('❌ Failed to initialize feature flags:', error);
          
          set({
            flags: DEFAULT_FEATURE_FLAGS,
            isLoading: false,
            isInitialized: true,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      // Refresh feature flags from API
      refreshFlags: async (forceRefresh = false) => {
        set({ isLoading: true, error: null });

        try {
          console.log('🔄 Refreshing feature flags...', { forceRefresh });
          
          let flags = await fetchFeatureFlags(forceRefresh);
          flags = mergeWithDefaults(flags);
          
          set({
            flags,
            isLoading: false,
            lastFetchTime: Date.now(),
            error: null,
          });

          console.log('✅ Feature flags refreshed successfully');
        } catch (error) {
          console.error('❌ Failed to refresh feature flags:', error);
          
          // Keep existing flags on error, don't reset to defaults
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      // Check if a feature flag is enabled
      isFeatureEnabled: (flagKey: string, logUsage = true, context?: string) => {
        const { flags } = get();
        const enabled = isFeatureEnabled(flagKey, flags);
        
        if (logUsage) {
          logFeatureFlagUsage(flagKey, enabled, context);
        }
        
        return enabled;
      },

      // Get multiple feature flags at once
      getMultipleFlags: (flagKeys: string[]) => {
        const { flags } = get();
        return getFeatureFlags(flagKeys, flags);
      },

      // Clear feature flags cache
      clearCache: async () => {
        try {
          await clearFeatureFlagsCache();
          console.log('🗑️ Feature flags cache cleared from store');
        } catch (error) {
          console.error('❌ Failed to clear feature flags cache:', error);
        }
      },

      // Set flags directly (for testing or manual override)
      setFlags: (flags: Record<string, boolean>) => {
        const mergedFlags = mergeWithDefaults(flags);
        set({ flags: mergedFlags });
        console.log('🔧 Feature flags updated manually');
      },

      // Override a specific flag (for development/testing)
      overrideFlag: (flagKey: string, value: boolean) => {
        const { flags } = get();
        const updatedFlags = { ...flags, [flagKey]: value };
        
        set({ flags: updatedFlags });
        console.log(`🔧 Feature flag overridden: ${flagKey} = ${value}`);
      },

      // Reset to default flags
      resetToDefaults: () => {
        set({ 
          flags: DEFAULT_FEATURE_FLAGS,
          error: null,
        });
        console.log('🔄 Feature flags reset to defaults');
      },

      // Get all flags
      getAllFlags: () => {
        return get().flags;
      },

      // Get list of enabled flags
      getEnabledFlags: () => {
        const { flags } = get();
        return Object.entries(flags)
          .filter(([_, enabled]) => enabled)
          .map(([key]) => key);
      },

      // Get list of disabled flags
      getDisabledFlags: () => {
        const { flags } = get();
        return Object.entries(flags)
          .filter(([_, enabled]) => !enabled)
          .map(([key]) => key);
      },

      // Get flag statistics
      getFlagCount: () => {
        const { flags } = get();
        const entries = Object.entries(flags);
        const enabled = entries.filter(([_, value]) => value).length;
        
        return {
          total: entries.length,
          enabled,
          disabled: entries.length - enabled,
        };
      },
    }),
    {
      name: 'feature-flags-storage',
      storage: {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('Error reading feature flags from storage:', error);
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Error saving feature flags to storage:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing feature flags from storage:', error);
          }
        },
      },
      // Only persist flags and lastFetchTime, not loading states
      partialize: (state) => ({
        flags: state.flags,
        lastFetchTime: state.lastFetchTime,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// Selector hooks for better performance
export const useFeatureFlag = (flagKey: string, context?: string) => {
  return useFeatureFlagStore((state) => 
    state.isFeatureEnabled(flagKey, true, context)
  );
};

export const useMultipleFeatureFlags = (flagKeys: string[]) => {
  return useFeatureFlagStore((state) => 
    state.getMultipleFlags(flagKeys)
  );
};

export const useFeatureFlagStats = () => {
  return useFeatureFlagStore((state) => ({
    stats: state.getFlagCount(),
    isLoading: state.isLoading,
    error: state.error,
    lastFetchTime: state.lastFetchTime,
    isInitialized: state.isInitialized,
  }));
};

// Development helpers
export const useFeatureFlagDev = () => {
  const store = useFeatureFlagStore((state) => ({
    overrideFlag: state.overrideFlag,
    resetToDefaults: state.resetToDefaults,
    getAllFlags: state.getAllFlags,
    clearCache: state.clearCache,
  }));

  if (!__DEV__) {
    return {
      overrideFlag: () => console.warn('Feature flag override only available in development'),
      resetToDefaults: () => console.warn('Feature flag reset only available in development'),
      getAllFlags: () => ({}),
      clearCache: () => console.warn('Feature flag cache clear only available in development'),
    };
  }

  return store;
};

export default useFeatureFlagStore;

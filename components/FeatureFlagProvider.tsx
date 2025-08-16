import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useFeatureFlagStore } from '@/store/featureFlagStore';

interface FeatureFlagContextType {
  isFeatureEnabled: (flagKey: string) => boolean;
  getAllFlags: () => Record<string, boolean>;
  refreshFlags: () => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

interface FeatureFlagProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
}

/**
 * Feature Flag Provider Component
 * Provides feature flag context to the entire app
 */
export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  children,
  autoInitialize = true,
}) => {
  const store = useFeatureFlagStore();

  useEffect(() => {
    if (autoInitialize && !store.isInitialized) {
      console.log('🏁 Auto-initializing feature flags from provider');
      store.initializeFlags();
    }
  }, [autoInitialize, store.isInitialized, store.initializeFlags]);

  const contextValue: FeatureFlagContextType = {
    isFeatureEnabled: (flagKey: string) => store.isFeatureEnabled(flagKey, false),
    getAllFlags: store.getAllFlags,
    refreshFlags: () => store.refreshFlags(true),
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

/**
 * Hook to use feature flag context
 */
export const useFeatureFlagContext = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  
  if (!context) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }
  
  return context;
};

/**
 * Higher-Order Component for feature flag gating
 */
export const withFeatureFlag = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  flagKey: string,
  fallbackComponent?: React.ComponentType<P> | null
) => {
  const WithFeatureFlagComponent: React.FC<P> = (props) => {
    const { isFeatureEnabled } = useFeatureFlagContext();
    
    if (isFeatureEnabled(flagKey)) {
      return <WrappedComponent {...props} />;
    }
    
    if (fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
  
  WithFeatureFlagComponent.displayName = `withFeatureFlag(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithFeatureFlagComponent;
};

/**
 * Component for conditional rendering based on feature flags
 */
interface FeatureGateProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  flag,
  children,
  fallback = null,
  context,
}) => {
  const store = useFeatureFlagStore();
  const isEnabled = store.isFeatureEnabled(flag, true, context);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component for feature flag debugging (dev only)
 */
export const FeatureFlagDebugPanel: React.FC = () => {
  const store = useFeatureFlagStore();
  const flags = store.getAllFlags();
  const stats = store.getFlagCount();

  if (!__DEV__) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: 10,
      borderRadius: 5,
      fontSize: 12,
      maxHeight: 300,
      overflow: 'auto',
      zIndex: 9999,
    }}>
      <h4>🏁 Feature Flags Debug</h4>
      <p>Total: {stats.total} | Enabled: {stats.enabled} | Disabled: {stats.disabled}</p>
      <div style={{ maxHeight: 200, overflow: 'auto' }}>
        {Object.entries(flags).map(([key, value]) => (
          <div key={key} style={{ margin: '2px 0' }}>
            {value ? '✅' : '❌'} {key}
          </div>
        ))}
      </div>
      <button 
        onClick={() => store.refreshFlags(true)}
        style={{ marginTop: 5, padding: '2px 5px' }}
      >
        Refresh
      </button>
    </div>
  );
};

export default FeatureFlagProvider;

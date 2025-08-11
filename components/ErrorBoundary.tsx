import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import * as Analytics from '@/utils/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'global' | 'component' | 'feature';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

// Global Error Boundary
export class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = 'global', onError } = this.props;
    
    console.error('🚨 Error Boundary Caught:', error);
    console.error('📍 Error Info:', errorInfo);
    
    // Generate error report
    const errorReport = {
      error_id: this.state.errorId,
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack,
      error_boundary_level: level,
      retry_count: this.retryCount,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location?.href || 'mobile-app'
    };

    // Track error in analytics
    Analytics.trackEvent('ERROR_BOUNDARY_TRIGGERED', errorReport);

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Store error for crash reporting
    this.reportToCrashlytics(errorReport);

    this.setState({ errorInfo });
  }

  private reportToCrashlytics = (errorReport: any) => {
    // This would integrate with your crash reporting service
    console.log('📊 Reporting to crash analytics:', errorReport);
    
    // Example: Firebase Crashlytics integration
    // crashlytics().recordError(errorReport.error_message);
    // crashlytics().setAttributes(errorReport);
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      
      Analytics.trackEvent('ERROR_BOUNDARY_RETRY', {
        error_id: this.state.errorId,
        retry_count: this.retryCount
      });
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      });
    }
  };

  private handleReload = () => {
    Analytics.trackEvent('ERROR_BOUNDARY_RELOAD', {
      error_id: this.state.errorId
    });
    
    // For web
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    // For React Native, you might want to restart the app
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      
      if (fallback) {
        return fallback;
      }

      return <ErrorFallbackUI 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        retryCount={this.retryCount}
        maxRetries={this.maxRetries}
        onRetry={this.handleRetry}
        onReload={this.handleReload}
      />;
    }

    return this.props.children;
  }
}

// Error Fallback UI Component
const ErrorFallbackUI: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReload: () => void;
}> = ({ error, errorInfo, errorId, retryCount, maxRetries, onRetry, onReload }) => {
  const { colors } = useGlobalStyles();
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background.primary,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <View style={{
        backgroundColor: colors.surface.card,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center'
      }}>
        <Ionicons 
          name="warning-outline" 
          size={64} 
          color={colors.status.error} 
          style={{ marginBottom: 16 }}
        />
        
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: 8
        }}>
          Oops! Something went wrong
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: colors.text.secondary,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 24
        }}>
          We encountered an unexpected error. Don't worry, we're working to fix it!
        </Text>

        {errorId && (
          <Text style={{
            fontSize: 12,
            color: colors.text.secondary,
            fontFamily: 'monospace',
            marginBottom: 16
          }}>
            Error ID: {errorId}
          </Text>
        )}

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          {retryCount < maxRetries && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.brand.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                flex: 1
              }}
              onPress={onRetry}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Try Again ({maxRetries - retryCount} left)
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={{
              backgroundColor: colors.surface.overlay,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              flex: 1
            }}
            onPress={onReload}
          >
            <Text style={{
              color: colors.text.primary,
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Reload App
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16
          }}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={{
            color: colors.brand.primary,
            fontSize: 14,
            textAlign: 'center'
          }}>
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </Text>
        </TouchableOpacity>

        {showDetails && (
          <ScrollView style={{
            maxHeight: 200,
            width: '100%',
            marginTop: 16,
            backgroundColor: colors.surface.overlay,
            borderRadius: 8,
            padding: 12
          }}>
            <Text style={{
              fontSize: 12,
              color: colors.text.secondary,
              fontFamily: 'monospace'
            }}>
              {error?.message}
              {'\n\n'}
              {error?.stack}
              {'\n\n'}
              Component Stack:
              {errorInfo?.componentStack}
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// Component-level Error Boundary
export const ComponentErrorBoundary: React.FC<Props> = ({ children, ...props }) => (
  <GlobalErrorBoundary {...props} level="component">
    {children}
  </GlobalErrorBoundary>
);

// Feature-level Error Boundary
export const FeatureErrorBoundary: React.FC<Props> = ({ children, ...props }) => (
  <GlobalErrorBoundary {...props} level="feature">
    {children}
  </GlobalErrorBoundary>
);

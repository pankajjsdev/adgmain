import { initializeApi } from '@/api';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useAuthStore from '@/store/authStore';
import useOnboardingStore from '@/store/onboardingStore';
import {
  Urbanist_300Light,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { styles, colors } = useGlobalStyles();
  
  // Load Urbanist fonts
  const [fontsLoaded] = useFonts({
    'Urbanist-Light': Urbanist_300Light,
    'Urbanist-Regular': Urbanist_400Regular,
    'Urbanist-Medium': Urbanist_500Medium,
    'Urbanist-SemiBold': Urbanist_600SemiBold,
    'Urbanist-Bold': Urbanist_700Bold,
    'Urbanist-ExtraBold': Urbanist_800ExtraBold,
    'Urbanist': Urbanist_400Regular, // Default
  });
  
  const { 
    isAuthenticated, 
    loading: authLoading, 
    error: authError,
    initializeAuth,
    clearError 
  } = useAuthStore();
  const { hasSeenOnboarding, loading: onboardingLoading, checkOnboardingStatus } = useOnboardingStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  const initialize = useCallback(async () => {
    try {
      console.log('🚀 Starting app initialization...');
      setIsInitializing(true);
      setShowRetry(false);
      
      // Initialize API first
      await initializeApi();
      
      // Check onboarding status first
      await checkOnboardingStatus();
      
      // Then initialize auth
      await initializeAuth();
      
      console.log('✅ App initialization complete');
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('❌ App initialization failed:', error);
      
      // Show retry option for network errors
      if (!error.statusCode || error.message?.includes('Network')) {
        setShowRetry(true);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [checkOnboardingStatus, initializeAuth]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    clearError();
    initialize();
  }, [initialize, clearError]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading indicator while initializing, loading fonts, or checking auth status
  if (!fontsLoaded || isInitializing || authLoading || onboardingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>
          {isInitializing ? 'Initializing app...' : 'Loading...'}
        </Text>
        
        {/* Show retry button if there's an error and we're not currently loading */}
        {showRetry && !isInitializing && (
          <TouchableOpacity 
            style={[styles.buttonPrimary, { marginTop: 20 }]} 
            onPress={handleRetry}
          >
            <Text style={styles.buttonTextPrimary}>
              Retry {retryCount > 0 ? `(${retryCount})` : ''}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Show error message if available */}
        {authError && !isInitializing && (
          <Text style={[styles.textSecondary, { marginTop: 10, textAlign: 'center' }]}>
            {authError}
          </Text>
        )}
      </View>
    );
  }

  // Show onboarding if user hasn't seen it yet
  if (!hasSeenOnboarding) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  // Show auth screens if user has seen onboarding but is not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaView>
    );
  }

  // Render the main app if user has completed onboarding and is authenticated
  return (
    // <SafeAreaView style={styles.safeContainer}>
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerTintColor: colors.text.primary,
            headerStyle: {
              backgroundColor: colors.surface.primary,
            },
            headerTitleStyle: {
              fontWeight: '600',
              color: colors.text.primary,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(root)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    {/* </SafeAreaView> */}
    </>
  );
}

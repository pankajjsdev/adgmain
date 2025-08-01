import useAuthStore from '@/store/authStore'; // Adjust import path
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react'; // Import useEffect
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native'; // Import Text

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading, initializeAuth, user } = useAuthStore(); // Get user from store

  useEffect(() => {
    initializeAuth(); // Initialize auth state on app startup
  }, []);

  // Show a loading indicator while checking auth status
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
         <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // Render the main app if authenticated
  return (
    <SafeAreaView style={styles.container}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerBackTitleVisible: false,
            headerTintColor: '#000',
            // Default headerTitle - will be overridden by individual screens
            headerTitle: 'App', // Default title
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Custom headerTitle for authenticated users */}
          {user && (
             <Stack.Screen
                name="index" // Assuming your main app route after login is index.tsx or similar
                options={{
                   headerTitle: () => (
                      <View>
                         <Text>Welcome, {user.email || 'User'}</Text> {/* Display user email or a default */}
                      </View>
                   ),
                }}
             />
          )}
          
          {/* Your Quick Links pages and other protected routes */}
          <Stack.Screen name="courses/index" options={{ title: 'Available Courses' }} />
          <Stack.Screen name="analytics/index" options={{ title: 'Analytics' }} />
          <Stack.Screen name="forum/index" options={{ title: 'Forum' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet, useColorScheme } from 'react-native';

import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={styles.container}> {/* Wrap with SafeAreaView */}
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            // You can customize header styles here for all screens in this stack
            headerShown: true, // Ensure headers are shown for screens outside tabs
            headerBackTitleVisible: false, // Hide the title next to the back button
            headerTintColor: '#000', // Set the color of the back button and title
            // Add other header options as needed
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          {/* Your Quick Links pages will also be part of this stack */}
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
});
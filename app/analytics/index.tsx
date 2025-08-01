import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Analytics' }} /> {/* Define header here */}
      <Text style={styles.title}>Analytics Page</Text>
      {/* Add your content for the Analytics page here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
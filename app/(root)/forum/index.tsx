import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function ForumScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Forum' }} /> {/* Define header here */}
      <Text style={styles.title}>Forum Page - Coming Soon!</Text>
      {/* Add your content for the Forum page here */}
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
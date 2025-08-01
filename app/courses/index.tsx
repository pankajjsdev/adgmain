import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function CoursesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Courses' }} /> {/* Define header here */}
      <Text style={styles.title}>Courses Page</Text>
      {/* Add your content for the Courses page here */}
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
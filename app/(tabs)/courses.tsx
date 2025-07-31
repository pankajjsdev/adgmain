import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'; // Import SafeAreaView
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function CoursesScreen() {
  return (
    <SafeAreaView style={styles.container}> {/* Wrap with SafeAreaView */}
      <ThemedView style={styles.innerContainer}> {/* Add an inner container if needed for padding/centering */}
        <ThemedText type="title">Courses Screen</ThemedText>
        <ThemedText>Content for the Courses page goes here.</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});